/*
# MANAK Core Schema — profiles, properties, valuations

## Overview
Creates the foundational tables for the MANAK property valuation platform:
- `profiles` extends Supabase auth.users with role, display name, organization.
- `properties` stores registered residential property records.
- `valuations` stores AI/demo valuation results linked to properties.

## New Tables

### profiles
- `id` (uuid, PK, FK to auth.users) — one row per auth user.
- `email` (text) — cached email for listing.
- `full_name` (text) — display name.
- `role` (text) — one of 'admin', 'valuer', 'analyst'. Default 'valuer'.
- `organization` (text) — housing finance company name.
- `phone` (text) — contact number.
- `created_at`, `updated_at` (timestamptz).

### properties
- `id` (uuid, PK).
- `user_id` (uuid, FK profiles, default auth.uid()) — owner who registered the property.
- Address fields: address, city, state, locality, pincode, latitude, longitude.
- Property details: property_type, built_up_area, carpet_area, plot_area, bedrooms, bathrooms, floor_number, total_floors, property_age, property_condition, furnishing, parking, amenities.
- Additional: construction_quality, building_condition, ownership_type, nearby_facilities, remarks.
- `created_at`, `updated_at`.

### valuations
- `id` (uuid, PK).
- `property_id` (uuid, FK properties) — subject property.
- `user_id` (uuid, FK profiles, default auth.uid()) — valuer who generated it.
- `estimated_value` (numeric) — fair market value estimate.
- `lower_bound`, `upper_bound` (numeric) — indicative range.
- `price_per_sqft` (numeric) — derived price per sq ft.
- `valuation_type` (text) — 'ml' or 'demo'.
- `model_version` (text) — model version used.
- `confidence` (numeric) — confidence score 0–1.
- `data_quality` (text) — 'high', 'medium', 'low'.
- `comparables_count` (int) — number of comparables used.
- `status` (text) — 'completed', 'pending_review', 'draft'.
- `feature_contributions` (jsonb) — SHAP-like explanations.
- `comparable_ids` (jsonb) — array of comparable_sale IDs used.
- `notes` (text).
- `created_at`.

## Security
- RLS enabled on all three tables.
- profiles: each authenticated user reads/updates own profile; admins read all.
- properties: authenticated users CRUD their own; admins + analysts read all.
- valuations: authenticated users CRUD their own; admins + analysts read all.
- Grants restricted to authenticated role only (app requires sign-in).
*/

-- ===== PROFILES =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'valuer' CHECK (role IN ('admin','valuer','analyst')),
  organization text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "select_all_profiles_admin" ON profiles;
CREATE POLICY "select_all_profiles_admin" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ===== PROPERTIES =====
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  locality text,
  pincode text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  property_type text NOT NULL CHECK (property_type IN ('apartment','flat','independent_house','villa')),
  built_up_area numeric,
  carpet_area numeric,
  plot_area numeric,
  bedrooms int,
  bathrooms int,
  floor_number int,
  total_floors int,
  property_age int,
  property_condition text CHECK (property_condition IN ('excellent','good','average','poor')),
  furnishing text CHECK (furnishing IN ('furnished','semi_furnished','unfurnished')),
  parking text CHECK (parking IN ('open','covered','none')),
  amenities text,
  construction_quality text CHECK (construction_quality IN ('premium','standard','basic')),
  building_condition text,
  ownership_type text,
  nearby_facilities text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON properties TO authenticated;

CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_locality ON properties(locality);

DROP POLICY IF EXISTS "select_own_properties" ON properties;
CREATE POLICY "select_own_properties" ON properties FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_all_properties_admin_analyst" ON properties;
CREATE POLICY "select_all_properties_admin_analyst" ON properties FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','analyst'))
  );

DROP POLICY IF EXISTS "insert_own_properties" ON properties;
CREATE POLICY "insert_own_properties" ON properties FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_properties" ON properties;
CREATE POLICY "update_own_properties" ON properties FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_properties" ON properties;
CREATE POLICY "delete_own_properties" ON properties FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== VALUATIONS =====
CREATE TABLE IF NOT EXISTS valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  estimated_value numeric NOT NULL,
  lower_bound numeric,
  upper_bound numeric,
  price_per_sqft numeric,
  valuation_type text NOT NULL DEFAULT 'demo' CHECK (valuation_type IN ('ml','demo')),
  model_version text DEFAULT 'demo-v1',
  confidence numeric DEFAULT 0.5,
  data_quality text DEFAULT 'medium' CHECK (data_quality IN ('high','medium','low')),
  comparables_count int DEFAULT 0,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','pending_review','draft')),
  feature_contributions jsonb,
  comparable_ids jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON valuations TO authenticated;

CREATE INDEX IF NOT EXISTS idx_valuations_user ON valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_valuations_property ON valuations(property_id);
CREATE INDEX IF NOT EXISTS idx_valuations_created ON valuations(created_at);

DROP POLICY IF EXISTS "select_own_valuations" ON valuations;
CREATE POLICY "select_own_valuations" ON valuations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_all_valuations_admin_analyst" ON valuations;
CREATE POLICY "select_all_valuations_admin_analyst" ON valuations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','analyst'))
  );

DROP POLICY IF EXISTS "insert_own_valuations" ON valuations;
CREATE POLICY "insert_own_valuations" ON valuations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_valuations" ON valuations;
CREATE POLICY "update_own_valuations" ON valuations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_valuations" ON valuations;
CREATE POLICY "delete_own_valuations" ON valuations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
