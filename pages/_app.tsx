/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { DefaultSeo } from 'next-seo';
import { Button, GlobalStyle } from '../components/layout';
import { SiteConfig } from '../utils/siteConfig';

import '../styles/globals.css';

const HeaderActions: React.FC = () => {
  const session = useSession();

  const discordLogin = useCallback(() => {
    signIn('discord', { callbackUrl: '/submissions' });
  }, []);
  
  const isLoggedIn = session.status === 'authenticated';

  return (
    <HeaderActionsContainer>
      {!isLoggedIn && <LoginButton onClick={discordLogin}>Log In with Discord</LoginButton>}
      {isLoggedIn && (
        <Link href="/submissions">
          <a><LoginButton>Submission Manager</LoginButton></a>
        </Link>
      )}
    </HeaderActionsContainer>
  );
};

function SubmissionsApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={(pageProps as any).session}>
      <Container>
        <GlobalStyle />
        <DefaultSeo
          description={SiteConfig.siteDescription}
          canonical={process.env.NEXTAUTH_URL}
          title={SiteConfig.siteName}
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: process.env.NEXTAUTH_URL,
            site_name: SiteConfig.siteName,
            description: SiteConfig.siteDescription,
            title: SiteConfig.siteName,
            images: [
              {
                url: SiteConfig.embedImage,
                width: 1200,
                height: 627,
                alt: SiteConfig.siteDescription,
                type: 'image/png',
              },
            ],
          }}
          twitter={{
            cardType: 'summary_large_image',
          }}
        />
        <Header>
          <div>
            <Link href="/">
              <a>{SiteConfig.siteName || 'Submissions'}</a>
            </Link>
          </div>
          <HeaderActions />
        </Header>
        <PageContent>
          <Component {...pageProps} />
        </PageContent>
      </Container>
    </SessionProvider>
  );
}

export default SubmissionsApp;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  background-color: ${SiteConfig.colors.accents.link};
  font-size: 1.5rem;
  align-items: center;

  @media screen and (max-width: 500px) {
    a {
      font-size: 1.25rem;
    }
  }
`;

const HeaderActionsContainer = styled.div`
  margin-left: auto;
`;

const PageContent = styled.div`
  min-height: 0;
  align-self: stretch;
  flex-grow: 1;
  overflow-y: auto;
`;

const LoginButton = styled(Button)`
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  line-height: normal;
`;
