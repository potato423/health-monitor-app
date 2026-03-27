// ─── Design System ─────────────────────────────────────────────────────────
// Inspired by Lifesum / Whoop / Apple Health
// Clean, premium, internationally readable

export const Colors = {
  // Brand
  primary:   '#3B82F6',   // vibrant blue — energetic, trustworthy
  secondary: '#10B981',   // emerald green — health positive
  accent:    '#F59E0B',   // amber — caution / warning

  // System semantic
  blue:    '#3B82F6',
  green:   '#10B981',
  orange:  '#F59E0B',
  red:     '#EF4444',
  teal:    '#14B8A6',
  purple:  '#8B5CF6',
  indigo:  '#6366F1',
  pink:    '#EC4899',

  // Health status
  statusGreen:  '#10B981',
  statusYellow: '#F59E0B',
  statusRed:    '#EF4444',

  // Backgrounds
  background:               '#F8FAFC',   // slate-50 — not harsh white
  secondaryBackground:      '#FFFFFF',
  tertiaryBackground:       '#F1F5F9',   // slate-100
  cardBackground:           '#FFFFFF',

  // Text hierarchy
  text:           '#0F172A',   // slate-900 — deep, readable
  textSecondary:  '#64748B',   // slate-500
  textTertiary:   '#94A3B8',   // slate-400
  textInverse:    '#FFFFFF',

  // Surfaces
  separator:   '#E2E8F0',   // slate-200
  systemFill:  '#F1F5F9',   // slate-100
  overlay:     'rgba(15, 23, 42, 0.5)',

  // Score gradient stops
  scoreExcellent: '#10B981',
  scoreGood:      '#3B82F6',
  scoreFair:      '#F59E0B',
  scorePoor:      '#EF4444',
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

export const Radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  xxl:  22,
  xxxl: 28,
  pill: 999,
};

export const Shadow = {
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  button: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  strong: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Typography scale
export const Type = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  title1:     { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  title2:     { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  title3:     { fontSize: 20, fontWeight: '600' as const },
  headline:   { fontSize: 17, fontWeight: '600' as const },
  body:       { fontSize: 15, fontWeight: '400' as const },
  callout:    { fontSize: 14, fontWeight: '400' as const },
  subhead:    { fontSize: 13, fontWeight: '500' as const },
  footnote:   { fontSize: 12, fontWeight: '400' as const },
  caption:    { fontSize: 11, fontWeight: '400' as const },
};
