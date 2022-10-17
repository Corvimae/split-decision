import { Request, Response } from 'express';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import { prisma } from '../../../utils/db';
import { authOptions } from '../auth/[...nextauth]';

export default async function handle(req: Request, res: Response) {
  if (req.method === 'POST') {
    const session = await unstable_getServerSession(req, res, authOptions);

    if (!session) {
      res.status(401).json({ message: 'You must be logged in.' });

      return;
    }

    try {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          email: req.body.email,
          displayName: req.body.displayName,
          pronouns: req.body.pronouns,
          showPronouns: req.body.showPronouns,
          showSubmissions: req.body.showSubmissions,
        },
      });

      res.status(200).json({ message: 'Account updated.' });
    } catch (e) {
      console.error('Error updating account (POST api/user/update):');
      console.error(e);

      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  } else {
    res.status(400).json({ message: 'Unsupported method.' });
  }
}
