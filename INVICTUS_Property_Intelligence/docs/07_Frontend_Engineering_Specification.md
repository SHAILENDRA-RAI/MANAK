# 07 — Frontend Engineering Specification
## Next.js + React + TypeScript

### 1. Scope
Implement the 15-screen UI/UX defined in Document 02. MVP selectors must enforce Jaipur + residential apartment only. Unsupported scopes should be visible as “Planned expansion”, not selectable as if supported.

### 2. Stack
Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form + Zod, TanStack Query, Recharts, Leaflet. Use a typed API client generated from FastAPI OpenAPI where practical.

### 3. Suggested project layout
```text
src/
  app/(auth)/login/page.tsx
  app/(app)/layout.tsx
  app/(app)/dashboard/page.tsx
  app/(app)/valuations/new/page.tsx
  app/(app)/valuations/[id]/page.tsx
  app/(app)/valuations/[id]/report/page.tsx
  app/(app)/history/page.tsx
  app/(app)/data-intelligence/page.tsx
  app/(app)/model-performance/page.tsx
  app/(app)/audit/page.tsx
  app/(app)/settings/page.tsx
  components/layout/
  components/property/
  components/valuation/
  components/maps/
  components/charts/
  components/ui/
  lib/api/
  lib/auth/
  lib/validation/
  lib/format/
  hooks/
  types/
```

### 4. Core UI contracts
- Global shell: sidebar, top bar, active user/role, scope badge.
- New valuation form: area basis required; distinguish carpet/built-up/super-built-up; locality and coordinates confirmation; optional fields visibly optional.
- Coverage review: per-source `AVAILABLE`, `PARTIAL`, `NOT_INTEGRATED`, `PERMISSION_PENDING`, `STALE`.
- Processing state: show actual server stages only; no fake percentage completion.
- Result: estimate, confidence/evidence band, factors, comparable evidence, data freshness, model version, limitations.
- Report: exportable, timestamped, disclaimer, provenance and audit ID.
- Model performance: sample count and validation protocol adjacent to metrics; empty state if no valid test data.
- Demo mode: persistent visible banner; synthetic cases clearly marked.

### 5. State and error handling
Use server state in TanStack Query; form state locally. Add loading, empty, stale, partial, forbidden, offline and retry states. Avoid optimistic UI for valuation creation. Use request IDs in support/error surfaces. Never cache sensitive valuation reports in public/shared browser storage.

### 6. Accessibility and responsive behaviour
Keyboard navigation, visible focus, semantic headings, labels, accessible chart summaries, sufficient contrast, non-colour-only status. Desktop is primary (1440×900); tablet and mobile must support review and basic data entry. Map should have a textual location fallback.

### 7. Branding
Use proposed navy `#17324D`, red `#C8102E`, white/cool-grey surfaces and Inter. This is an independent prototype design direction, not an authorised Hero Housing brand identity. Do not use official logo without permission.

### 8. Acceptance criteria
- Scope guard prevents unsupported city/type valuation.
- Every numeric value displays currency/units.
- Area basis is visible everywhere.
- Comparables distinguish transaction/listing/benchmark/demo.
- Low-confidence cases explain why.
- Uncalibrated interval is hidden.
- Demo data banner is persistent.
- API errors and missing integrations are transparent.
- No false “live” integration status.
