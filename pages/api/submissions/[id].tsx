import { Request, Response } from 'express';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import { prisma } from '../../../utils/db';
import { areSubmissionsOpen } from '../../../utils/eventHelpers';
import { ValidationSchemas } from '../../../utils/validation';
import { authOptions } from '../auth/[...nextauth]';

export default async function handle(req: Request, res: Response) {
  if (req.method === 'DELETE') {
    try {
      const session = await unstable_getServerSession(req, res, authOptions);

      if (!session) {
        res.status(401).json({ message: 'You must be logged in.' });
  
        return;
      }

      if (req.query.id) {
        // Get existing record and ensure that it belongs to this user.
        const existingRecord = await prisma.gameSubmission.findFirst({
          where: { id: req.query.id as string },
        });

        if (!existingRecord) {
          res.status(400).json({ message: 'This submission no longer exists; please refresh the page and try again.' });

          return;
        }

        if (existingRecord.userId !== session.user.id) {
          res.status(401).json({ message: 'You do not have access to this submission.' });

          return;
        }

        await prisma.gameSubmission.delete({
          where: { id: req.query.id as string },
        });

        res.status(200).json({ message: 'Submission deleted.' });
      }
    } catch (e) {
      console.error('Error fetching events (POST api/events):');
      console.error(e);

      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  } else if (req.method === 'POST') {
    try {
      const session = await unstable_getServerSession(req, res, authOptions);

      if (!session) {
        res.status(401).json({ message: 'You must be logged in.' });
  
        return;
      }
      
      let existingCategoryIds: string[] = [];

      const event = await prisma.event.findFirst({
        where: { id: req.query.id as string },
      });

      if (!event) {
        res.status(400).json({ message: 'This event does not exist.' });

        return;
      }

      if (!areSubmissionsOpen(event)) {
        res.status(400).json({ message: 'Submissions are not open for this event.' });

        return;
      }
 
      if (req.body.id) {
        // Get existing record and ensure that it belongs to this user.
        const existingRecord = await prisma.gameSubmission.findFirst({
          where: { id: req.body.id },
          include: {
            categories: true,
          },
        });

        if (!existingRecord) {
          res.status(400).json({ message: 'This submission no longer exists; please refresh the page and try again.' });

          return;
        }

        if (existingRecord.userId !== session.user.id) {
          res.status(401).json({ message: 'You do not have access to this submission.' });

          return;
        }

        existingCategoryIds = existingRecord.categories.map(item => item.id);
      } else {
        // Make sure we're not over the submission limit.
        const existingSubmissionsForEvent = await prisma.gameSubmission.count({
          where: {
            eventId: event.id,
            userId: session.user.id,
          },
        });
        
        if (existingSubmissionsForEvent >= event.maxSubmissions) {
          res.status(400).json({ message: `You cannot submit more than ${event.maxSubmissions} ${event.maxSubmissions === 1 ? 'submission' : 'submissions'} to this event.` });

          return;
        }
      }

      const editableData = {
        gameTitle: req.body.gameTitle,
        platform: req.body.platform,
        primaryGenre: req.body.primaryGenre,
        secondaryGenre: req.body.secondaryGenre,
        description: req.body.description,
        flashingLights: req.body.flashingLights,
        technicalNotes: req.body.technicalNotes,
        contentWarning: req.body.contentWarning,
        categories: req.body.categories.map((category: Record<string, unknown>) => ({
          categoryName: category.categoryName,
          videoURL: category.videoURL,
          estimate: category.estimate,
          description: category.description,
        })),
      };

      if (editableData.categories.length > event.maxCategories) {
        res.status(400).json({ message: `You cannot submit more than ${event.maxCategories} ${event.maxCategories === 1 ? 'category' : 'categories'} to this event.` });

        return;
      }

      if (editableData.categories.length === 0) {
        res.status(400).json({ message: 'You must submit at least one category.' });

        return;
      }

      const validation = ValidationSchemas.GameSubmission.validate(editableData);

      if (validation.error) {
        res.status(400).json({ message: validation.error.message });

        return;
      }

      const result = await prisma.gameSubmission.upsert({
        where: {
          id: req.body.id ?? '',
        },
        update: {
          ...editableData,
          categories: {
            deleteMany: { id: { in: existingCategoryIds } },
            createMany: { data: editableData.categories },
          },
        },
        create: {
          ...editableData,
          eventId: event.id,
          userId: session.user.id,
          categories: {
            createMany: { data: editableData.categories },
          },
        },
        include: {
          categories: true,
        },
      });

      res.status(200).json(result);
    } catch (e) {
      console.error('Error editing events (POST api/events):');
      console.error(e);

      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  } else {
    res.status(400).json({ message: 'Unsupported method.' });
  }
}
