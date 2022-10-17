import { Event } from '@prisma/client';
import { isAfter, isBefore, parseISO } from 'date-fns';

export function forceAsDate(value: string | Date): Date {
  if (typeof value === 'string') return parseISO((value as unknown) as string);

  return value;
}

export function forceAsString(value: string | Date): string {
  if (typeof value === 'string') return value;
  
  return value.toISOString();
}

export function isBeforeSubmissionPeriod(event: Event): boolean {
  const now = new Date().getTime();
  const startDate = forceAsDate(event.gameSubmissionPeriodStart);

  return isBefore(now, startDate);
}

export function isAfterSubmissionPeriod(event: Event): boolean {
  const now = new Date().getTime();
  const endDate = forceAsDate(event.gameSubmissionPeriodEnd);

  return isAfter(now, endDate);
}

export function areSubmissionsOpen(event: Event): boolean {
  return !isBeforeSubmissionPeriod(event) && !isAfterSubmissionPeriod(event);
}
