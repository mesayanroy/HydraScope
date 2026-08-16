# Architecture (Initial Foundation)

## Layers

1. **UI (`app`, `components`)**
   - Next.js App Router
   - Reusable React components
2. **Server/API (`app/api`, `server`)**
   - Route handlers delegate to server-layer functions
   - Zod-backed response validation
3. **Domain Modules (`graph`, `analysis`, `ai`)**
   - Typed modules prepared for graph traversal and evidence-bound reasoning
4. **Quality (`tests`, `evaluation`, `security-tests`)**
   - Vitest for unit/integration
   - Playwright for E2E

## Initial Endpoint
- `GET /api/health` returns service health payload.
