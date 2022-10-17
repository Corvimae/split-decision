import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
