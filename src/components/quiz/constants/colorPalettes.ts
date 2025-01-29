import { ColorPalette } from '../types/styleTypes';

export const colorPalettes: Record<string, ColorPalette> = {
  warm: {
    primary: '#F97316',
    secondary: '#FEC6A1',
    accent: '#D946EF',
    neutral: '#FDE1D3'
  },
  cool: {
    primary: '#0EA5E9',
    secondary: '#D3E4FD',
    accent: '#8B5CF6',
    neutral: '#E5DEFF'
  },
  neutral: {
    primary: '#8E9196',
    secondary: '#F1F0FB',
    accent: '#6E59A5',
    neutral: '#C8C8C9'
  },
  bright: {
    primary: '#1EAEDB',
    secondary: '#33C3F0',
    accent: '#0FA0CE',
    neutral: '#F6F6F7'
  },
  dark: {
    primary: '#1A1F2C',
    secondary: '#403E43',
    accent: '#8B5CF6',
    neutral: '#8E9196'
  },
  pastel: {
    primary: '#F2FCE2',
    secondary: '#FEF7CD',
    accent: '#FFDEE2',
    neutral: '#E5DEFF'
  }
};