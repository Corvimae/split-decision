import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Alert } from './layout';
import { SubmissionWithCategories } from '../utils/models';
import { SiteConfig } from '../utils/siteConfig';

type SubmissionWithCategoriesAndPossibleUsername = SubmissionWithCategories & {
  user?: string | null;
};

interface SubmissionDetailsProps {
  submission: SubmissionWithCategoriesAndPossibleUsername;
}

const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({ submission }) => (
  <SubmissionDetailsContainer>
    <GameTitle>{submission.gameTitle}</GameTitle>
    <GameDetailsGridRow>
      <GameDetails>
        <GameDetailsKey>Genre</GameDetailsKey>
        <div>{submission.primaryGenre}</div>
      </GameDetails>
      <GameDetails>
        <GameDetailsKey>Subgenre</GameDetailsKey>
        <div>{submission.secondaryGenre}</div>
      </GameDetails>
      <GameDetails>
        <GameDetailsKey>Platform</GameDetailsKey>
        <div>{submission.platform}</div>
      </GameDetails>
      <GameDetailsDescription>
        <GameDetailsKey>Description</GameDetailsKey>
        <GameDetailsValueWrap>{submission.description}</GameDetailsValueWrap>
      </GameDetailsDescription>
    </GameDetailsGridRow>
    {submission.contentWarning && (
      <SubmissionWarningRow>
        <b>Content warning:</b>&nbsp;{submission.contentWarning}
      </SubmissionWarningRow>
    )}
    {submission.flashingLights && (
      <SubmissionWarningRow>
        <b>Game contains flashing lights.</b>
      </SubmissionWarningRow>
    )}
    {submission.categories.length === 0 && (
      <Alert>No categories submitted.</Alert>
    )}
    {submission.categories.length > 0 && (
      <CategoryTable>
        <thead>
          <tr>
            <th>Category</th>
            <th>Estimate</th>
            <th>Description</th>
            {/* <th>Status</th> */}
          </tr>
        </thead>
        <tbody>
          {submission.categories.map(category => (
            <tr key={category.id}>
              <td width="15%">
                <a href={category.videoURL} target="_blank" rel="noopener noreferrer">
                  {category.categoryName}
                </a>
              </td>
              <NumericCell width="10%">{category.estimate}</NumericCell>
              <DescriptionCell>{category.description}</DescriptionCell>
              {/* <td width="10%">{category.runStatus}</td> */}
            </tr>
          ))}
        </tbody>
      </CategoryTable>
    )}
  </SubmissionDetailsContainer>
);

interface SubmissionListProps {
  submissions: SubmissionWithCategoriesAndPossibleUsername[];
  showUsernames?: boolean;
}

export const SubmissionList: React.FC<SubmissionListProps> = ({ submissions, showUsernames = false }) => {
  const [groupedUsernames, groupedSubmisisons] = useMemo(() => (
    submissions.reduce(([usernameMapping, submissionMapping], submission) => [
      {
        ...usernameMapping,
        [submission.userId]: submission.user,
      },
      {
        ...submissionMapping,
        [submission.userId]: [...(submissionMapping[submission.userId] || []), submission],
      },
    ], [{} as Record<string, string | null | undefined>, {} as Record<string, SubmissionWithCategoriesAndPossibleUsername[]>])
  ), [submissions]);

  return (
    <Container>
      {Object.entries(groupedSubmisisons).map(([userId, list]) => (
        <UserSubmissions key={userId}>
          {showUsernames && <Username>{groupedUsernames[userId] ?? userId}</Username>}
          {list.map(submission => <SubmissionDetails submission={submission} />)}
        </UserSubmissions>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategoryTable = styled.table`
  border-collapse: collapse;
  margin-top: 0.5rem;
  
  & th,
  & td {
    padding: 0.25rem 0.5rem;
    vertical-align: top;
  }
  
  & th {
    text-align: left;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
  }

  & tr:nth-of-type(2n) td {
    background-color: rgba(0, 0, 0, 0.25);
  }
`;

const SubmissionDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;

  & + & {
    border-top: 1px solid ${SiteConfig.colors.accents.separator};
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
`;

const GameTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
`;

const GameDetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 0.5rem;
`;

const GameDetailsGridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(4, fit-content(100%));
  grid-gap: 1.5rem;

  @media screen and (max-width: 600px) {
    grid-template-columns: repeat(3, fit-content(100%));
  }
`;

const GameDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const GameDetailsDescription = styled(GameDetails)`
  @media screen and (max-width: 600px) {
    grid-column: 1 / -1;
    margin-bottom: 1rem;
  }  
`;

const GameDetailsKey = styled.div`
  margin-bottom: 0.125rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
`;

const GameDetailsValueWrap = styled.div`
  word-break: break-word;
`;

const Username = styled.h2`
  font-size: 2rem;
  margin: 0 0 1rem 0;
`;

const UserSubmissions = styled.div`
  padding: 1rem;

  &:nth-of-type(2n) {
    background-color: ${SiteConfig.colors.accents.separator};
    color: ${SiteConfig.colors.text.dark};
  }
`;

const NumericCell = styled.td`
  font-variant-numeric: tabular-nums;
`;

const SubmissionWarningRow = styled(GameDetailsRow)`
  margin-top: 0.5rem;
`;

const DescriptionCell = styled.td`
  word-break: break-word;  
`;
