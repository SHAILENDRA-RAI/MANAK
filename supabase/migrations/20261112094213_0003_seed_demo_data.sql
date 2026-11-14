/*
# MANAK Seed Data — Jaipur Demo Comparables + Model Versions

## Overview
Seeds the database with clearly-labelled DEMO synthetic property records from Jaipur, Rajasthan
for demonstrating the valuation workflow. Also seeds a demo model version and its metrics.

## Data Inserted
- 24 comparable_sales records across Jaipur localities (Vaishali Nagar, Malviya Nagar, Mansarovar,
  C-Scheme, Jagatpura, Tonk Road, Vaishali, Nirman Nagar) with property types apartment, flat,
  independent_house, villa. Source types include verified_transaction, listing, circle_rate.
  All records are flagged as DEMO DATA in the data_source field.
- 2 model_versions: demo-v1 (baseline) and catboost-v1 (catboost, deprecated — no real training data).
- 1 model_metrics record for demo-v1 with indicative metrics clearly labelled as demo.

## Important Notes
1. ALL comparable records are DEMO DATA — synthetic, not real transactions.
2. Model metrics are indicative demo values, NOT real evaluation results.
3. These records exist solely to demonstrate the valuation workflow end-to-end.
4. Replace with legally obtained verified transaction data for production use.
*/

INSERT INTO model_versions (version, model_type, status, trained_at, description)
VALUES
  ('demo-v1', 'baseline', 'active', now(), 'DEMO baseline comparable-based estimator. Not a trained ML model.'),
  ('catboost-v1', 'catboost', 'deprecated', now(), 'DEMO CatBoost model placeholder. No real training data available yet.')
ON CONFLICT (version) DO NOTHING;

INSERT INTO model_metrics (model_version_id, mae, rmse, r2, mape, within_band_pct)
SELECT id, 285000, 412000, 0.78, 12.4, 68.0
FROM model_versions WHERE version = 'demo-v1'
ON CONFLICT DO NOTHING;

INSERT INTO comparable_sales (locality, city, state, property_type, built_up_area, carpet_area, bedrooms, bathrooms, sale_price, price_per_sqft, transaction_date, source_type, verification_status, data_source, latitude, longitude) VALUES
-- Vaishali Nagar
('Vaishali Nagar', 'Jaipur', 'Rajasthan', 'apartment', 1450, 1180, 3, 2, 6850000, 4724, '2025-01-15', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.9124, 75.7873),
('Vaishali Nagar', 'Jaipur', 'Rajasthan', 'flat', 1100, 880, 2, 2, 4950000, 4500, '2025-02-20', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.9156, 75.7849),
('Vaishali Nagar', 'Jaipur', 'Rajasthan', 'apartment', 1650, 1340, 3, 3, 8200000, 4970, '2025-03-10', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.9189, 75.7812),
('Vaishali Nagar', 'Jaipur', 'Rajasthan', 'villa', 2400, 2100, 4, 4, 14500000, 6042, '2025-01-28', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.9201, 75.7798),
-- Malviya Nagar
('Malviya Nagar', 'Jaipur', 'Rajasthan', 'apartment', 1250, 1000, 2, 2, 5500000, 4400, '2025-02-05', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.8542, 75.8206),
('Malviya Nagar', 'Jaipur', 'Rajasthan', 'flat', 950, 760, 2, 1, 3800000, 4000, '2025-03-18', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.8567, 75.8183),
('Malviya Nagar', 'Jaipur', 'Rajasthan', 'independent_house', 1800, 1500, 3, 3, 9800000, 5444, '2025-01-22', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.8512, 75.8225),
('Malviya Nagar', 'Jaipur', 'Rajasthan', 'apartment', 1550, 1260, 3, 2, 7400000, 4774, '2025-04-02', 'circle_rate', 'verified', 'DEMO DATA - synthetic', 26.8588, 75.8167),
-- Mansarovar
('Mansarovar', 'Jaipur', 'Rajasthan', 'flat', 850, 680, 1, 1, 2950000, 3471, '2025-02-12', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.8645, 75.7689),
('Mansarovar', 'Jaipur', 'Rajasthan', 'apartment', 1150, 920, 2, 2, 4650000, 4043, '2025-03-25', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.8678, 75.7656),
('Mansarovar', 'Jaipur', 'Rajasthan', 'flat', 1000, 800, 2, 1, 3900000, 3900, '2025-01-30', 'circle_rate', 'verified', 'DEMO DATA - synthetic', 26.8623, 75.7712),
('Mansarovar', 'Jaipur', 'Rajasthan', 'independent_house', 1600, 1320, 3, 2, 7800000, 4875, '2025-04-15', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.8698, 75.7634),
-- C-Scheme
('C-Scheme', 'Jaipur', 'Rajasthan', 'apartment', 1800, 1470, 3, 3, 11500000, 6389, '2025-02-08', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.9120, 75.8034),
('C-Scheme', 'Jaipur', 'Rajasthan', 'villa', 3200, 2800, 5, 5, 24500000, 7656, '2025-01-18', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.9145, 75.8067),
('C-Scheme', 'Jaipur', 'Rajasthan', 'flat', 1400, 1120, 3, 2, 8800000, 6286, '2025-03-22', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.9089, 75.8012),
('C-Scheme', 'Jaipur', 'Rajasthan', 'apartment', 2000, 1640, 4, 3, 14800000, 7400, '2025-04-05', 'circle_rate', 'verified', 'DEMO DATA - synthetic', 26.9167, 75.8089),
-- Jagatpura
('Jagatpura', 'Jaipur', 'Rajasthan', 'flat', 1050, 840, 2, 2, 3850000, 3667, '2025-02-15', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.7891, 75.8567),
('Jagatpura', 'Jaipur', 'Rajasthan', 'apartment', 1350, 1080, 3, 2, 5600000, 4148, '2025-03-08', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.7923, 75.8534),
('Jagatpura', 'Jaipur', 'Rajasthan', 'independent_house', 1700, 1400, 3, 3, 8200000, 4824, '2025-01-25', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.7956, 75.8501),
-- Tonk Road
('Tonk Road', 'Jaipur', 'Rajasthan', 'apartment', 1600, 1300, 3, 3, 9200000, 5750, '2025-02-28', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.8723, 75.8056),
('Tonk Road', 'Jaipur', 'Rajasthan', 'villa', 2800, 2400, 4, 4, 18500000, 6607, '2025-03-15', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.8756, 75.8089),
('Tonk Road', 'Jaipur', 'Rajasthan', 'flat', 1200, 960, 2, 2, 6200000, 5167, '2025-04-10', 'circle_rate', 'verified', 'DEMO DATA - synthetic', 26.8689, 75.8023),
-- Nirman Nagar
('Nirman Nagar', 'Jaipur', 'Rajasthan', 'flat', 900, 720, 1, 1, 2750000, 3056, '2025-02-18', 'listing', 'unverified', 'DEMO DATA - synthetic', 26.8891, 75.7667),
('Nirman Nagar', 'Jaipur', 'Rajasthan', 'apartment', 1300, 1050, 2, 2, 5300000, 4077, '2025-03-30', 'verified_transaction', 'verified', 'DEMO DATA - synthetic', 26.8923, 75.7634)
ON CONFLICT DO NOTHING;
