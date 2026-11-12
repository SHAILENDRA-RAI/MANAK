# 09 — Deployment & DevOps Guide
## Free-first prototype deployment

### 1. Important hosting distinction
GitHub is the source-control and CI/CD home, but **GitHub Pages is static hosting only** and is not a backend runtime. GitHub Pages terms also restrict use as a free host for commercial SaaS/business transactions. Use GitHub for repository, issues, Actions and releases; deploy application components to services that support them.

### 2. Recommended free-first architecture
- Repository: GitHub.
- Frontend: Cloudflare Pages connected to GitHub (static export where feasible). If using full Next.js server features, select a compatible deployment adapter/runtime and verify feature support; alternatively keep frontend client-rendered/static for MVP.
- Backend: Render Free Python web service for FastAPI demo, accepting sleep/cold-start and resource limits; alternative Cloudflare Workers is suitable for lightweight TypeScript APIs, not direct hosting of a Python ML runtime.
- Database/auth: Supabase Free Postgres/Auth for prototype; keep schema portable and export backups. Verify current free-tier quotas and project pause behaviour.
- ML: train offline in local environment or free notebook runtime; deploy a compact model artifact with backend only if memory/CPU allow. Otherwise run a transparent baseline in backend and clearly mark advanced model as planned.
- Map: Leaflet + OSM-compatible tile provider; attribution and tile policy mandatory.

### 3. Known free-tier caveats checked 12 Nov 2026
- GitHub Pages: static only; published site maximum 1 GB, soft bandwidth 100 GB/month; not intended/allowed as free hosting for commercial SaaS or sensitive transactions.
- Cloudflare Pages: Free plan docs list 500 builds/month, 1 concurrent build, 20-minute build timeout, 20,000 files/site and 25 MiB individual asset limit.
- Cloudflare Workers Free: 100,000 requests/day and 10 ms CPU time per invocation; unsuitable for heavy Python inference/training.
- Render Free: web services can spin down when idle; free Postgres expires after 30 days. Do not rely on Render free Postgres for durable data.
- Supabase Free: official docs list 2 free projects, 500 MB database per project, 5 GB egress, 1 GB file storage and 50,000 monthly active users; free projects may pause under plan conditions. Recheck quotas before launch.
Free tiers change. Confirm pricing, limits, region availability, account eligibility and payment-card requirements at signup.

### 4. Repository setup
Use `main` as protected branch, feature branches, pull requests, required CI checks, `.gitignore`, `.env.example`, `README`, `LICENSE` only if appropriate, and `/docs` containing this package. Never commit credentials, customer data, private source exports or model datasets with unclear rights.

### 5. Environment variables
`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` (frontend only if intended public), `SUPABASE_SERVICE_ROLE_KEY` (server only), `JWT_ISSUER`, `JWT_AUDIENCE`, `CORS_ORIGINS`, `MODEL_ARTIFACT_URI`, `APP_ENV`, `LOG_LEVEL`. Use provider secret stores. Do not put service-role keys or database credentials in `NEXT_PUBLIC_*`.

### 6. CI/CD
On pull request: install dependencies, lint, typecheck, unit tests, API tests, build, dependency audit and secret scan. On merge to main: deploy staging/demo. Promote manually after smoke tests. Tag releases and retain last known-good deployment. Database migrations must be reviewed and backwards-compatible.

### 7. Demo reliability
Keep a static read-only fallback report in the repository only if it contains synthetic labelled data. Show a demo banner. Test cold start before judging. Provide a warm-up step and a no-network fallback view. Do not use a fragile free DB as the only store for the demo.

### 8. Backup and recovery
Use scheduled logical DB export where supported, store encrypted backup outside app repo, test restore, and keep schema migrations. If the free service cannot guarantee persistence, treat it as disposable demo infrastructure and keep reproducible seed scripts.
