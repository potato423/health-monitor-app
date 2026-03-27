// iOS Human Interface Guidelines color palette
export const Colors = {
  // System Colors (iOS)
  blue: '#007AFF',
  green: '#34C759',
  orange: '#FF9500',
  red: '#FF3B30',
  yellow: '#FFCC00',
  teal: '#5AC8FA',
  purple: '#AF52DE',
  indigo: '#5856D6',
  pink: '#FF2D55',

  // Grays
  label: '#000000',
  secondaryLabel: '#3C3C43CC',  // 80% opacity
  tertiaryLabel: '#3C3C4360',   // 38% opacity
  separator: '#3C3C4349',
  systemFill: '#78788033',
  background: '#F2F2F7',
  secondaryBackground: '#FFFFFF',
  tertiaryBackground: '#F2F2F7',
  groupedBackground: '#F2F2F7',
  secondaryGroupedBackground: '#FFFFFF',

  // Semantic text
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',

  // Health status
  statusGreen: '#34C759',
  statusYellow: '#FF9500',
  statusRed: '#FF3B30',

  // Gradients (start, end)
  blueGradient: ['#007AFF', '#0051D5'] as [string, string],
  greenGradient: ['#34C759', '#248A3D'] as [string, string],
  orangeGradient: ['#FF9500', '#C93400'] as [string, string],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
