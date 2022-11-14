import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { NextPage, NextPageContext } from 'next';
import { Event } from '@prisma/client';
import { intlFormat, parseISO } from 'date-fns';
import { NextSeo } from 'next-seo';
// eslint-disable-next-line camelcase
import { prisma } from '../../utils/db';
import { getEventSubmissionTimeString } from '../../components/EventList';
import { SubmissionList } from '../../components/SubmissionList';
import { prepareRecordForTransfer, SubmissionWithCategoriesAndUsername } from '../../utils/models';
import { SiteConfig } from '../../utils/siteConfig';

interface EventDetailsProps {
  event: Event;
  submissions: SubmissionWithCategoriesAndUsername[];
}

const EventDetails: NextPage<EventDetailsProps> = ({ event, submissions }) => {
  const submissionCloseTime = useMemo(() => getEventSubmissionTimeString(event, true), [event]);
    
  return (
    <Container>
      <NextSeo
        title={`${event.eventName} Submissions`}
        description={`Event submissions for ${event.eventName}, a speedrunning marathon by ${SiteConfig.organizationName}.`}
      />
      <WelcomeMessageContainer>
        <WelcomeMessage>
          {event.eventName}
        </WelcomeMessage>
        <EventStartTime>Starts on {intlFormat(parseISO((event.eventStart as unknown) as string))}</EventStartTime>
        <SubmissionCloseTime>{submissionCloseTime}</SubmissionCloseTime>
      </WelcomeMessageContainer>
      <SubmissionListContainer>
        <SubmissionList submissions={submissions} showUsernames />
      </SubmissionListContainer>
    </Container>
  );
};

export default EventDetails;

export async function getServerSideProps(context: NextPageContext) {
  const event = await prisma.event.findFirst({
    where: {
      id: context.query.id as string,
    },
  });

  if (!event) {
    return {
      notFound: true,
    };
  }

  const submissions = await prisma.gameSubmission.findMany({
    where: {
      eventId: event?.id,
    },
    include: {
      user: true,
      categories: true,
    },
  });
  
  // Remove other user data and exclude any users that don't want their submissions visible.

  const visibleSubmissions = submissions.reduce((acc, submission) => {
    if (!submission.user.showSubmissions) return acc;

    return [...acc, { ...submission, user: submission.user.displayName ?? submission.user.name }];
  }, [] as SubmissionWithCategoriesAndUsername[]);

  return {
    props: {
      event: JSON.parse(JSON.stringify(event)),
      submissions: visibleSubmissions.map(submission => ({
        ...prepareRecordForTransfer(submission),
        categories: submission.categories.map(prepareRecordForTransfer),
      })),
    },
  };
}

const Container = styled.div`
  display: flex;
  max-height: 100%;
  flex-direction: column;
  color: #fff;
  font-weight: 400;
  overflow: hidden;
`;

const WelcomeMessageContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${SiteConfig.colors.accents.separator};
  padding-bottom: 0.5rem;

  & > p {
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
  }
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

const SubmissionListContainer = styled.div`
  overflow-y: auto;
`;
