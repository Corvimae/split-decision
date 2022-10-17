import { Request, Response } from 'express';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import { prisma } from '../../../../utils/db';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handle(req: Request, res: Response) {
  if (req.method === 'DELETE') {
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
      const existingRecord = await prisma.event.findFirst({
        where: { id: req.query.id as string },
      });

      if (!existingRecord) {
        res.status(400).json({ message: 'This event no longer exists; please refresh the page and try again.' });

        return;
      }

      await prisma.event.delete({
        where: { id: req.query.id as string },
      });

      res.status(200).json({ message: 'Event deleted.' });
    } catch (e) {
      console.error('Error editing event (DELETE api/events):');
      console.error(e);

      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  } else {
    res.status(400).json({ message: 'Unsupported method.' });
  }
}
