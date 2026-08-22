import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
    main: string;
    dark: string;
    light: string;
    ultraLight: string;
    contrast: string;
    text: string;
    textLight: string;
    textMuted: string;
    textSubtle: string;
    border: string;
    tint: string;
    tintDark: string;
    tintLight: string;
    tintSubtle: string;
    tintUltraLight: string;
    tintContrast: string;
    tintText: string;
    tintTextLight: string;
    tintTextMuted: string;
    tintTextSubtle: string;
    tintBorder: string;
    tintMain: string;
    tintDarkMain: string;
    tintLightMain: string;
    tintUltraLightMain: string;
    tintContrastMain: string;
    tintTextMain: string;
    tintTextLightMain: string;
    tintTextMutedMain: string;
    tintTextSubtleMain: string;
    tintBorderMain: string;
  };
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    main: string;
    dark: string;
    light: string;
    ultraLight: string;
    text: string;
    textLight: string;
    textMuted: string;
    textSubtle: string;
    border: string;
  };
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    main: string;
    dark: string;
    light: string;
    ultraLight: string;
    text: string;
    textLight: string;
    textMuted: string;
    textSubtle: string;
    border: string;
  };
  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    main: string;
    dark: string;
    light: string;
    ultraLight: string;
    contrast: string;
    text: string;
    textLight: string;
    textMuted: string;
    textSubtle: string;
    border: string;
  };
  neutral: {
    0: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
    main: string;
    dark: string;
    light: string;
    ultraLight: string;
    text: string;
    textLight: string;
    textMuted: string;
    textSubtle: string;
    border: string;
    background: string;
    surface: string;
    surfaceAlt: string;
  };
};

const lightColors: ThemeColors = {
  primary: {
    50: '#eef9ff',
    100: '#d9f1ff',
    200: '#bce7ff',
    300: '#8ed8ff',
    400: '#59c0ff',
    500: '#33a4ff',
    600: '#1b85f5',
    700: '#136ae0',
    800: '#1656b4',
    900: '#184b8e',
    950: '#0f2d57',
    main: '#1b85f5',
    dark: '#136ae0',
    light: '#59c0ff',
    ultraLight: '#eef9ff',
    contrast: '#ffffff',
    text: '#0f2d57',
    textLight: '#33a4ff',
    textMuted: '#8ed8ff',
    textSubtle: '#bce7ff',
    border: '#d9f1ff',
    tint: '#33a4ff',
    tintDark: '#136ae0',
    tintLight: '#8ed8ff',
    tintSubtle: '#bce7ff',
    tintUltraLight: '#eef9ff',
    tintContrast: '#ffffff',
    tintText: '#0f2d57',
    tintTextLight: '#33a4ff',
    tintTextMuted: '#8ed8ff',
    tintTextSubtle: '#bce7ff',
    tintBorder: '#d9f1ff',
    tintMain: '#1b85f5',
    tintDarkMain: '#136ae0',
    tintLightMain: '#59c0ff',
    tintUltraLightMain: '#eef9ff',
    tintContrastMain: '#ffffff',
    tintTextMain: '#0f2d57',
    tintTextLightMain: '#33a4ff',
    tintTextMutedMain: '#8ed8ff',
    tintTextSubtleMain: '#bce7ff',
    tintBorderMain: '#d9f1ff',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    main: '#10b981',
    dark: '#059669',
    light: '#34d399',
    ultraLight: '#ecfdf5',
    text: '#064e3b',
    textLight: '#059669',
    textMuted: '#34d399',
    textSubtle: '#6ee7b7',
    border: '#d1fae5',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    main: '#f59e0b',
    dark: '#d97706',
    light: '#fbbf24',
    ultraLight: '#fffbeb',
    text: '#78350f',
    textLight: '#b45309',
    textMuted: '#fbbf24',
    textSubtle: '#fcd34d',
    border: '#fef3c7',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    main: '#ef4444',
    dark: '#dc2626',
    light: '#f87171',
    ultraLight: '#fef2f2',
    contrast: '#ffffff',
    text: '#7f1d1d',
    textLight: '#b91c1c',
    textMuted: '#f87171',
    textSubtle: '#fca5a5',
    border: '#fee2e2',
  },
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
    main: '#64748b',
    dark: '#475569',
    light: '#94a3b8',
    ultraLight: '#f8fafc',
    text: '#0f172a',
    textLight: '#334155',
    textMuted: '#64748b',
    textSubtle: '#94a3b8',
    border: '#e2e8f0',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
  },
};

