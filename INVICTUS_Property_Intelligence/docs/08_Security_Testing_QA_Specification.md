# 08 — Security, Testing & QA Specification

### 1. Security baseline
- HTTPS only in hosted environments.
- JWT verification server-side; short-lived tokens and secure refresh flow.
- RBAC on every protected endpoint; test object-level access to prevent IDOR.
- Secrets only in deployment environment variables; never commit `.env`.
- Validate and constrain all inputs; parameterized SQL/ORM; output escaping.
- CORS allowlist, rate limiting, request size limits, timeouts.
- No sensitive personal data in logs. Redact comments and provider payloads.
- Audit all valuation creation, edits, exports, role changes, source changes and model activation.
- Dependency scanning, pinned versions, secret scanning and GitHub Dependabot.
- Backups and restore test before any real data is used.
- Do not upload deeds or identity documents in the MVP.

### 2. Privacy and compliance posture
This prototype is not represented as a certified regulated valuation system. Before lender/customer production use, obtain legal review of data rights, privacy notices, DPDP Act applicability, retention, consent/legal basis, security controls, outsourcing/vendor risk and applicable RBI/lender policies. Avoid claiming regulatory approval.

### 3. Test pyramid
- Unit: feature engineering, unit conversions, price-per-area, validation, evidence-tier rules, confidence labels, permission checks.
- Integration: DB migrations, API, auth provider, model adapter, data source registry.
- Contract: OpenAPI schemas and frontend API client.
- Model: leakage tests, geographic/time split integrity, baseline comparison, metric reproducibility, calibration.
- End-to-end: login, create property, coverage review, run valuation, inspect report, audit, role restrictions.
- Accessibility: keyboard, labels, contrast, chart text alternatives.
- Security: auth bypass, IDOR, injection, XSS, CSRF where applicable, rate limits, secrets exposure.

### 4. Mandatory test cases
1. Jaipur residential apartment accepted.
2. Non-Jaipur city rejected with explicit scope error.
3. Commercial property rejected in MVP.
4. Carpet area not silently treated as super built-up.
5. Negative/zero area rejected.
6. Invalid coordinates rejected.
7. Listing evidence never shown as transaction.
8. DLC benchmark never shown as transaction.
9. Synthetic data excluded from training and reported metrics.
10. No numeric range when calibration is absent.
11. Low evidence returns `INSUFFICIENT_EVIDENCE` or low confidence with rationale.
12. Demo viewer cannot mutate property, model or sources.
13. Loan officer cannot administer users or model versions.
14. Analyst cannot activate a model unless role policy allows.
15. Every valuation stores model version and input snapshot.
16. Every export creates audit event.
17. Expired/invalid JWT rejected.
18. Model unavailable produces safe 503/controlled fallback.
19. Source terms unknown blocks ingestion.
20. Stale source is visibly flagged.

### 5. Release gates
- No critical/high security issue open.
- All scope and evidence integrity tests pass.
- Reproducible model metrics or explicit “not yet validated” status.
- No fabricated data/source/accuracy claims in demo.
- Disclaimer visible in result and report.
- Restore and rollback procedure documented.
