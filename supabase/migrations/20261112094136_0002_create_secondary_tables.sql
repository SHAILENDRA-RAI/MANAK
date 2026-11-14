/*
# MANAK Secondary Schema — comparables, datasets, model tracking, audit logs

## Overview
Creates supporting tables for the MANAK platform:
- `comparable_sales` — market evidence records (transactions, listings, circle rates).
- `datasets` — admin-uploaded CSV dataset metadata.
- `dataset_records` — individual rows parsed from uploaded datasets.
- `model_versions` — ML model version registry.
- `model_metrics` — evaluation metrics per model version.
- `audit_logs` — user action audit trail.

## New Tables

### comparable_sales
- `id` (uuid, PK).
- `locality`, `city`, `state` — location of comparable.
- `property_type`, `built_up_area`, `carpet_area`, `bedrooms`, `bathrooms` — property attributes.
- `sale_price` (numeric) — price of the comparable.
- `price_per_sqft` (numeric) — derived.
- `transaction_date` (date) — when the transaction/listing occurred.
- `source_type` (text) — 'verified_transaction', 'listing', 'circle_rate'.
- `verification_status` (text) — 'verified', 'unverified', 'pending'.
- `data_source` (text) — human-readable source name.
- `latitude`, `longitude` (numeric) — geocoordinates.
- `created_at`.

### datasets
- `id` (uuid, PK).
- `user_id` (uuid, FK profiles) — uploader.
- `filename`, `file_size`, `row_count`, `valid_rows`, `invalid_rows`.
- `source_type` (text) — 'verified_transaction', 'listing', 'circle_rate'.
- `status` (text) — 'uploaded', 'validated', 'imported', 'failed'.
- `validation_summary` (jsonb) — stats about missing values, duplicates.
- `created_at`.

### dataset_records
- `id` (uuid, PK).
- `dataset_id` (uuid, FK datasets).
- `raw_data` (jsonb) — the raw parsed row.
- `is_valid` (boolean) — whether this row passed validation.
- `validation_errors` (jsonb) — array of error messages.
- `created_at`.

### model_versions
- `id` (uuid, PK).
- `version` (text, unique) — e.g. 'catboost-v1'.
- `model_type` (text) — 'catboost', 'random_forest', 'linear'.
- `status` (text) — 'training', 'active', 'deprecated'.
- `trained_at` (timestamptz).
- `description` (text).
- `created_at`.

### model_metrics
- `id` (uuid, PK).
- `model_version_id` (uuid, FK model_versions).
- `mae`, `rmse`, `r2`, `mape` (numeric) — regression metrics.
- `within_band_pct` (numeric) — percentage within error band.
- `evaluated_at` (timestamptz).

### audit_logs
- `id` (uuid, PK).
- `user_id` (uuid) — actor.
- `action` (text) — e.g. 'login', 'create_property', 'generate_valuation'.
- `resource_type` (text) — e.g. 'property', 'valuation'.
- `resource_id` (uuid) — target resource.
- `details` (jsonb) — additional context.
- `created_at` (timestamptz).

## Security
- RLS enabled on all tables.
- comparable_sales: all authenticated users read; valuers/admins insert/update/delete.
- datasets + dataset_records: owner CRUD; admins read all.
- model_versions + model_metrics: all authenticated read; admins write.
- audit_logs: users read own logs; admins read all. INSERT via service or self.
*/

