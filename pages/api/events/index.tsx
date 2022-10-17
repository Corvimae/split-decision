import { Request, Response } from 'express';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import { prisma } from '../../../utils/db';
import { ValidationSchemas } from '../../../utils/validation';
import { authOptions } from '../auth/[...nextauth]';

export default async function handle(req: Request, res: Response) {
  if (req.method === 'GET') {
    try {
      const session = await unstable_getServerSession(req, res, authOptions);

      const isAdmin = session?.user.isAdmin ?? false;

      const filter = isAdmin && req.query.includeHidden ? undefined : {
        where: { visible: true },
      };

      const events = await prisma.event.findMany(filter);

      res.status(200).json(events);
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

      if (!session.user.isAdmin) {
        res.status(401).json({ message: 'You are not an administrator.' });
  
        return;
      }
      
      if (req.body.id) {
        // Get existing record and ensure that it belongs to this user.
        const existingEvent = await prisma.event.findFirst({
          where: { id: req.body.id },
        });

        if (!existingEvent) {
          res.status(400).json({ message: 'This event no longer exists; please refresh the page and try again.' });

          return;
        }
      }

      const editableData = {
        eventName: req.body.eventName,
        gameSubmissionPeriodStart: req.body.gameSubmissionPeriodStart,
        gameSubmissionPeriodEnd: req.body.gameSubmissionPeriodEnd,
        eventStart: req.body.eventStart,
        eventDays: Number(req.body.eventDays),
        maxSubmissions: Number(req.body.maxSubmissions),
        maxCategories: Number(req.body.maxCategories),
        startTime: Number(req.body.startTime),
        endTime: Number(req.body.endTime),
        visible: req.body.visible,
        genres: req.body.genres,
      };

      const validation = ValidationSchemas.Event.validate(editableData);

      if (validation.error) {
        res.status(400).json({ message: validation.error.message });

        return;
      }

      const result = await prisma.event.upsert({
        where: {
          id: req.body.id ?? '',
        },
        update: editableData,
        create: editableData,
      });

      res.status(200).json(result);
    } catch (e) {
      console.error('Error editing event (POST api/events):');
      console.error(e);

      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  } else {
    res.status(400).json({ message: 'Unsupported method.' });
  }
}
