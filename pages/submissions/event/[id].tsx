import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { NextPage, NextPageContext } from 'next';
import { useSession } from 'next-auth/react';
import { Event, EventAvailability } from '@prisma/client';
import { format, intlFormat, parseISO } from 'date-fns';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import Link from 'next/link';
import ScheduleSelector from 'react-schedule-selector';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { prisma } from '../../../utils/db';
import { Alert, Button } from '../../../components/layout';
import { getEventSubmissionTimeString } from '../../../components/EventList';
import { authOptions } from '../../api/auth/[...nextauth]';
import { SubmissionEditor } from '../../../components/SubmissionEditor';
import { areSubmissionsOpen } from '../../../utils/eventHelpers';
import { SubmissionList } from '../../../components/SubmissionList';
import { prepareRecordForTransfer, prepareSubmissionForTransfer, SubmissionWithCategories } from '../../../utils/models';
import { SiteConfig } from '../../../utils/siteConfig';
import { useOnMount } from '../../../utils/hooks';

function renderSelectorTime(_time: Date): React.ReactNode {
  return <div />;
}

function renderSelectorDate(date: Date | null): React.ReactNode {
  if (!date) return <div />;

  return (
    <SelectorDate>{format(date, 'MMM. d')}</SelectorDate>
  );
}

function renderSelectorDateCell(datetime: Date, selected: boolean, refSetter: (dateCell: HTMLElement | null) => void): React.ReactNode {
  return (
    <SelectorElement ref={refSetter} selected={selected}>{format(datetime, 'haaa')}</SelectorElement>
  );
}

function createEmptySubmission(event: Event): SubmissionWithCategories {
  return {
    id: '',
    userId: '',
    eventId: event.id,
    gameTitle: '',
    platform: '',
    primaryGenre: event.genres[0],
    secondaryGenre: '',
    technicalNotes: '',
    flashingLights: false,
    contentWarning: '',
    description: '',
    categories: [],
    createdAt: null,
    updatedAt: null,
  };
}

interface EventDetailsProps {
  event: Event;
  submissions: SubmissionWithCategories[];
  availability: Omit<EventAvailability, 'slots'> & {
    slots: string[];
  };
}

function toServerTime(date: Date) {
  return zonedTimeToUtc(date, 'America/New_York');
}

function fromServerTime(date: Date) {
  return utcToZonedTime(date, 'America/New_York');
}

