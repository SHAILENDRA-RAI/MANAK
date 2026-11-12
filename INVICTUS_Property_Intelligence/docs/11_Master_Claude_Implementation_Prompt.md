# 11 — Master Implementation Prompt
## For Claude Code / coding agent

You are the lead full-stack and applied-ML engineer implementing **INVICTUS Property Intelligence**, a competition-grade prototype for Hero Housing Fintech Challenge PS-01.

### Governing documents
Read and follow, in order:
1. SRS & Prototype Blueprint (Document 01)
2. UI/UX Design Specification (Document 02)
3. Database Engineering Specification (03)
4. Backend API Specification (04)
5. AI/ML Engineering Specification (05)
6. Data Acquisition & Integration Specification (06)
7. Frontend Engineering Specification (07)
8. Security, Testing & QA Specification (08)
9. Deployment & DevOps Guide (09)
10. Master Developer Handoff (10)

If a conflict exists, preserve the source challenge requirements and explicit scope constraints. Do not invent facts to fill gaps.

### Product boundaries
- Build PS-01 only: property valuation and collateral intelligence.
- MVP: Jaipur, Rajasthan; residential apartments only.
- Do not implement PS-02-style borrower underwriting, credit scoring, KYC, or automated loan approval.
- Do not claim pan-India data coverage or commercial-property support in MVP.
- No unsupported accuracy claims.
- No fake integrations or fake “live” statuses.
- Asking prices are not transactions; DLC rates are not achieved market prices.
- Synthetic data is UI-demo-only and must never train/evaluate the model.

### Engineering choices
Use Next.js App Router, React, TypeScript, Tailwind, shadcn/ui, TanStack Query, React Hook Form, Zod, FastAPI, PostgreSQL/PostGIS, Python, Pandas/GeoPandas, CatBoost or LightGBM only after evidence-based evaluation, SHAP for explainability where appropriate, Leaflet and permitted map sources. Keep interfaces modular so provider/model choices can change.

### Implementation method
1. Inspect repository and existing files before editing.
2. Create a concise implementation plan and identify missing credentials/dependencies.
3. Establish formatting, linting, type checks, tests, environment templates and CI.
4. Implement DB migrations and seed data with explicit synthetic labels.
5. Implement auth/RBAC and strict scope guards.
6. Build app shell and all required screens according to Document 02.
7. Implement property capture, coverage review and provenance display.
8. Implement transparent comparable retrieval and baseline. If real permitted labels are absent, do not fabricate a trained model; show an explicit prototype/insufficient-evidence state.
9. Implement valuation result, factors, evidence, confidence rationale, report, audit and model performance views.
10. Implement optional map features only with attribution and compliant service usage.
11. Add tests, security checks, documentation and deployment configuration.
12. Run the full test/build suite and fix issues before claiming completion.

### Data integrity requirements
Maintain `data_sources.permission_status`. Block ingest when permission is unknown/request-required/prohibited. Persist source record type, date, retrieval timestamp, content hash, evidence tier and quality status. Preserve area basis and unit. Deduplicate without erasing provenance. Store model version, input snapshot, prediction, explanation and audit event. Never scrape gated portals or bypass CAPTCHA/login.

### Valuation contract
Return estimate only when minimum evidence/quality gates pass. Otherwise return `INSUFFICIENT_EVIDENCE`. Return numeric range only when calibrated. Confidence band must explain its basis and calibration status. Include source freshness, evidence grade, model version, limitations and disclaimer. LTV is optional, indicative only, formula-based and never a lending decision.

### Security requirements
Enforce JWT verification and RBAC server-side. No secrets in client bundles or Git. No sensitive deed/identity data. Add rate limiting, CORS allowlist, validation, audit logging, redaction and dependency scanning. Demo Viewer is read-only and isolated to demo data.

### UI requirements
Use proposed independent prototype palette navy #17324D, red #C8102E, white/cool-grey, Inter. Do not use official Hero Housing logo or imply affiliation/approval. Persistent demo banner on synthetic data. Accessible controls, visible focus, responsive layouts, meaningful empty/loading/error states, no fake progress.

### Acceptance gates
- `npm run lint`, typecheck, tests and build pass.
- Backend tests pass.
- Database migrations apply cleanly.
- All required routes render.
- Scope guard rejects non-Jaipur and non-apartment requests.
- RBAC tests pass.
- Synthetic data excluded from training and metrics.
- No false transaction labels or integrations.
- Model output is traceable and confidence/range logic is honest.
- README supports a clean setup and free-first deployment.
- Demo script can be completed reliably.

### Reporting discipline
At each milestone report: files changed, commands run, tests passed/failed, actual integrations, mock/synthetic components, unresolved blockers and next steps. Never state “complete” for an integration that is only mocked. Never claim measured accuracy without test results and dataset details.
