# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint

# Fix ESLint issues automatically
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check code formatting without changing files
pnpm format:check

# Run TypeScript type checking
pnpm typecheck
```

## Project Architecture

This is a Next.js 15.4.3 application using the App Router with TypeScript and Tailwind CSS v4.

### Key Technologies
- **Framework**: Next.js 15.4.3 with App Router
- **React**: Version 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **Component Library**: shadcn/ui configured (new-york style, zinc color)
- **Package Manager**: pnpm

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - React components
  - `ui/` - shadcn/ui components
- `lib/` - Utility functions and shared code
  - `utils.ts` - Contains `cn()` function for className merging
  - `fonts.ts` - Font configurations
- `css/globals.css` - Global styles with Tailwind v4 directives and CSS variables

### Path Aliases
- `@/*` maps to the root directory (e.g., `@/components/ui/button`)

### Styling System
- Uses CSS custom properties for theming
- Light/dark mode support built-in
- Utility function `cn()` in `lib/utils.ts` combines clsx and tailwind-merge for className handling
- shadcn/ui components use class-variance-authority for variants

### Font System
The project uses Next.js font optimization with Geist Sans and Geist Mono fonts, configured in `lib/fonts.ts` and applied in `app/layout.tsx`.

## Development Notes

- When adding shadcn/ui components, use: `pnpm dlx shadcn@latest add <component-name>`
- The project uses Turbopack for faster development builds
- No testing framework is currently configured
- ESLint is configured with Next.js Core Web Vitals and TypeScript rules
- TypeScript is in strict mode with bundler module resolution
- Prettier is configured to enforce double quotes and sort imports
- Lefthook manages git hooks for pre-commit linting and formatting
- Commit messages must follow conventional commit format: `type(scope): subject`