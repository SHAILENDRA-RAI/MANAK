export type UserRole = 'admin' | 'valuer' | 'analyst';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  organization: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type PropertyType = 'apartment' | 'flat' | 'independent_house' | 'villa';
export type PropertyCondition = 'excellent' | 'good' | 'average' | 'poor';
export type Furnishing = 'furnished' | 'semi_furnished' | 'unfurnished';
export type Parking = 'open' | 'covered' | 'none';
export type ConstructionQuality = 'premium' | 'standard' | 'basic';

export interface Property {
  id: string;
  user_id: string;
  address: string;
  city: string;
  state: string;
  locality: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  property_type: PropertyType;
  built_up_area: number | null;
  carpet_area: number | null;
  plot_area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_number: number | null;
  total_floors: number | null;
  property_age: number | null;
  property_condition: PropertyCondition | null;
  furnishing: Furnishing | null;
  parking: Parking | null;
  amenities: string | null;
  construction_quality: ConstructionQuality | null;
  building_condition: string | null;
  ownership_type: string | null;
  nearby_facilities: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export type ValuationType = 'ml' | 'demo';
export type ValuationStatus = 'completed' | 'pending_review' | 'draft';
export type DataQuality = 'high' | 'medium' | 'low';

export interface FeatureContribution {
  feature: string;
  label: string;
  impact: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface Valuation {
  id: string;
  property_id: string;
  user_id: string;
  estimated_value: number;
  lower_bound: number | null;
  upper_bound: number | null;
  price_per_sqft: number | null;
  valuation_type: ValuationType;
  model_version: string;
  confidence: number;
  data_quality: DataQuality;
  comparables_count: number;
  status: ValuationStatus;
  feature_contributions: FeatureContribution[] | null;
  comparable_ids: string[] | null;
  notes: string | null;
  created_at: string;
  property?: Property;
}

export type SourceType = 'verified_transaction' | 'listing' | 'circle_rate';
export type VerificationStatus = 'verified' | 'unverified' | 'pending';

export interface ComparableSale {
  id: string;
  locality: string;
  city: string;
  state: string;
  property_type: PropertyType;
  built_up_area: number | null;
  carpet_area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sale_price: number;
  price_per_sqft: number | null;
  transaction_date: string | null;
  source_type: SourceType;
  verification_status: VerificationStatus;
  data_source: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Dataset {
  id: string;
  user_id: string;
  filename: string;
  file_size: number | null;
  row_count: number;
  valid_rows: number;
  invalid_rows: number;
  source_type: SourceType;
  status: string;
  validation_summary: Record<string, unknown> | null;
  created_at: string;
}

export interface ModelVersion {
  id: string;
  version: string;
  model_type: string;
  status: string;
  trained_at: string | null;
  description: string | null;
  created_at: string;
}

export interface ModelMetric {
  id: string;
  model_version_id: string;
  mae: number | null;
  rmse: number | null;
  r2: number | null;
  mape: number | null;
  within_band_pct: number | null;
  evaluated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}
