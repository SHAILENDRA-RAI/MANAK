import {
  Building2,
  Home,
  Hotel,
  Palmtree,
  type LucideIcon,
} from 'lucide-react';
import type {
  PropertyType,
  PropertyCondition,
  Furnishing,
  Parking,
  ConstructionQuality,
  SourceType,
  VerificationStatus,
  ValuationStatus,
  DataQuality,
  UserRole,
} from './types';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartment',
  flat: 'Flat',
  independent_house: 'Independent House',
  villa: 'Villa',
};

export const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as PropertyType, label })
);

export const PROPERTY_CONDITION_LABELS: Record<PropertyCondition, string> = {
  excellent: 'Excellent',
  good: 'Good',
  average: 'Average',
  poor: 'Poor',
};

export const PROPERTY_CONDITION_OPTIONS = Object.entries(
  PROPERTY_CONDITION_LABELS
).map(([value, label]) => ({ value: value as PropertyCondition, label }));

export const FURNISHING_LABELS: Record<Furnishing, string> = {
  furnished: 'Furnished',
  semi_furnished: 'Semi-Furnished',
  unfurnished: 'Unfurnished',
};

export const FURNISHING_OPTIONS = Object.entries(FURNISHING_LABELS).map(
  ([value, label]) => ({ value: value as Furnishing, label })
);

export const PARKING_LABELS: Record<Parking, string> = {
  open: 'Open Parking',
  covered: 'Covered Parking',
  none: 'No Parking',
};

export const PARKING_OPTIONS = Object.entries(PARKING_LABELS).map(
  ([value, label]) => ({ value: value as Parking, label })
);

export const CONSTRUCTION_QUALITY_LABELS: Record<ConstructionQuality, string> =
  {
    premium: 'Premium',
    standard: 'Standard',
    basic: 'Basic',
  };

export const CONSTRUCTION_QUALITY_OPTIONS = Object.entries(
  CONSTRUCTION_QUALITY_LABELS
).map(([value, label]) => ({ value: value as ConstructionQuality, label }));

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  verified_transaction: 'Verified Transaction',
  listing: 'Property Listing (Asking Price)',
  circle_rate: 'Government Reference / Circle Rate',
};

export const SOURCE_TYPE_SHORT: Record<SourceType, string> = {
  verified_transaction: 'Transaction',
  listing: 'Listing',
  circle_rate: 'Circle Rate',
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  verified: 'Verified',
  unverified: 'Unverified',
  pending: 'Pending',
};

export const VALUATION_STATUS_LABELS: Record<ValuationStatus, string> = {
  completed: 'Completed',
  pending_review: 'Pending Review',
  draft: 'Draft',
};

export const DATA_QUALITY_LABELS: Record<DataQuality, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  valuer: 'Valuer',
  analyst: 'Analyst',
};

export const INDIAN_STATES = [
  'Rajasthan',
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Haryana',
  'Punjab',
  'Kerala',
];

export const PROPERTY_TYPE_ICON: Record<PropertyType, LucideIcon> = {
  apartment: Building2,
  flat: Building2,
  independent_house: Home,
  villa: Palmtree,
};
