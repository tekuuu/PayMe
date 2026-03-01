# AGENTS.md - AI Coding Agent Reference

This file provides essential information for AI coding agents working on this project. It contains project-specific details, conventions, and guidelines that complement the README.

---

## Project Overview

**Merces Payroll** is a production-ready blockchain-based payroll system built with:

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Package Manager**: Bun (preferred) or npm

The project follows a feature-based folder structure designed for scalability in SaaS applications, internal tools, and admin panels.

---

## Technology Stack Details

### Core Framework & Runtime
- Next.js 16.0.10 with App Router
- React 19.2.0
- TypeScript 5.7.2 with strict mode enabled

### Styling & UI
- Tailwind CSS v4 (using `@import 'tailwindcss'` syntax)
- PostCSS with `@tailwindcss/postcss` plugin
- shadcn/ui component library (Radix UI primitives)
- CSS custom properties for theming (OKLCH color format)

### State Management
- Zustand 5.x for global state
- Nuqs for URL search params state management
- React Hook Form + Zod for form handling

### Navigation System
- Navigation configuration in `src/config/nav-config.ts`
- Client-side filtering via `src/hooks/use-nav.ts`

### Data & APIs
- TanStack Table for data tables
- Recharts for analytics/charts (to be refined for payroll use cases)

### Development Tools
- ESLint 8.x with Next.js core-web-vitals config
- Prettier 3.x with prettier-plugin-tailwindcss
- Husky for git hooks
- lint-staged for pre-commit formatting

---

## Project Structure

```
/src
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard routes
│   │   ├── layout.tsx     # Dashboard layout
│   │   └── page.tsx       # Dashboard main page
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── global-error.tsx   # Global error boundary
│   └── not-found.tsx      # 404 page
│
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (sidebar, header, etc.)
│   ├── themes/            # Theme system components
│   ├── icons.tsx          # Icon registry
│   └── ...
│
├── config/                # Configuration files
│   ├── nav-config.ts      # Navigation config
│   └── ...
│
├── hooks/                 # Custom React hooks
│   ├── use-nav.ts         # Navigation filtering
│   └── ...
│
├── lib/                   # Utility functions
│   ├── utils.ts           # cn() and formatters
│   └── ...
│
├── types/                 # TypeScript type definitions
│   └── index.ts           # Core types
│
└── styles/                # Global styles
    ├── globals.css        # Tailwind imports
    ├── theme.css          # Theme imports
    └── themes/            # Individual theme files

/docs                      # Documentation
│   ├── themes.md          # Theme customization guide
│   └── ...
```

---

## Build & Development Commands

```bash
# Install dependencies
bun install

# Development server
bun run dev          # Starts at http://localhost:3000

# Build for production
bun run build

# Start production server
bun run start

# Linting
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues and format

# Formatting
bun run format       # Format with Prettier
```

---

## Environment Configuration

Copy `env.example.txt` to `.env.local` and configure:

### Basic Setup
```env
# Add required environment variables here
```

---

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Use explicit return types for public functions
- Prefer interface over type for object definitions
- Use `@/*` alias for imports from src

### Component Conventions
- Use function declarations for components: `function ComponentName() {}`
- Props interface named `{ComponentName}Props`
- shadcn/ui components use `cn()` utility for class merging
- Server components by default, `'use client'` only when needed

---

## Navigation System

Navigation is defined in `src/config/nav-config.ts`. The `navItems` array defines the sidebar and command menu structure.

---

## Data Fetching Patterns

### Server Components (Default)
Fetch data directly in async components.

### URL State Management
Use `nuqs` for search params state.

---

## Testing Strategy

**Note**: This project does not include a test suite by default. Consider adding Unit tests (Vitest) or E2E tests (Playwright) as needed.

---

## Troubleshooting

### Common Issues

**Build fails with Tailwind errors**
- Ensure using Tailwind CSS v4 syntax (`@import 'tailwindcss'`)
- Check `postcss.config.js` uses `@tailwindcss/postcss`

**Theme not applying**
- Check theme name matches in CSS `[data-theme]` and `theme.config.ts`
- Verify theme CSS is imported in `theme.css`

---

## Notes for AI Agents

1. **Always use `cn()` for className merging** - never concatenate strings manually.
2. **Server components by default** - only add `'use client'` when using browser APIs or React hooks.
3. **Type safety first** - avoid `any`, prefer explicit types.
4. **Follow existing patterns** - look at similar components before creating new ones.
5. **Environment variables** - prefix with `NEXT_PUBLIC_` for client-side access.
6. **shadcn components** - don't modify files in `src/components/ui/` directly; extend them instead.
