export type AppColors = {
  cream: string;
  creamDeep: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  ink: string;
  muted: string;
  primary: string;
  primaryHover: string;
  primaryDeep: string;
  primarySoft: string;
  sunrise: string;
  toggleOn: string;
  toggleOff: string;
  locked: string;
  ready: string;
  snooze: string;
  stop: string;
  onPrimary: string;
  onDark: string;
  onStop: string;
  gold: string;
};

/** Chess.com-inspired dark UI palette. */
export const darkColors: AppColors = {
  cream: '#312E2B',
  creamDeep: '#262421',
  surface: '#3B3937',
  surfaceRaised: '#4B4847',
  border: 'rgba(255,255,255,0.14)',
  ink: '#FFFFFF',
  muted: 'rgba(255,255,255,0.50)',
  primary: '#81B64C',
  primaryHover: '#5D9948',
  primaryDeep: '#45753C',
  primarySoft: 'rgba(129, 182, 76, 0.18)',
  sunrise: 'rgba(129, 182, 76, 0.22)',
  toggleOn: '#81B64C',
  toggleOff: '#4B4847',
  locked: 'rgba(255,255,255,0.30)',
  ready: '#81B64C',
  snooze: '#4B4847',
  stop: '#4B4847',
  onPrimary: '#17210D',
  onDark: '#FFFFFF',
  onStop: '#FFFFFF',
  gold: '#F7C631',
};

/** Chess.com-inspired light UI palette. */
export const lightColors: AppColors = {
  cream: '#F2F0ED',
  creamDeep: '#E8E5E1',
  surface: '#FFFFFF',
  surfaceRaised: '#F7F5F2',
  border: 'rgba(38,36,33,0.10)',
  ink: '#262421',
  muted: 'rgba(38,36,33,0.55)',
  primary: '#81B64C',
  primaryHover: '#5D9948',
  primaryDeep: '#45753C',
  primarySoft: 'rgba(129, 182, 76, 0.14)',
  sunrise: 'rgba(129, 182, 76, 0.18)',
  toggleOn: '#81B64C',
  toggleOff: '#C8C5C0',
  locked: 'rgba(38,36,33,0.28)',
  ready: '#81B64C',
  snooze: '#E8E5E1',
  stop: '#4B4847',
  onPrimary: '#17210D',
  onDark: '#FFFFFF',
  onStop: '#FFFFFF',
  gold: '#E5A800',
};

export type ColorScheme = 'dark' | 'light';

export function getColors(scheme: ColorScheme): AppColors {
  return scheme === 'light' ? lightColors : darkColors;
}

/** Default export for non-themed code paths (tests, boot). */
export const colors = darkColors;

export type SplashPalette = {
  bg0: string;
  bg1: string;
  bg2: string;
  glow: string;
  impact: string;
  title: string;
  tagline: string;
  dot: string;
  skipText: string;
  skipBorder: string;
  wave: string;
  clockFaceTop: string;
  clockFaceBottom: string;
};

/** Splash palette derived from the active app theme (not the Figma mock blues). */
export function getSplashPalette(theme: AppColors): SplashPalette {
  return {
    bg0: theme.creamDeep,
    bg1: theme.cream,
    bg2: theme.surface,
    glow: theme.sunrise,
    impact: 'rgba(129, 182, 76, 0.4)',
    title: theme.ink,
    tagline: theme.muted,
    dot: theme.primary,
    skipText: theme.muted,
    skipBorder: theme.border,
    wave: 'rgba(129, 182, 76, 0.55)',
    clockFaceTop: theme.primary,
    clockFaceBottom: theme.primaryDeep,
  };
}

export const fonts = {
  display: 'Fraunces-Bold',
  displaySemi: 'Fraunces-Bold',
  ui: 'Sora-Regular',
  uiSemi: 'Sora-Regular',
  uiBold: 'Sora-Regular',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
} as const;

/** Screen navigation typography — back links, titles, chevrons. */
export const navTypography = {
  brandTitle: 38,
  pageTitle: 28,
  sectionTitle: 22,
  backLabel: 20,
  backChevron: 28,
  linkLabel: 15,
  linkChevron: 20,
  /** Optical vertical nudge (px) so chevrons sit centered next to adjacent text. */
  chevronNudge: {
    back: 0,
    linkForward: 0,
    rowForward: 0,
  },
} as const;

/** Default Chess.com green board + puzzle highlights. */
export const boardColors = {
  light: '#EBECD0',
  dark: '#779556',
  /** Chess.com puzzle hint — piece to move */
  hintFrom: '#F7EC59',
  hintTo: '#CDD264',
  hintFromBorder: '#B8AC2E',
  hintToBorder: '#9B9228',
  /** Chess.com arcade move highlight */
  arcade: '#5096DB',
  arcadeBright: '#6BAEF0',
  arcadeSoft: 'rgba(80, 150, 219, 0.22)',
  neonTrail: '#45D4FF',
  neonCore: '#7AE8FF',
  lastMoveBorder: '#829B44',
  selectedBorder: '#B7C932',
  errorBorder: '#E85D5D',
  /** Wrong-move snap-back arcade */
  arcadeReject: '#E85D5D',
  arcadeRejectBright: '#FF6B7A',
  arcadeRejectSoft: 'rgba(232, 93, 93, 0.28)',
  /** Outer board frame (Chess.com dark brown) */
  border: '#262421',
} as const;
