# INVICTUS Documentation Package — Documents 03–11

This package extends the earlier SRS (01) and UI/UX specification (02). Scope is Jaipur, Rajasthan residential apartments for the MVP.

**Critical data finding:** no openly downloadable, complete Jaipur apartment transaction-price dataset with explicit ML reuse rights was verified during research dated 12 November 2026. Official DLC, GIS and planning sources are reference/context data, not transaction labels. Synthetic demo records must never support model accuracy claims.

Recommended role model: Administrator, Valuation Analyst, Loan Officer (read-only valuation/collateral view), Demo Viewer/Judge (read-only demo-only). This separates operational duties from judging access.

Free-first deployment: GitHub for source control/CI, Cloudflare Pages for static frontend, Render Free for demo FastAPI backend (cold starts), Supabase Free for prototype Postgres/Auth (quotas/pause conditions apply). GitHub Pages is not a backend host and has restrictions for SaaS/commercial use. Verify provider terms and quotas at deployment.

Files 03–11 are provided in both Markdown and DOCX. Read 06 before collecting data and 05 before claiming model accuracy.
