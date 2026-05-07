/**
 * Professional Design System
 * Centralized color and typography standards for the entire application
 */

export const typography = {
  // Font families - Professional system fonts
  fonts: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
    serif: 'var(--font-serif)',
  },

  // Font weights - Consistent hierarchy
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Font sizes - Responsive scale
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  // Line heights - Optimal readability
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const semanticColors = {
  // Status colors - Professional palette
  status: {
    success: 'var(--status-success)',
    successFg: 'var(--status-success-fg)',
    warning: 'var(--status-warning)',
    warningFg: 'var(--status-warning-fg)',
    error: 'var(--status-error)',
    errorFg: 'var(--status-error-fg)',
    info: 'var(--status-info)',
    infoFg: 'var(--status-info-fg)',
    pending: 'var(--status-pending)',
    pendingFg: 'var(--status-pending-fg)',
  },

  // Text colors - Consistent semantic usage
  text: {
    primary: 'var(--foreground)',
    secondary: 'var(--muted-foreground)',
    numeric: 'var(--text-numeric)',
    emphasis: 'var(--text-emphasis)',
    muted: 'var(--muted-foreground)',
  },

  // Backgrounds
  bg: {
    base: 'var(--background)',
    elevated: 'var(--card)',
    muted: 'var(--muted)',
  },
} as const;

// CSS Class Mapping for Status Badges
export const statusBadgeClasses = {
  // Subscription statuses
  active: 'bg-[color:var(--status-success)]/10 text-[color:var(--status-success)] border-[color:var(--status-success)]/30',
  past_due: 'bg-[color:var(--status-warning)]/10 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30',
  unpaid: 'bg-[color:var(--status-error)]/10 text-[color:var(--status-error)] border-[color:var(--status-error)]/30',
  paused: 'bg-[color:var(--status-pending)]/10 text-[color:var(--status-pending)] border-[color:var(--status-pending)]/30',
  canceled: 'bg-[color:var(--muted)]/40 text-[color:var(--muted-foreground)] border-[color:var(--muted)]/30',
  incomplete: 'bg-[color:var(--muted)]/40 text-[color:var(--muted-foreground)] border-[color:var(--muted)]/30',
  incomplete_expired: 'bg-[color:var(--muted)]/40 text-[color:var(--muted-foreground)] border-[color:var(--muted)]/30',
  
  // Invoice statuses
  draft: 'bg-[color:var(--muted)]/40 text-[color:var(--muted-foreground)] border-[color:var(--muted)]/30',
  open: 'bg-[color:var(--status-info)]/10 text-[color:var(--status-info)] border-[color:var(--status-info)]/30',
  paid: 'bg-[color:var(--status-success)]/10 text-[color:var(--status-success)] border-[color:var(--status-success)]/30',
  uncollectible: 'bg-[color:var(--status-error)]/10 text-[color:var(--status-error)] border-[color:var(--status-error)]/30',
  void: 'bg-[color:var(--muted)]/40 text-[color:var(--muted-foreground)] border-[color:var(--muted)]/30',
  
  // Recovery statuses
  recoverable_transient: 'bg-[color:var(--status-info)]/10 text-[color:var(--status-info)] border-[color:var(--status-info)]/30',
  requires_customer_action: 'bg-[color:var(--status-warning)]/10 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30',
  hard_failure: 'bg-[color:var(--status-error)]/10 text-[color:var(--status-error)] border-[color:var(--status-error)]/30',
} as const;

// Numeric formatting - Always use consistent professional styling
export const numericClasses = 'font-mono text-[color:var(--text-numeric)] tabular-nums';
