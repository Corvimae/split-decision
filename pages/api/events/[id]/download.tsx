import { Request, Response } from 'express';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import { Parser } from 'json2csv';
import { format, utcToZonedTime } from 'date-fns-tz';
import { prisma } from '../../../../utils/db';
import { authOptions } from '../../auth/[...nextauth]';

interface DateSegment {
  date: string;
  start: number;
  end: number;
}

interface ExportedSubmissionRow {
  userName: string;
  pronouns: string;
  showPronouns: string;
  availability: string;
  gameTitle: string;
  platform: string;
  description: string;
  primaryGenre: string;
  secondaryGenre: string;
  technicalNotes: string;
  contentWarning: string;
  flashingLights: string;
}

interface ExportedCategory {
  index: number;
  categoryName: string;
  url: string;
  estimate: string;
  description: string;
}

const EXPORTED_SUBMISSION_FIELDS: [keyof ExportedSubmissionRow, string][] = [
  ['userName', 'Runner'],
  ['pronouns', 'Pronouns'],
  ['showPronouns', 'Show pronouns?'],
  ['availability', 'Availability'],
  ['gameTitle', 'Game Title'],
  ['platform', 'Platform'],
  ['description', 'Description'],
  ['primaryGenre', 'Primary Genre'],
  ['secondaryGenre', 'Secondary Genre'],
  ['technicalNotes', 'Technical Notes'],
  ['contentWarning', 'Content Warning'],
  ['flashingLights', 'Flashing Lights'],
];

const EXPORTED_CATEGORY_FIELDS: [keyof ExportedCategory, string][] = [
  ['categoryName', 'Category $1'],
  ['url', 'Cat. $1 Video'],
  ['estimate', 'Cat. $1 Estimate'],
  ['description', 'Cat. $1 Description'],
];

export default async function handle(req: Request, res: Response) {
  if (req.method === 'GET') {
    try {
      const session = await unstable_getServerSession(req, res, authOptions);

      if (!session) {
        res.status(401).json({ message: 'You must be logged in.' });
  
        return;
      }

      if (!session.user.isAdmin) {
        res.status(401).json({ message: 'You are not an administrator.' });
  
        return;
      }
      
      if (!req.query.id) {
        res.status(400).json({ message: 'Event ID is required' });
  
        return;
      }
       
      // Get existing record and ensure that it belongs to this user.
      const event = await prisma.event.findFirst({
        where: { id: req.query.id as string },
      });

      if (!event) {
        res.status(400).json({ message: 'This event no longer exists; please refresh the page and try again.' });

        return;
      }

      if (!event) {
        res.status(400).json({ message: 'Event does not exist.' });
  
        return;
      }

      const submissions = await prisma.gameSubmission.findMany({
        where: {
          eventId: event.id,
        },
        include: {
          categories: true,
          user: true,
        },
      });

      const availabilities = await prisma.eventAvailability.findMany({
        where: {
          eventId: event.id,
        },
      });

      const baseFields = EXPORTED_SUBMISSION_FIELDS.map(([value, label]) => ({ value, label }));

      const submissionFields = [...Array(event.maxSubmissions)].flatMap((_, index) => (
        EXPORTED_CATEGORY_FIELDS.map(([field, label]) => ({
          value: `${field}${index + 1}`,
          label: label.replace('$1', (index + 1).toString()),
        }))
      ));

      const allFields = [...baseFields, ...submissionFields];

      const formattedSubmissions = submissions.map(submission => {
        const availability = availabilities.find(item => item.userId === submission.userId);

        let availabilityString = '';

        if (availability) {
          const slots = [...availability.slots].sort((a, b) => a.toISOString().localeCompare(b.toISOString()));

          // Remove duplicates
          const dedupedSlots = slots.filter((slot, index) => slots.findIndex(x => x.toISOString() === slot.toISOString()) === index);

          const availabilitySegments = dedupedSlots.reduce<DateSegment[]>((acc, slot) => {
            const previousSlot: DateSegment = acc[acc.length - 1];
            const zonedTime = utcToZonedTime(slot, 'America/New_York');
            const slotDate = format(zonedTime, 'MMM do', { timeZone: 'America/New_York' });
            const slotTime = Number(format(zonedTime, 'H', { timeZone: 'America/New_York' }));

            if (previousSlot && previousSlot.date === slotDate && previousSlot.end === slotTime) {
              return [
                ...acc.slice(0, -1),
                {
                  ...previousSlot,
                  end: slotTime + 1,
                },
              ];
            }

            return [...acc,
              {
                date: slotDate,
                start: slotTime,
                end: slotTime + 1,
              },
            ];
          }, [] as DateSegment[]);

          availabilityString = availabilitySegments.map(segment => `${segment.date} ${segment.start}:00-${segment.end === 23 ? '23:59' : `${segment.end}:00`}`).join(', ');
        }

        const baseData = {
          userName: submission.user.displayName || submission.user.name || '<username missing>',
          pronouns: submission.user.pronouns,
          showPronouns: submission.user.showPronouns,
          availability: availabilityString,
          gameTitle: submission.gameTitle,
          platform: submission.platform,
          description: submission.description,
          primaryGenre: submission.primaryGenre,
          secondaryGenre: submission.secondaryGenre,
          technicalNotes: submission.technicalNotes,
          contentWarning: submission.contentWarning,
          flashingLights: submission.flashingLights,
        };
        
        return submission.categories.reduce((acc, category, index) => ({
          ...acc,
          [`categoryName${index + 1}`]: category.categoryName,
          [`url${index + 1}`]: category.videoURL,
          [`estimate${index + 1}`]: category.estimate,
          [`description${index + 1}`]: category.description,
        }), baseData);
      });

      formattedSubmissions.sort((a, b) => a.userName.localeCompare(b.userName));

      const parser = new Parser({
        fields: allFields,
      });

      const csv = parser.parse(formattedSubmissions);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${event.eventName}.csv`);

      res.send(csv);
    } catch (e) {
      console.error('Error downloading event submissions (GET api/[id]/download]):');
      console.error(e);

      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  } else {
    res.status(400).json({ message: 'Unsupported method.' });
  }
}
