// ============================================
// THEME CONSTANTS
// Central design tokens for the entire app
// ============================================

export const COLORS = {
  // Primary purple gradient palette
  primary: '#9B82DF',
  primaryDark: '#8668C6',
  primaryDeep: '#6B4FB8',
  primaryLight: '#D4C4F4',
  primaryPale: '#F2E6EE',

  // Backgrounds
  bgWhite: '#FFFFFF',
  bgSurface: '#F8F5FF',
  bgCard: 'rgba(255,255,255,0.85)',
  bgGlass: 'rgba(255,255,255,0.6)',

  // Text
  textDark: '#1A1A2E',
  textMid: '#4A4A6A',
  textLight: '#8A8AAA',
  textWhite: '#FFFFFF',
  textWhiteSoft: 'rgba(255,255,255,0.85)',

  // Contribution graph (GitHub-inspired)
  graphEmpty: '#E8E0F5',
  graphL1: '#C8E6C9',    // 1-2 tasks
  graphL2: '#81C784',    // 3-5 tasks
  graphL3: '#4CAF50',    // 6-9 tasks
  graphL4: '#2E7D32',    // 10+ tasks

  // Event category colors
  categoryColors: [
    '#9B82DF', // Purple (default)
    '#F06292', // Pink
    '#64B5F6', // Blue
    '#81C784', // Green
    '#FFB74D', // Orange
    '#E57373', // Red
    '#4DB6AC', // Teal
    '#BA68C8', // Violet
  ],

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  border: 'rgba(155,130,223,0.2)',
  shadow: 'rgba(107,79,184,0.15)',
} as const;

export const GRADIENTS = {
  background: ['#FFFFFF', '#F2E6EE', '#977DDF'],
  backgroundLocations: [0, 0.7, 1.0],
  card: ['rgba(255,255,255,0.95)', 'rgba(242,230,238,0.8)'],
  primary: ['#B39DDB', '#9B82DF', '#8668C6'],
  header: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)'],
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const FONTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// Optional: Export types for your theme blocks so you can easily type component props
export type ThemeColors = typeof COLORS;
export type ThemeGradients = typeof GRADIENTS;
export type ThemeSpacing = typeof SPACING;
export type ThemeRadius = typeof RADIUS;
export type ThemeFonts = typeof FONTS;
export type ThemeShadows = typeof SHADOWS;