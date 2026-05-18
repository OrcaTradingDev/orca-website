# Technical Product Specification (TPS) - OrcaTrading Frontend

## 1. Overview
This document outlines the architectural standards, directory structure, and development conventions for the OrcaTrading frontend application. The goal is to maintain a scalable, maintainable, and production-grade codebase.

## 2. Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript (Strict Mode)
- **Styling:** CSS Modules with centralized design tokens (`tokens.css`), Tailwind CSS v4 for utilities.
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **UI Components:** Radix UI primitives bridged with custom CSS Modules/Tailwind.

## 3. Architecture & Folder Structure

The frontend strictly separates routing logic from domain logic to prevent "App Router pollution" and maintain clean monorepo boundaries.

### 3.1. High-Level Structure
```
web-developement/
├── app/            # Next.js App Router (Routes Only)
├── src/            # ALL frontend source code
│   ├── features/   # Domain-driven feature modules
│   ├── components/ # Shared global components (UI, Layout)
│   ├── lib/        # Core utilities (http client, formatters)
│   ├── store/      # Global state (Zustand)
│   ├── styles/     # Global styles and design tokens
│   ├── hooks/      # Shared React hooks
│   └── types/      # Global TypeScript definitions
├── docs/           # Documentation
└── config files    # package.json, tsconfig.json, tailwind.config.ts
```

### 3.2. The `app/` Directory (Thin Routes)
The `app/` directory should **only** contain Next.js routing files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). 
- No components, hooks, or styles should be defined here.
- Route pages act purely as composition layers, importing specialized components from `src/features/`.

### 3.3. The `src/features/` Directory (Domain Logic)
Features are isolated, self-contained domains (e.g., `dashboard`, `auth`, `marketing`, `orcabot`). Each feature can have its own internal architecture:
```
src/features/dashboard/
├── components/   # Dashboard-specific components
├── hooks/        # Dashboard-specific hooks (e.g., useScreener.ts)
├── services/     # API calls for the dashboard
├── types/        # Dashboard-specific types
└── index.ts      # Public API for the feature (Barrel export)
```
*Rule:* Features can import from shared global folders (`src/components`, `src/lib`), but **cannot** import from other features to prevent circular dependencies.

## 4. Naming Conventions

- **React Components:** `PascalCase` (e.g., `AuthGuard.tsx`, `HeroSection.tsx`). This aligns with React ecosystem standards and improves IDE symbol navigation.
- **Hooks:** `camelCase` (e.g., `useScreener.ts`, `useAuth.ts`).
- **Standard Files:** `kebab-case` for utilities, stores, configs, and types (e.g., `auth-store.ts`, `http-client.ts`).
- **CSS Modules:** `[name].module.css` (e.g., `orcabot.module.css`).

## 5. Styling Strategy

- **No Inline Styles:** Avoid large blocks of inline `<style>` tags or inline `style={{}}` attributes.
- **CSS Modules:** Use CSS Modules for component-scoped styling. 
- **Design Tokens:** All colors, spacing, and typography must reference centralized CSS variables defined in `src/styles/tokens.css`. Avoid hardcoding hex codes.
- **Tailwind CSS:** Used for layout primitives and utility classes alongside CSS modules where appropriate.

## 6. Path Aliases
Always use configured path aliases to avoid fragile relative imports:
- `@/features/*` -> `./src/features/*`
- `@/components/*` -> `./src/components/*`
- `@/lib/*` -> `./src/lib/*`
- `@/store/*` -> `./src/store/*`
- `@/styles/*` -> `./src/styles/*`

## 7. State Management
- **Local State:** `useState`, `useReducer` for component-level UI state.
- **Server State:** TanStack Query for caching, synchronizing, and updating server data.
- **Global UI/App State:** Zustand (e.g., `src/store/auth-store.ts`) for cross-cutting concerns like user sessions or global theme toggles.
