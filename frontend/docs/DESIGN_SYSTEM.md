# PayMe Design System

## Overview

This document outlines the professional design standards for the PayMe application. All components and pages should follow these guidelines to maintain consistency, readability, and a premium appearance.

---

## Color System

### Semantic Status Colors

All status indicators, badges, and alerts use a consistent professional color palette defined via CSS custom properties:

#### Light Mode
- **Success** (Active, Paid): Emerald green (`--status-success`)
- **Warning** (Past Due, Pending): Professional amber (`--status-warning`)
- **Error** (Unpaid, Failed): Rose red (`--status-error`)
- **Info** (Open, Recoverable): Primary blue (`--status-info`)
- **Neutral** (Canceled, Draft): Muted gray (`--muted`)

#### Dark Mode
All status colors adapt automatically for readability in dark theme.

### Usage Examples

```tsx
// Subscription Status Badges
- active: Uses status-success
- past_due: Uses status-warning
- unpaid: Uses status-error
- paused: Uses status-pending
- canceled: Uses status-neutral

// Always import from design system
import { statusBadgeClasses } from '@/lib/design-system';
```

### Text Colors

| Color Name | Usage |
|-----------|-------|
| `foreground` | Primary text, headings |
| `muted-foreground` | Secondary text, labels, captions |
| `text-numeric` | All numeric values, amounts, dates |
| `text-emphasis` | Important numeric values |

---

## Typography

### Font Families

- **Sans Serif** (Default): System fonts (Segoe UI, Helvetica, Arial)
- **Monospace** (Code): SFMono, Monaco, Inconsolata, Fira Code
- **Serif** (Rare): Georgia (avoid unless intentional)

### Font Weights

| Weight | Use Case | CSS Value |
|--------|----------|-----------|
| Normal | Body text, descriptions | 400 |
| Medium | Labels, captions | 500 |
| Semibold | Subheadings, emphasis | 600 |
| Bold | Main headings, critical values | 700 |

### Font Sizes

| Size | Use Case | Value |
|------|----------|-------|
| xs | Captions, small labels | 0.75rem (12px) |
| sm | Secondary text, metadata | 0.875rem (14px) |
| base | Body text | 1rem (16px) |
| lg | Large text | 1.125rem (18px) |
| xl | Subheadings | 1.25rem (20px) |
| 2xl | Section headings | 1.5rem (24px) |
| 3xl | Page titles | 1.875rem (30px) |
| 4xl | Large display | 2.25rem (36px) |

### Numeric Values

All numeric values (amounts, counts, dates) must follow this professional pattern:

```tsx
// Correct - Professional numeric styling
<p className='font-mono text-foreground tabular-nums'>
  ${formatMicrosToCurrency(amount)}
</p>

// Correct - Using design system utility
import { numericClasses } from '@/lib/design-system';
<p className={numericClasses}>
  {value}
</p>
```

**Key Points:**
- Use `font-mono` for monospace fonts
- Add `tabular-nums` class for aligned digits
- Use `text-foreground` for visibility (never hardcode colors like `text-blue-500`)
- Apply `text-[color:var(--text-numeric)]` for consistency with variables

---

## Components & Patterns

### Status Badges

Use the `SubscriptionStatusBadge` component which automatically applies correct colors:

```tsx
import { SubscriptionStatusBadge } from '@/components/merchant/status-badge';

<SubscriptionStatusBadge status="active" />
<SubscriptionStatusBadge status="past_due" />
<SubscriptionStatusBadge status="unpaid" />
```

### Metric Cards

All metric/stat cards must follow this pattern:

```tsx
<div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
  <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
  <div className='relative p-6 min-h-[140px] flex flex-col justify-between'>
    <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>
      Label
    </p>
    <p className='text-3xl font-bold text-foreground tabular-nums'>
      {value}
    </p>
  </div>
</div>
```

### Success/Error States

Use semantic color variables in feedback messages:

```tsx
// Error message
<p className='text-sm text-[color:var(--status-error)]'>
  {errorMessage}
</p>

// Success icon
<Check className='h-4 w-4 text-[color:var(--status-success)]' />

// Warning state
<Clock className='h-4 w-4 text-[color:var(--status-warning)]' />
```

---

## What NOT to Do

❌ **Don't use arbitrary color names:**
```tsx
// Bad - Uses hardcoded Tailwind colors
<div className='text-emerald-500 bg-amber-500/10'>
```

❌ **Don't mix numeric styling:**
```tsx
// Bad - Inconsistent numeric display
<p className='text-lg font-bold text-blue-600'>$1,234.56</p>
<p className='text-2xl text-red-500 font-semibold'>567.89</p>
```

❌ **Don't use inline colors for status:**
```tsx
// Bad - Status colors hardcoded
{subscription.status === 'active' && <Badge className='bg-green-500' />}
```

---

## Migration Guide

### Updating Old Code

**Before (Inconsistent):**
```tsx
const fheClass = status === 'ready'
  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  : 'text-amber-400 border-amber-500/30 bg-amber-500/10';
```

**After (Semantic):**
```tsx
const fheClass = status === 'ready'
  ? 'text-[color:var(--status-success)] border-[color:var(--status-success)]/30 bg-[color:var(--status-success)]/10'
  : 'text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30 bg-[color:var(--status-warning)]/10';
```

---

## CSS Variables Reference

### Available in `[data-theme='payme']`

```css
/* Status Colors */
--status-success: oklch(0.52 0.15 142);
--status-warning: oklch(0.75 0.15 65);
--status-error: oklch(0.55 0.18 25);
--status-info: oklch(0.55 0.18 250);
--status-pending: oklch(0.7 0.12 250);

/* Text Colors */
--text-numeric: oklch(0.15 0.02 240);
--text-emphasis: oklch(0.12 0.02 240);

/* Base Colors */
--foreground: oklch(0.15 0.02 240);
--muted-foreground: oklch(0.45 0.02 240);
--primary: oklch(0.55 0.18 250);
```

---

## Testing Across Modes

Always test components in:
- ✅ Light mode
- ✅ Dark mode
- ✅ Various screen sizes
- ✅ With actual data (long amounts, short text, etc.)

---

## Questions & Updates

This design system is maintained at `src/lib/design-system.ts` and theme variables are in `src/styles/themes/payme.css`.

For questions or to propose changes, review the design system file first.
