import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import type { NextPage, NextPageContext } from 'next';
import { useSession } from 'next-auth/react';
import { Event } from '@prisma/client';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth';
import Link from 'next/link';
import { prisma } from '../../../utils/db';
import { Button } from '../../../components/layout';
import { EventList } from '../../../components/EventList';
import { authOptions } from '../../api/auth/[...nextauth]';
import { EventEditor } from '../../../components/EventEditor';
import { EventWithStringDates, prepareRecordForTransfer } from '../../../utils/models';
import { forceAsDate } from '../../../utils/eventHelpers';
import { SiteConfig } from '../../../utils/siteConfig';

function createEmptyEvent(): Event {
  return {
    id: '',
    eventName: '',
    gameSubmissionPeriodStart: new Date(),
    gameSubmissionPeriodEnd: new Date(),
    eventStart: new Date(),
    eventDays: 3,
    startTime: 9,
    endTime: 24,
    visible: false,
    runStatusVisible: true,
    maxSubmissions: 5,
    maxCategories: 5,
    genres: [],
    createdAt: null,
    updatedAt: null,
  };
}

interface EventDetailsProps {
  events: Event[];
}

const EventDetails: NextPage<EventDetailsProps> = ({ events: eventsFromServer }) => {
  const session = useSession({
    required: true,
  });

  const [events, setEvents] = useState(eventsFromServer);

  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  const handleNewEvent = useCallback(() => {
    setActiveEvent(createEmptyEvent());
  }, []);

  const handleEventSave = useCallback((event: EventWithStringDates) => {
    const eventWithDates = {
      ...event,
      gameSubmissionPeriodStart: forceAsDate(event.gameSubmissionPeriodStart),
      gameSubmissionPeriodEnd: forceAsDate(event.gameSubmissionPeriodEnd),
      eventStart: forceAsDate(event.eventStart),
    };

    const [updatedList, wasUpdated] = events.reduce<[Event[], boolean]>(([acc, updated], item) => {
      if (item.id === eventWithDates.id) return [[...acc, eventWithDates], true];

      return [[...acc, item], updated];
    }, [[], false]);

    if (wasUpdated) {
      setEvents(updatedList);
    } else {
      setEvents([...updatedList, eventWithDates]);
    }

    setActiveEvent(null);
  }, [events]);

  const handleEventDelete = useCallback((id: string) => {
    setActiveEvent(null);
    setEvents(events.filter(item => item.id !== id));
  }, [events]);

  const handleSetActiveEvent = useCallback((id: string) => {
    const event = events.find(item => item.id === id);

    if (!event) return;
    
    setActiveEvent(event);
  }, [events]);

  if (session.status !== 'authenticated') return null;
    
  return (
    <Container>
      <WelcomeMessageContainer>
        <Link href="/submissions">
          <ReturnToProfile>Return to my profile</ReturnToProfile>
        </Link>
        <WelcomeMessage>
          Admin Panel
        </WelcomeMessage>
        <p>Be careful, would ya?</p>
      </WelcomeMessageContainer>
      <ColumnContainer>
        <EventColumn>
          <Button onClick={handleNewEvent}>Create Event</Button>
          <EventList events={events} onClick={handleSetActiveEvent} includeHidden />
        </EventColumn>
        <EditorColumn>
          {activeEvent && (
            <EventEditor
              event={activeEvent}
              onSave={handleEventSave}
              onDelete={handleEventDelete}
            />
          )}
        </EditorColumn>
      </ColumnContainer>
    </Container>
  );
};

export default EventDetails;

export async function getServerSideProps(context: NextPageContext) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await unstable_getServerSession(context.req as any, context.res as any, authOptions);

  if (!session || !session.user.isAdmin) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }

  const events = await prisma.event.findMany();

  return {
    props: {
      events: events.map(prepareRecordForTransfer),
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
`;

const WelcomeMessageContainer = styled.div`
  margin: 0 1rem;
  border-bottom: 1px solid ${SiteConfig.colors.accents.separator};
  padding-bottom: 0.5rem;

  & > p {
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
  }
`;

const EventColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 15rem;
  max-width: 25rem;
  flex-grow: 1;
  align-self: stretch;
  padding: 1rem;
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
