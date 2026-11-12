# 03 — Database Engineering Specification
## INVICTUS Property Intelligence | PS-01 | Jaipur MVP

### 1. Scope and invariants
The database supports automated valuation of **Jaipur residential apartments only** in the first MVP. It must not imply verified pan-India coverage. The schema is designed for later city/property-type expansion.

Non-negotiable invariants:
- Store source facts separately from derived features and model outputs.
- Preserve provenance, retrieval time, licence/permission status, and source freshness.
- Distinguish `TRANSACTION`, `ASKING`, `GOVERNMENT_BENCHMARK`, `SYNTHETIC_DEMO`, and `OTHER` evidence.
- Never label an asking/listing price as a completed sale price.
- A synthetic demo record must never enter training or validation.
- Do not persist unnecessary personal information from deeds, owners, tenants, or listing contacts.
- A valuation result is an estimate, not a legal valuation certificate or lending approval.

### 2. Recommended platform
PostgreSQL with PostGIS. For a no-cost prototype, Supabase Free is a candidate managed Postgres/auth option; verify current limits before deployment. Local development uses Docker PostgreSQL + PostGIS. Keep SQL migrations portable.

### 3. Logical entities
`users`, `roles`, `user_roles`, `cities`, `localities`, `properties`, `property_observations`, `data_sources`, `source_records`, `comparable_sales`, `geospatial_features`, `market_features`, `model_versions`, `model_runs`, `valuations`, `valuation_factors`, `valuation_comparables`, `audit_events`, `feedback`.

### 4. Table contracts
- `users(id UUID PK, email CITEXT UNIQUE, display_name, is_active, created_at)`.
- `roles(id SMALLINT PK, code UNIQUE, description)`; seed `ADMIN`, `VALUATION_ANALYST`, `LOAN_OFFICER`, `DEMO_VIEWER`.
- `user_roles(user_id FK, role_id FK, assigned_by FK, assigned_at, PK(user_id,role_id))`.
- `cities(id UUID PK, name, state, country_code, enabled, created_at)`; Jaipur seeded as enabled.
- `localities(id UUID PK, city_id FK, canonical_name, aliases JSONB, centroid GEOGRAPHY(Point,4326), boundary GEOMETRY(MultiPolygon,4326) NULL, source_id FK NULL)`.
- `properties(id UUID PK, city_id FK, locality_id FK, property_type, sub_type, latitude, longitude, location GEOGRAPHY(Point,4326), project_name NULL, building_name NULL, carpet_area_sqft NULL, built_up_area_sqft NULL, super_built_up_area_sqft NULL, bedrooms NULL, bathrooms NULL, floor_number NULL, total_floors NULL, age_years NULL, furnishing NULL, parking_count NULL, status, created_by FK, created_at, updated_at)`.
- `property_observations(id UUID PK, property_id FK, observed_at, attribute_name, value_text, value_numeric, unit, source_record_id FK, confidence_tag, valid_from, valid_to)`. Immutable observation history.
- `data_sources(id UUID PK, name, publisher, source_type, source_url, licence_name, licence_url, permission_status ENUM, access_method, refresh_frequency, attribution_text, notes)`. `permission_status`: `APPROVED`, `PUBLIC_TERMS_REVIEWED`, `REQUEST_REQUIRED`, `UNKNOWN`, `PROHIBITED`.
- `source_records(id UUID PK, source_id FK, external_id NULL, evidence_type ENUM, record_date NULL, retrieved_at, payload JSONB, content_hash, location GEOGRAPHY(Point,4326) NULL, locality_id FK NULL, dedupe_key, quality_status, exclusion_reason NULL)`.
- `comparable_sales(id UUID PK, source_record_id FK UNIQUE, property_type, locality_id FK, location GEOGRAPHY(Point,4326), consideration_inr NUMERIC(16,2), area_sqft NUMERIC(12,2), rate_per_sqft NUMERIC(12,2), transaction_date DATE, evidence_type, verification_status, included_in_training BOOLEAN DEFAULT FALSE)`. Only verified lawful transaction evidence can be marked as training eligible.
- `geospatial_features(id UUID PK, property_id FK, feature_code, value_numeric NULL, value_text NULL, distance_m NULL, source_record_id FK NULL, measured_at, quality_tag)`.
- `market_features(id UUID PK, locality_id FK, feature_code, period_start, period_end, value_numeric, unit, evidence_type, source_record_id FK, created_at)`.
- `model_versions(id UUID PK, model_name, version, artifact_uri, training_data_snapshot, feature_schema_version, metrics JSONB, validation_protocol JSONB, approved_for_demo BOOLEAN, created_at)`.
- `model_runs(id UUID PK, model_version_id FK, property_id FK, input_snapshot JSONB, prediction_inr, lower_bound_inr NULL, upper_bound_inr NULL, confidence_band, confidence_rationale JSONB, run_status, latency_ms, created_at)`.
- `valuations(id UUID PK, property_id FK, model_run_id FK UNIQUE, requested_by FK, valuation_status, estimated_value_inr, range_low_inr NULL, range_high_inr NULL, evidence_grade, disclaimer_version, created_at)`.
- `valuation_factors(id UUID PK, valuation_id FK, factor_code, direction, contribution_summary, importance_rank, explanation_method, explanation_payload JSONB)`.
- `valuation_comparables(id UUID PK, valuation_id FK, comparable_sales_id FK, similarity_score, distance_m, adjustment_summary JSONB, display_rank)`.
- `audit_events(id UUID PK, actor_user_id FK NULL, action, entity_type, entity_id, request_id, ip_hash NULL, metadata JSONB, created_at)`.
- `feedback(id UUID PK, valuation_id FK, user_id FK, feedback_type, comment_redacted NULL, created_at)`.

### 5. Constraints and indexes
- Check positive areas, prices, floor counts, and coordinates; latitude [-90,90], longitude [-180,180].
- `rate_per_sqft = consideration_inr / area_sqft` computed in ingestion, not user-entered.
- Unique `(model_name, version)`; unique content hash within source where appropriate.
- GiST indexes on property/locality/comparable geography; B-tree indexes on city, locality, property_type, transaction_date, evidence_type, created_at; GIN on JSONB only for query paths proven necessary.
- Use soft deactivation for users; do not hard-delete audit history.
- Enforce row-level access where supported and always enforce authorization in API.

### 6. Data lifecycle
Ingest raw source record → validate source permission → normalize → deduplicate → geocode/match → quality gate → curated record → feature snapshot → model run → valuation + explanations → audit event. Reprocessing must be idempotent using `dedupe_key` and content hash.

### 7. Demo seed policy
Seed only clearly marked `SYNTHETIC_DEMO` records for UI demonstrations. Add `is_demo`/evidence type and a visible UI banner. Synthetic data must be excluded from model training, model metrics, and any claim of market accuracy. Never fabricate actual Jaipur transaction observations.

### 8. Retention and privacy
Retain source records only as allowed by source terms. Store source URLs and hashes rather than copying restricted content. Do not ingest party names, phone numbers, Aadhaar, PAN, deed scans, or other sensitive identifiers for the MVP. Define retention and deletion schedule before any real customer deployment.
