# HydraScope

HydraScope is a graph-native developer security intelligence application built on HydraDB.

## Problem Focus

Given a compromised or vulnerable `package@version`, determine its complete transitive blast radius across packages, repositories, services, and production environments.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Flow
- Zod
- Vitest
- Playwright

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — run local development server
- `npm run build` — production build
- `npm run lint` — lint checks
- `npm run test` — unit/integration tests (Vitest)
- `npm run test:e2e` — end-to-end tests (Playwright)

## Initial Structure

- `app/` UI routes and API routes
- `components/` reusable UI components
- `server/` server-side domain/API logic
- `graph/`, `analysis/`, `ai/` domain modules
- `tests/`, `evaluation/`, `security-tests/`, `test-fixtures/` test assets and harnesses
- `docs/` project documentation