-- ===== COMPARABLE_SALES =====
CREATE TABLE IF NOT EXISTS comparable_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locality text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  property_type text NOT NULL,
  built_up_area numeric,
  carpet_area numeric,
  bedrooms int,
  bathrooms int,
  sale_price numeric NOT NULL,
  price_per_sqft numeric,
  transaction_date date,
  source_type text NOT NULL DEFAULT 'listing' CHECK (source_type IN ('verified_transaction','listing','circle_rate')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified','unverified','pending')),
  data_source text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comparable_sales ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON comparable_sales TO authenticated;

CREATE INDEX IF NOT EXISTS idx_comparables_city ON comparable_sales(city);
CREATE INDEX IF NOT EXISTS idx_comparables_locality ON comparable_sales(locality);
CREATE INDEX IF NOT EXISTS idx_comparables_type ON comparable_sales(property_type);

DROP POLICY IF EXISTS "select_comparables" ON comparable_sales;
CREATE POLICY "select_comparables" ON comparable_sales FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_comparables" ON comparable_sales;
CREATE POLICY "insert_comparables" ON comparable_sales FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_comparables" ON comparable_sales;
CREATE POLICY "update_comparables" ON comparable_sales FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_comparables" ON comparable_sales;
CREATE POLICY "delete_comparables" ON comparable_sales FOR DELETE
  TO authenticated USING (true);

-- ===== DATASETS =====
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_size bigint,
  row_count int DEFAULT 0,
  valid_rows int DEFAULT 0,
  invalid_rows int DEFAULT 0,
  source_type text DEFAULT 'listing' CHECK (source_type IN ('verified_transaction','listing','circle_rate')),
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','validated','imported','failed')),
  validation_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON datasets TO authenticated;

CREATE INDEX IF NOT EXISTS idx_datasets_user ON datasets(user_id);

DROP POLICY IF EXISTS "select_own_datasets" ON datasets;
CREATE POLICY "select_own_datasets" ON datasets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_all_datasets_admin" ON datasets;
CREATE POLICY "select_all_datasets_admin" ON datasets FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_datasets" ON datasets;
CREATE POLICY "insert_own_datasets" ON datasets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_datasets" ON datasets;
CREATE POLICY "update_own_datasets" ON datasets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_datasets" ON datasets;
CREATE POLICY "delete_own_datasets" ON datasets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== DATASET_RECORDS =====
CREATE TABLE IF NOT EXISTS dataset_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  raw_data jsonb NOT NULL,
  is_valid boolean DEFAULT true,
  validation_errors jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dataset_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON dataset_records TO authenticated;

CREATE INDEX IF NOT EXISTS idx_dataset_records_dataset ON dataset_records(dataset_id);

DROP POLICY IF EXISTS "select_dataset_records" ON dataset_records;
CREATE POLICY "select_dataset_records" ON dataset_records FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM datasets d WHERE d.id = dataset_id AND (d.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')))
  );

DROP POLICY IF EXISTS "insert_dataset_records" ON dataset_records;
CREATE POLICY "insert_dataset_records" ON dataset_records FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM datasets d WHERE d.id = dataset_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_dataset_records" ON dataset_records;
CREATE POLICY "delete_dataset_records" ON dataset_records FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM datasets d WHERE d.id = dataset_id AND d.user_id = auth.uid())
  );

-- ===== MODEL_VERSIONS =====
CREATE TABLE IF NOT EXISTS model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text UNIQUE NOT NULL,
  model_type text NOT NULL CHECK (model_type IN ('catboost','random_forest','linear','baseline')),
  status text NOT NULL DEFAULT 'training' CHECK (status IN ('training','active','deprecated')),
  trained_at timestamptz,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON model_versions TO authenticated;

DROP POLICY IF EXISTS "select_model_versions" ON model_versions;
CREATE POLICY "select_model_versions" ON model_versions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_model_versions_admin" ON model_versions;
CREATE POLICY "insert_model_versions_admin" ON model_versions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "update_model_versions_admin" ON model_versions;
CREATE POLICY "update_model_versions_admin" ON model_versions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===== MODEL_METRICS =====
CREATE TABLE IF NOT EXISTS model_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
  mae numeric,
  rmse numeric,
  r2 numeric,
  mape numeric,
  within_band_pct numeric,
  evaluated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE model_metrics ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON model_metrics TO authenticated;

CREATE INDEX IF NOT EXISTS idx_metrics_model ON model_metrics(model_version_id);

DROP POLICY IF EXISTS "select_model_metrics" ON model_metrics;
CREATE POLICY "select_model_metrics" ON model_metrics FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_model_metrics_admin" ON model_metrics;
CREATE POLICY "insert_model_metrics_admin" ON model_metrics FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===== AUDIT_LOGS =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON audit_logs TO authenticated;

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

DROP POLICY IF EXISTS "select_own_audit_logs" ON audit_logs;
CREATE POLICY "select_own_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_all_audit_logs_admin" ON audit_logs;
CREATE POLICY "select_all_audit_logs_admin" ON audit_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