const darkColors: ThemeColors = {
  primary: {
    50: '#0f2d57',
    100: '#184b8e',
    200: '#1656b4',
    300: '#136ae0',
    400: '#1b85f5',
    500: '#33a4ff',
    600: '#59c0ff',
    700: '#8ed8ff',
    800: '#bce7ff',
    900: '#d9f1ff',
    950: '#eef9ff',
    main: '#33a4ff',
    dark: '#59c0ff',
    light: '#136ae0',
    ultraLight: '#0f2d57',
    contrast: '#0f172a',
    text: '#bce7ff',
    textLight: '#8ed8ff',
    textMuted: '#59c0ff',
    textSubtle: '#33a4ff',
    border: '#1656b4',
    tint: '#33a4ff',
    tintDark: '#59c0ff',
    tintLight: '#8ed8ff',
    tintSubtle: '#bce7ff',
    tintUltraLight: '#0f2d57',
    tintContrast: '#0f172a',
    tintText: '#bce7ff',
    tintTextLight: '#8ed8ff',
    tintTextMuted: '#59c0ff',
    tintTextSubtle: '#33a4ff',
    tintBorder: '#1656b4',
    tintMain: '#33a4ff',
    tintDarkMain: '#59c0ff',
    tintLightMain: '#8ed8ff',
    tintUltraLightMain: '#0f2d57',
    tintContrastMain: '#0f172a',
    tintTextMain: '#bce7ff',
    tintTextLightMain: '#8ed8ff',
    tintTextMutedMain: '#59c0ff',
    tintTextSubtleMain: '#33a4ff',
    tintBorderMain: '#1656b4',
  },
  success: {
    50: '#064e3b',
    100: '#065f46',
    200: '#047857',
    300: '#059669',
    400: '#10b981',
    500: '#34d399',
    600: '#6ee7b7',
    700: '#a7f3d0',
    800: '#d1fae5',
    900: '#ecfdf5',
    main: '#34d399',
    dark: '#10b981',
    light: '#6ee7b7',
    ultraLight: '#064e3b',
    text: '#a7f3d0',
    textLight: '#6ee7b7',
    textMuted: '#34d399',
    textSubtle: '#10b981',
    border: '#047857',
  },
  warning: {
    50: '#78350f',
    100: '#92400e',
    200: '#b45309',
    300: '#d97706',
    400: '#f59e0b',
    500: '#fbbf24',
    600: '#fcd34d',
    700: '#fde68a',
    800: '#fef3c7',
    900: '#fffbeb',
    main: '#fbbf24',
    dark: '#f59e0b',
    light: '#fcd34d',
    ultraLight: '#78350f',
    text: '#fde68a',
    textLight: '#fbbf24',
    textMuted: '#f59e0b',
    textSubtle: '#d97706',
    border: '#92400e',
  },
  error: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#b91c1c',
    300: '#dc2626',
    400: '#ef4444',
    500: '#f87171',
    600: '#fca5a5',
    700: '#fecaca',
    800: '#fee2e2',
    900: '#fef2f2',
    main: '#f87171',
    dark: '#ef4444',
    light: '#fca5a5',
    ultraLight: '#7f1d1d',
    contrast: '#ffffff',
    text: '#fecaca',
    textLight: '#fca5a5',
    textMuted: '#f87171',
    textSubtle: '#ef4444',
    border: '#991b1b',
  },
  neutral: {
    0: '#020617',
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
    950: '#ffffff',
    main: '#94a3b8',
    dark: '#64748b',
    light: '#475569',
    ultraLight: '#0f172a',
    text: '#f1f5f9',
    textLight: '#e2e8f0',
    textMuted: '#94a3b8',
    textSubtle: '#64748b',
    border: '#334155',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceAlt: '#334155',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const Typography = {
  fontFamilyRegular: 'Inter-Regular',
  fontFamilyMedium: 'Inter-Medium',
  fontFamilySemiBold: 'Inter-SemiBold',
  fontFamilyBold: 'Inter-Bold',
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 20,
  fontSizeXl: 24,
  fontSizeXxl: 32,
  fontSizeXxxl: 40,
  lineHeightBody: 1.5,
  lineHeightHeading: 1.2,
};

export type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export { lightColors, darkColors };
