import merge from 'deepmerge';
import config from '../config.json';

interface SiteConfiguration {
  heroImage: string;
  embedImage: string;
  favicon: string;
  siteName: string;
  siteDescription: string;
  organizationName: string;
  colors: {
    primary: string;
    accents: {
      control: string;
      eventItem: string;
      separator: string;
      alert: string;
      link: string;
      activeTimeslot: string;
      hover: {
        control: string;
      }
    },
    text: {
      primary: string;
      light: string;
      dark: string;
    },
    error: {
      background: string;
      text: string;
      dark: {
        background: string;
      };
    }
  }
}

const DEFAULT_CONFIG: SiteConfiguration = {
  heroImage: '',
  embedImage: '',
  favicon: '',
  siteName: 'My Submission Site',
  organizationName: 'My Organization',
  siteDescription: 'The cool and also rad submission site!',
  colors: {
    primary: '#4C3973',
    accents: {
      control: '#BF7AA0',
      eventItem: '#F2EB85',
      separator: '#F2BB77',
      alert: '#D4DFF2',
      link: '#ACCBFF',
      activeTimeslot: '#02DBB4',
      hover: {
        control: '#a7487c',
      },
    },
    text: {
      primary: '#B5B5B5',
      light: '#E0E0E0',
      dark: '#000',
    },
    error: {
      background: '#FEECEC',
      text: '#F26D8D',
      dark: {
        background: '#C4244A',
      },
    },
  },
} as const;

export const SiteConfig: SiteConfiguration = merge(DEFAULT_CONFIG, (config || {}) as SiteConfiguration);
