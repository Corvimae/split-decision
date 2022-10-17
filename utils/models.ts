import { Event, GameSubmission, GameSubmissionCategory } from '@prisma/client';

export type SubmissionWithCategories = GameSubmission & { categories: GameSubmissionCategory[] };

export type SubmissionWithCategoriesAndUsername = SubmissionWithCategories & {
  user: string | null,
};

export type EventWithStringDates = Omit<Event, 'gameSubmissionPeriodStart' | 'gameSubmissionPeriodEnd' | 'eventStart'> & {
  gameSubmissionPeriodStart: string;
  gameSubmissionPeriodEnd: string;
  eventStart: string;
}

export function prepareRecordForTransfer(record: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!record) return null;

  return Object.entries(record).reduce((acc, [key, value]) => {
    if (value instanceof Date) {
      return {
        ...acc,
        [key]: value.toISOString(),
      };
    }

    return { ...acc, [key]: value };
  }, {});
}

export function prepareSubmissionForTransfer(submission: SubmissionWithCategories | null): Record<string, unknown> | null {
  if (!submission) return null;

  return {
    ...prepareRecordForTransfer(submission),
    categories: submission.categories.map(prepareRecordForTransfer),
  };
}
