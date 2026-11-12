# 10 — Master Developer Handoff
## INVICTUS Property Intelligence | PS-01

### 1. Product definition
INVICTUS is an AI-assisted property valuation and collateral intelligence prototype. Initial operational scope: Jaipur, Rajasthan; residential apartments. It is not a full mortgage underwriting engine, customer credit scoring system, KYC platform, loan approval engine, or formal valuation certificate.

### 2. Problem statement alignment
The product addresses PS-01: digital property valuation using structured and unstructured/alternative information, explainability, automation, scalability design and lending workflow relevance. The MVP proves the Jaipur apartment workflow; architecture and roadmap describe expansion across India and commercial/residential classes. Do not claim national operational coverage.

### 3. User roles
1. Administrator — manage users, source registry, model metadata and audit.
2. Valuation Analyst — capture property facts, review data coverage, run valuation, inspect evidence and prepare report.
3. Loan Officer — read valuation and preliminary collateral indicators; no model/data administration.
4. Demo Viewer / Judge — read-only curated demo journeys, no access to live customer data.
This role split keeps the judging experience safe and distinct from operational privileges.

### 4. Build order
Phase 0: repository, environment, lint/test, design tokens, DB migrations.
Phase 1: auth/RBAC, app shell, scope enforcement.
Phase 2: property capture, locality selector, location confirmation, data coverage.
Phase 3: source registry, seed fixtures, provenance and evidence labels.
Phase 4: comparable retrieval and transparent baseline valuation.
Phase 5: explanation/result/report/audit.
Phase 6: model performance and data intelligence dashboards.
Phase 7: geospatial context and map.
Phase 8: deployment, smoke tests, demo rehearsal.
Phase 9: only then add ML training pipeline once permitted labelled data exists.

### 5. Definition of done
- All 15 screens from UI/UX spec are implemented or explicitly marked planned.
- Jaipur residential apartment scope enforced.
- Synthetic demo data visibly labelled and excluded from model claims.
- Evidence type and provenance visible for every comparable.
- Model version and input snapshot saved for every valuation.
- Confidence and range rules follow ML spec.
- RBAC and audit pass tests.
- No fabricated integrations, market data or accuracy metrics.
- Deployment is reproducible using README and environment template.
- Demo can be completed reliably in under five minutes.

### 6. PS-01 traceability
| PS-01 requirement | Product implementation | Verification |
|---|---|---|
| 1. Scope market | Jaipur apartment MVP + expansion architecture | Scope guard tests and scope banner |
| 2. Combine data sources | Source registry, structured property facts, official GIS/DLC references, OSM where permitted | Provenance and data-quality tests |
| 3. AI/ML model | Baselines → comparable retrieval → boosted model when labels exist | Time/geographic holdout metrics |
| 4. Explainability | Factors, comparable evidence, confidence rationale, model version | Report acceptance tests |
| 5. Automate and scale | API pipeline, ingestion workflow, portable schema, modular city configs | Latency, idempotency and scale tests |
| 6. Enable lending decisions | Preliminary collateral report and indicative LTV | LTV formula tests and disclaimer |

### 7. LTV treatment
If requested loan amount is supplied: `indicative_ltv_pct = requested_loan_amount_inr / estimated_property_value_inr * 100`. Label preliminary/indicative. Do not invent lender policy thresholds or approve/reject a loan. If valuation confidence is low, flag for further review.

### 8. Demo script
1. Sign in as Demo Viewer.
2. Open dashboard; state scope and demo-data banner.
3. Create/select a Jaipur residential apartment.
4. Review property attributes and location.
5. Show data coverage and distinguish official reference, geospatial context, and synthetic demonstration records.
6. Run valuation; show value only if supported by demo model, otherwise show transparent insufficient-evidence state.
7. Explain factors and comparable records.
8. Open report, model metadata, source freshness and audit.
9. Explain lender workflow and escalation of low-confidence cases.
10. State roadmap to verified transaction data and expansion.

### 9. Required repository documents
`README.md`, `docs/03...` through `docs/10...`, `.env.example`, migrations, data dictionary, source register, model card, dataset card, test plan, demo script, disclaimer and architecture diagram.

### 10. Critical risks
- No verified open Jaipur transaction-price training corpus identified.
- Official portals are not equivalent to open APIs/data licences.
- Free hosting can sleep, pause or expire.
- Map/geocoding services have usage/attribution rules.
- Model accuracy cannot be demonstrated until a representative labelled dataset exists.
- The prototype must be presented as a competition prototype, not a production valuation service.
