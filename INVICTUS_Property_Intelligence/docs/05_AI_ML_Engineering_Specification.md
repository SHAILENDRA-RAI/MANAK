# 05 — AI/ML Engineering Specification
## Property valuation | Jaipur residential apartments

### 1. Model objective
Estimate fair market value for a specified Jaipur residential apartment using defensible, traceable evidence. The model is not a loan approval model. The initial system must prefer an honest `INSUFFICIENT_EVIDENCE` response over an unsupported estimate.

### 2. Evidence tiers
- Tier A: verified arm's-length completed sale/registration evidence with usable property attributes and permitted use.
- Tier B: credible public/partner market observations with transparent source and date, but not verified sale consideration.
- Tier C: asking/listing prices, explicitly labelled and modelled separately from transactions.
- Tier D: government DLC/circle benchmark rates; useful as a regulatory/reference floor or plausibility context, not equivalent to achieved market price.
- Tier E: synthetic demo examples; UI-only, never train/evaluate or support market claims.

No public source identified in this research establishes an openly downloadable, complete, labelled Jaipur apartment transaction-price dataset with reusable training rights. This is a critical dependency, not a detail to paper over.

### 3. Proposed model strategy
Start with transparent baselines:
1. Locality × property-type median rate baseline, with robust filtering.
2. Comparable-property retrieval using locality/geospatial distance, area, age, bedrooms, floor, building/project and recency.
3. Gradient-boosted tabular model (CatBoost or LightGBM) only after sufficient permitted labelled examples exist.
4. Blend model output with comparable evidence only after out-of-sample validation demonstrates improvement.
5. Use SHAP or another validated explanation method for feature contribution; explanations must be consistent with the final prediction.

Algorithm choice is evidence-led. Do not assert CatBoost/LightGBM is superior before evaluation. Keep model interface interchangeable.

### 4. Feature families
- Property: area (retain carpet/built-up/super-built-up distinctions), bedrooms, bathrooms, floor, total floors, age, furnishing, condition, parking, amenities.
- Location: locality, coordinates, micro-market, distance to major roads/transport/education/healthcare/retail, land-use context where lawfully sourced.
- Market: time period, locality trend, supply/asking indicators, observed comparable count and dispersion.
- Evidence: source type, transaction/listing distinction, observation age, verification state, attribute completeness.
- Infrastructure: only verified project status and source date; distinguish proposed, under-construction and operational infrastructure.

Avoid sensitive personal attributes and proxy variables unrelated to property value.

### 5. Data preparation
- Freeze raw snapshots and data dictionary.
- Normalize INR, dates, area units and locality aliases.
- Preserve original area field and area basis; do not mix carpet with super built-up area.
- Deduplicate by source ID/content hash/address+attributes with manual review queue for ambiguous collisions.
- Flag outliers; never delete solely because price is unusual.
- Detect duplicate/reposted listings and stale observations.
- Geocode with confidence and retain original locality/address input separately.
- Missing values: explicit missingness indicators; no silent imputation of critical features.
- Exclude synthetic/demo, unverified, non-arm's-length, disputed, and licence-ineligible records from training.

### 6. Training and validation
Use time-aware and geographic holdouts. Avoid random row split alone. Keep all records for the same project/building or duplicate property in one split to prevent leakage. Report:
- MAE (INR)
- Median Absolute Percentage Error (MdAPE)
- MAPE only with a documented treatment of near-zero denominators
- Percentage of predictions within ±10% and ±20%
- Error by locality, price band, property age, area band and evidence tier
- Number of test observations and coverage of target market
Compare to simple locality median and comparable-sales baseline. Compare to an incumbent AVM only if its outputs are lawfully obtained and evaluated on the same holdout set.

No “95% accuracy” or similar marketing claim without a reproducible benchmark. Display metrics with dataset snapshot, date range, sample size, split protocol and confidence interval where feasible.

### 7. Explainability and uncertainty
Every result should expose:
- Estimated value and currency.
- Main positive/negative drivers with plain-language descriptions.
- Comparable evidence and adjustments.
- Model version and evidence dates.
- Confidence/evidence band with explicit reasons.
- Range only when a prediction interval or conformal interval has been calibrated on representative held-out data.

Before calibration, show `NOT CALIBRATED`, suppress numeric range, and use qualitative evidence bands. Do not present SHAP values as causal explanations.

### 8. Monitoring and governance
Monitor drift in locality mix, input distributions, price residuals, missingness, source freshness, model latency and failure rates. Retrain only after data review and approval. Version datasets, code, feature schema and artifacts. Keep champion/challenger results. Roll back model versions. Human review for low evidence, out-of-distribution cases, unusual property type, and conflicting sources.

### 9. MVP fallback
If only sparse/public benchmark data is available, ship a transparent comparable/rule-based demonstrator and label it as prototype. Use synthetic cases strictly to test UI flows. A real market-value claim requires a sufficiently representative, permitted, labelled dataset.