const EventDetails: NextPage<EventDetailsProps> = ({ event, submissions: submissionFromServer, availability: availabilityFromServer }) => {
  useSession({
    required: true,
  });

  const [submissions, setSubmissions] = useState(submissionFromServer);
  const [availability, setAvailability] = useState(() => ({
    ...availabilityFromServer,
    slots: availabilityFromServer.slots.map(slot => fromServerTime(parseISO(slot))),
  }));
  const [submissionCloseTime, setSubmissionCloseTime] = useState('');

  const [activeSubmission, setActiveSubmission] = useState<SubmissionWithCategories | null>(null);

  const handleNewSubmission = useCallback(() => {
    setActiveSubmission(createEmptySubmission(event));
  }, [event]);

  const handleSubmissionSave = useCallback((submission: SubmissionWithCategories) => {
    const [updatedList, wasUpdated] = submissions.reduce<[SubmissionWithCategories[], boolean]>(([acc, updated], item) => {
      if (item.id === submission.id) return [[...acc, submission], true];

      return [[...acc, item], updated];
    }, [[], false]);

    if (wasUpdated) {
      setSubmissions(updatedList);
    } else {
      setSubmissions([...updatedList, submission]);
    }

    setActiveSubmission(null);
  }, [submissions]);

  const handleSubmissionDelete = useCallback((id: string) => {
    setActiveSubmission(null);
    setSubmissions(submissions.filter(item => item.id !== id));
  }, [submissions]);

  const handleUpdateAvailability = useCallback((slots: Date[]) => {
    setAvailability({
      ...availability,
      slots,
    });

    fetch(`/api/events/${event.id}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slots: slots.map(slot => toServerTime(slot).toISOString()),
      }),
    });
  }, [availability, event.id]);

  const allowSubmissions = useMemo(() => areSubmissionsOpen(event), [event]);

  useOnMount(() => {
    // Prevent a SSR hydration error when less than 1 minute remains.
    setSubmissionCloseTime(getEventSubmissionTimeString(event));
  });

  const remainingSubmissions = event.maxSubmissions - submissions.length;

  return (
    <Container>
      <WelcomeMessageContainer>
        <Link href="/submissions">
          <ReturnToProfile>Return to my profile</ReturnToProfile>
        </Link>
        <WelcomeMessage>
          {event.eventName}
        </WelcomeMessage>
        <EventStartTime>Starts on {intlFormat(parseISO((event.eventStart as unknown) as string))}</EventStartTime>
        <SubmissionCloseTime>{submissionCloseTime}</SubmissionCloseTime>
      </WelcomeMessageContainer>
      {allowSubmissions && (
        <ScheduleSelectorContainer>
          <Title>Availability</Title>
          <p>All times are in <b>Eastern Standard Time</b>.</p>
          <ScheduleSelector
            startDate={event.eventStart}
            minTime={event.startTime}
            maxTime={event.endTime + 1}
            numDays={event.eventDays}
            selection={availability.slots}
            onChange={handleUpdateAvailability}
            renderTimeLabel={renderSelectorTime}
            renderDateLabel={renderSelectorDate}
            renderDateCell={renderSelectorDateCell}
          />
        </ScheduleSelectorContainer>
      )}
      <ColumnContainer>
        <ExistingSubmissionsColumn expand={!allowSubmissions}>
          <Title>My Submissions</Title>
          {!allowSubmissions && (
            <div>
              {submissions.length === 0 && <Alert>You have no submissions for {event.eventName}.</Alert>}
              {submissions.length > 0 && <SubmissionList submissions={submissions} />}
            </div>
          )}
          
          {allowSubmissions && (
            <ExistingSubmissionsList>
              {submissions.map(submission => (
                <li key={submission.id}>
                  <ExistingSubmissionButton onClick={() => allowSubmissions && setActiveSubmission(submission)}>
                    <ExistingSubmissionInfo>
                      <ExistingSubmissionTitle>{submission.gameTitle}</ExistingSubmissionTitle>
                      <ExistingSubmissionCategoryCount>{submission.categories.length} {submission.categories.length === 1 ? 'category' : 'categories'}</ExistingSubmissionCategoryCount>
                    </ExistingSubmissionInfo>
                  </ExistingSubmissionButton>
                </li>
              ))}
              {submissions.length === 0 && (
                <Alert>You have not submitted anything to {event.eventName}.</Alert>
              )}
              {allowSubmissions && (
                <AddGameButton onClick={handleNewSubmission} disabled={remainingSubmissions === 0}>
                  Add game ({remainingSubmissions} remaining)
                </AddGameButton>
              )}
            </ExistingSubmissionsList>
          )}
        </ExistingSubmissionsColumn>
        {allowSubmissions && (
          <EditorColumn>
            {activeSubmission && (
              <SubmissionEditor
                event={event}
                submission={activeSubmission}
                onSave={handleSubmissionSave}
                onDelete={handleSubmissionDelete}
              />
            )}
          </EditorColumn>
        )}
      </ColumnContainer>
    </Container>
  );
};

export default EventDetails;

export async function getServerSideProps(context: NextPageContext) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await unstable_getServerSession(context.req as any, context.res as any, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }

  const event = await prisma.event.findFirst({
    where: {
      id: context.query.id as string,
    },
  });

  if (!event) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  const submissions = await prisma.gameSubmission.findMany({
    where: {
      userId: session.user.id,
      eventId: event.id,
    },
    include: {
      categories: true,
    },
  });
  
  // find or create event availability
  const availability = await prisma.eventAvailability.upsert({
    where: {
      userId_eventId: {
        userId: session.user.id,
        eventId: event.id,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      eventId: event.id,
      slots: [],
    },
  });

  return {
    props: {
      event: prepareRecordForTransfer(event),
      submissions: submissions.map(prepareSubmissionForTransfer),
      availability: {
        ...prepareRecordForTransfer(availability),
        slots: availability.slots.map(slot => slot.toISOString()),
      },
    },
  };
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  color: #fff;
  font-weight: 400;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: row;

  @media screen and (max-width: 500px) {
    flex-direction: column;
  }
`;

const WelcomeMessageContainer = styled.div`
  margin: 0 1rem;
  padding-bottom: 0.5rem;

  & > p {
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
  }
`;

const ExistingSubmissionsColumn = styled.div<{ expand: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: ${({ expand }) => !expand && '15rem'};
  max-width: ${({ expand }) => !expand && '25rem'};
  flex-grow: 1;
  align-self: stretch;
  padding: 1rem;

  @media screen and (max-width: 500px) {
    max-width: 100%;
    border-bottom: 1px solid ${SiteConfig.colors.accents.separator};
    padding-bottom: 1rem;
  }
`;

const EditorColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  flex-grow: 2;
  align-self: stretch;
`;

const WelcomeMessage = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
`;

const EventStartTime = styled.h2`
  font-size: 1.5rem;
  font-style: italic;
  font-weight: 400;
  margin: 0 0 0.5rem;
`;

const SubmissionCloseTime = styled.h2`
  font-size: 1.75rem;
  margin: 0.5rem 0;
`;

const ExistingSubmissionsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  & > li + li {
    margin-top: 1rem;
  }
`;

const ExistingSubmissionInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ExistingSubmissionTitle = styled.div`
  display: flex;
  align-items: center;
  word-break: break-word;
  text-align: left;
  padding-right: 0.5rem;
`;

const ExistingSubmissionCategoryCount = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const AddGameButton = styled(Button)`
  margin-top: 1rem;
  width: 100%;
`;

const ExistingSubmissionButton = styled.button`
  display: flex;
  width: 100%;
  flex-direction: column;
  border: none;
  font-family: inherit;
  font-size: inherit;
  background-color: ${SiteConfig.colors.accents.eventItem};
  color: ${SiteConfig.colors.text.dark};
  padding: 1rem;
  cursor: pointer;
`;

const ReturnToProfile = styled.a`
  display: block;
  color: ${SiteConfig.colors.accents.link};
  font-size: 1.25rem;
  margin: 1rem 0;

  &:hover,
  &:active {
    color: ${SiteConfig.colors.accents.alert};
  }
`;

const Title = styled.h2`
  font-weight: 700;
  margin: 0 0 1rem 0;
`;

const ScheduleSelectorContainer = styled.div`
  display: flex
  flex-direction: column;
  padding: 1rem;
  background-color: ${SiteConfig.colors.accents.separator};
  color: ${SiteConfig.colors.text.dark};
`;

// const SelectorTime = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   color: ${Colors.text.dark};
// `;

const SelectorDate = styled.div`
  text-align: center;
  color: ${SiteConfig.colors.text.dark};
`;

const SelectorElement = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.1rem;
  background-color: ${({ selected }) => selected ? SiteConfig.colors.accents.activeTimeslot : SiteConfig.colors.accents.alert};
  color: rgba(0, 0, 0, 0.75);

  &:hover {
    background-color: ${SiteConfig.colors.accents.link};
  }
`;
