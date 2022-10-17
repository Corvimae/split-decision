import { DefaultSession } from 'next-auth';
import { User as PrismaUser } from '@prisma/client';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: PrismaUser
  }
}
