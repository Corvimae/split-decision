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
  categoryName: string;
  url: string;
  estimate: string;
  categoryDescription: string;
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
  ['categoryName', 'Category'],
  ['url', 'URL'],
  ['estimate', 'Estimate'],
  ['categoryDescription', 'Category Description'],
];

const NO_HOURS_TIMESTAMP_REGEX = /^(?:([0-5]\d):)?([0-5]\d)$/;
const SINGLE_DIGIT_HOUR_TIMESTAMP_REGEX = /^(?:(?:([0-9]):)([0-5]\d):)?([0-5]\d)$/;

function normalizeEstimate(estimate: string): string {
  if (estimate.match(SINGLE_DIGIT_HOUR_TIMESTAMP_REGEX)) return `0${estimate}`;
  if (estimate.match(NO_HOURS_TIMESTAMP_REGEX)) return `00:${estimate}`;

  return estimate;
}

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

      const allFields = EXPORTED_SUBMISSION_FIELDS.map(([value, label]) => ({ value, label }));

      const formattedSubmissions = submissions.flatMap(submission => {
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
        
        return submission.categories.map(category => ({
          ...baseData,
          categoryName: category.categoryName,
          url: category.videoURL,
          estimate: normalizeEstimate(category.estimate),
          categoryDescription: category.description,
        }));
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
