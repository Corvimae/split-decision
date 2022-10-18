import { Request, Response } from 'express';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import { prisma } from '../../../../utils/db';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handle(req: Request, res: Response) {
  if (req.method === 'POST') {
    try {
      const session = await unstable_getServerSession(req, res, authOptions);

      if (!session) {
        res.status(401).json({ message: 'You must be logged in.' });
  
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

      await prisma.eventAvailability.upsert({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId: event.id,
          },
        },
        update: {
          slots: req.body.slots,
        },
        create: {
          userId: session.user.id,
          eventId: event.id,
          slots: req.body.slots,
        },
      });

      res.status(200).json({ message: 'Availability updated.' });
    } catch (e) {
      console.error('Error editing event (POST api/[id]/availability]):');
      console.error(e);

      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  } else {
    res.status(400).json({ message: 'Unsupported method.' });
  }
}
