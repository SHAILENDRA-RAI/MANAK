# 06 — Data Acquisition & Integration Specification
## Jaipur, Rajasthan | source review dated 12 November 2026

### 1. Findings and hard limitation
Research located official Rajasthan reference portals and geospatial planning resources, but did **not** verify an openly downloadable, complete Jaipur apartment sale-price dataset with explicit ML reuse rights. Do not scrape gated deed search, bypass CAPTCHA/login, or infer transaction prices from DLC rates. Treat access to transaction-level registered consideration as `REQUEST_REQUIRED` until the department provides a permitted export/API and terms.

### 2. Prioritized source register
| Source | What it can support | Access / limitation | MVP treatment |
|---|---|---|---|
| Rajasthan ePanjiyan / Registration & Stamps | DLC rates, citizen valuation service, document search entry points | Official portal exposes DLC information and search functions; public web pages do not establish bulk open API or ML reuse rights | Manually verify published DLC reference values if terms permit; no automated scraping or deed extraction |
| RajDharaa Urban GIS Portal | Land-use, khasra, plot/scheme, urban jurisdiction, public services, roads and related map layers | Portal disclaimer says displayed khasra/master-plan layers are for viewing and not legal use; verify layer-specific download/API and terms | Human-verified location context; only ingest/export layers with permission |
| Jaipur Development Authority Master Development Plan 2025 | Base, existing, land-utilization and land-use maps; planning context | Official JDA pages publish plan volumes and maps; verify map reuse rights and current amendments | Contextual feature with date and “planning designation, not market price” label |
| OpenStreetMap | Road network, POIs and distance features | ODbL attribution/share-alike obligations; public Nominatim is rate-limited and not for bulk geocoding | Use OSM extracts or a compliant provider; cache; show attribution |
| Public listing portals | Asking-price observations, listing attributes, supply indicators | Terms may prohibit scraping/reuse; listings are asking prices, often duplicated/stale | Do not scrape; use only licensed exports, partner data or manually curated observations where terms allow |
| Census / official statistical datasets | Area-level demographic or urban context | Geography/time resolution may not align with apartment valuation; check licences | Optional contextual features, not direct price labels |
| Satellite imagery providers / Bhuvan | Built-up/land-cover context, imagery | Provider-specific licence, attribution and access restrictions | Phase 2; no imagery-derived feature until permissions and reproducible extraction are confirmed |

### 3. Official starting points
- ePanjiyan: https://mobileepanjiyan.rajasthan.gov.in/epanjiyandlc/
- DLC district information: https://mobileepanjiyan.rajasthan.gov.in/epanjiyandlc/dlcdistrict.aspx
- ePanjiyan search page: https://mobileepanjiyan.rajasthan.gov.in/epanjiyandlc/e-search-page.aspx
- RajDharaa Urban GIS: https://rajdharaa.rajasthan.gov.in/citizenudh/
- JDA Master Development Plan 2025: https://lsg.urban.rajasthan.gov.in/content/raj/udh/jda---jaipur/en/town-planning/master-development--plan-2025.html
- OSM Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/

### 4. Collection and permission workflow
For every source, record publisher, URL, access date, terms URL, licence, permitted purpose, redistribution status, attribution, refresh cadence, API limits, and contact/permission evidence. Do not activate ingestion while status is `UNKNOWN`, `REQUEST_REQUIRED`, or `PROHIBITED`. Save a screenshot or archival note of terms at approval time.

### 5. Ingestion pipeline
1. Source registry gate.
2. Fetch permitted file/API; respect robots, rate limits and terms.
3. Store immutable raw payload or permitted metadata/hash.
4. Parse into canonical staging schema.
5. Normalize locality names, dates, units and INR.
6. Validate coordinate bounds and geospatial match quality.
7. Deduplicate; retain all provenance links.
8. Apply quality rules and evidence tier.
9. Publish curated records only after review.
10. Generate versioned feature snapshot for modelling.

### 6. Quality rules
- Asking vs transaction must be explicit and never conflated.
- DLC benchmark is not a completed transaction.
- Store carpet, built-up and super built-up area independently.
- Reject invalid area/price/coordinates; quarantine uncertain cases.
- Retain original source text and normalized value where permitted.
- Record date of observation and date of retrieval separately.
- Mark geocoding confidence and locality match method.
- Track stale listings and repeated listing IDs.
- Keep source-specific refresh and failure logs.

### 7. Free/low-cost API strategy
- Map display: Leaflet + OpenStreetMap tiles, subject to tile provider policy and attribution. For production traffic, use a provider with suitable free tier or self-hosted tiles; do not assume OSM tile servers are unlimited.
- Geocoding: prefer user-confirmed map pin/locality selection for demo. Public Nominatim has a maximum 1 request/second, requires identifying User-Agent/Referer, attribution, caching, and prohibits autocomplete and systematic bulk queries.
- Routing/distance: derive distances from a licensed OSM extract locally rather than repeated public API calls.
- No API is assumed to expose Jaipur registered sale consideration for free.

### 8. Data gaps and escalation
Priority 0: seek written permission / data-sharing route for anonymized Jaipur apartment transaction records from Registration & Stamps Department or a legitimate data partner. Request fields, historical period, geographic granularity, area basis, consideration, transaction type, corrections, sample access, licence, and retention rights.
Priority 1: collect permitted property attributes and locality context.
Priority 2: build a small manually quality-reviewed comparable set with explicit evidence types and usage rights.
Priority 3: imagery and advanced infrastructure features only after permissions.
