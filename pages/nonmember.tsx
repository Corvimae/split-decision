import React from 'react';
import styled from 'styled-components';
import type { NextPage } from 'next';
import { SiteConfig } from '../utils/siteConfig';

const NonMemberError: NextPage = () => (
  <div>
    <HeroImage />

    <h1>
      You need to be a member of the {SiteConfig.organizationName} Discord in order to log in.
    </h1>
  </div>
);

export default NonMemberError;

const HeroImage = styled.div`
  width: 600px;
  height: 400px;
  background-image: url("images/her.png");
  background-size: cover;
`;
