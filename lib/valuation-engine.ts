import type { Property, ComparableSale, FeatureContribution, DataQuality } from './types';
import { PROPERTY_TYPE_LABELS, PROPERTY_CONDITION_LABELS } from './constants';

export interface ValuationResult {
  estimatedValue: number;
  lowerBound: number;
  upperBound: number;
  pricePerSqft: number;
  comparablesCount: number;
  comparables: ComparableSale[];
  dataQuality: DataQuality;
  confidence: number;
  modelVersion: string;
  valuationType: 'ml' | 'demo';
  featureContributions: FeatureContribution[];
  notes: string;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findComparables(
  property: Property,
  allComparables: ComparableSale[],
  maxCount = 8
): ComparableSale[] {
  let candidates = allComparables.filter(
    (c) => c.city.toLowerCase() === property.city.toLowerCase()
  );

  if (property.locality) {
    const sameLocality = candidates.filter(
      (c) => c.locality.toLowerCase() === property.locality!.toLowerCase()
    );
    if (sameLocality.length >= 3) {
      candidates = sameLocality;
    }
  }

  if (candidates.length === 0) return [];

  const scored = candidates.map((c) => {
    let score = 0;
    if (property.locality && c.locality.toLowerCase() === property.locality.toLowerCase()) score += 30;
    if (c.property_type === property.property_type) score += 25;
    if (property.bedrooms && c.bedrooms === property.bedrooms) score += 15;
    if (property.latitude && property.longitude && c.latitude && c.longitude) {
      const dist = haversineDistance(
        property.latitude,
        property.longitude,
        c.latitude,
        c.longitude
      );
      score += Math.max(0, 20 - dist * 2);
    }
    if (c.verification_status === 'verified') score += 10;
    if (c.source_type === 'verified_transaction') score += 5;
    return { comp: c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxCount).map((s) => s.comp);
}

export function calculateDemoValuation(
  property: Property,
  comparables: ComparableSale[]
): ValuationResult {
  if (comparables.length === 0) {
    return {
      estimatedValue: 0,
      lowerBound: 0,
      upperBound: 0,
      pricePerSqft: 0,
      comparablesCount: 0,
      comparables: [],
      dataQuality: 'low',
      confidence: 0.2,
      modelVersion: 'demo-v1',
      valuationType: 'demo',
      featureContributions: [],
      notes:
        'No comparable records found for this location. Estimate is not reliable. Please add more comparable data.',
    };
  }

  const areaForCalc = property.carpet_area || property.built_up_area || 0;
  const verified = comparables.filter((c) => c.verification_status === 'verified');
  const referenceSet = verified.length >= 3 ? verified : comparables;

  const pricesPerSqft = referenceSet
    .map((c) => c.price_per_sqft || (c.built_up_area ? c.sale_price / c.built_up_area : 0))
    .filter((p) => p > 0);

  if (pricesPerSqft.length === 0) {
    return {
      estimatedValue: 0,
      lowerBound: 0,
      upperBound: 0,
      pricePerSqft: 0,
      comparablesCount: comparables.length,
      comparables,
      dataQuality: 'low',
      confidence: 0.3,
      modelVersion: 'demo-v1',
      valuationType: 'demo',
      featureContributions: [],
      notes: 'Comparable records lack usable area/price data. Estimate is not reliable.',
    };
  }

  const sorted = [...pricesPerSqft].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const mean = pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length;
  const stdDev = Math.sqrt(
    pricesPerSqft.reduce((sum, p) => sum + (p - mean) ** 2, 0) / pricesPerSqft.length
  );

  let adjustedPricePerSqft = median;

  const adjustments: { factor: string; adj: number }[] = [];

  if (property.property_condition) {
    const condAdj: Record<string, number> = { excellent: 0.08, good: 0.03, average: 0, poor: -0.1 };
    const adj = condAdj[property.property_condition] || 0;
    if (adj !== 0) adjustments.push({ factor: 'Property Condition', adj });
    adjustedPricePerSqft *= 1 + adj;
  }

  if (property.property_age !== null && property.property_age !== undefined) {
    const ageAdj = Math.max(-0.15, property.property_age * -0.005);
    adjustments.push({ factor: 'Property Age', adj: ageAdj });
    adjustedPricePerSqft *= 1 + ageAdj;
  }

  if (property.furnishing) {
    const furnAdj: Record<string, number> = { furnished: 0.05, semi_furnished: 0.02, unfurnished: 0 };
    const adj = furnAdj[property.furnishing] || 0;
    if (adj !== 0) adjustments.push({ factor: 'Furnishing', adj });
    adjustedPricePerSqft *= 1 + adj;
  }

  if (property.construction_quality) {
    const qualAdj: Record<string, number> = { premium: 0.07, standard: 0, basic: -0.05 };
    const adj = qualAdj[property.construction_quality] || 0;
    if (adj !== 0) adjustments.push({ factor: 'Construction Quality', adj });
    adjustedPricePerSqft *= 1 + adj;
  }

  if (property.floor_number !== null && property.floor_number !== undefined && property.property_type !== 'independent_house') {
    if (property.floor_number > 0) {
      const floorAdj = Math.min(0.04, property.floor_number * 0.005);
      adjustments.push({ factor: 'Floor Level', adj: floorAdj });
      adjustedPricePerSqft *= 1 + floorAdj;
    }
  }

  const estimatedValue = Math.round((adjustedPricePerSqft * areaForCalc) / 10000) * 10000;

  const variance = stdDev / median;
  const rangePct = Math.max(0.05, Math.min(0.2, variance * 0.5));
  const lowerBound = Math.round((estimatedValue * (1 - rangePct)) / 10000) * 10000;
  const upperBound = Math.round((estimatedValue * (1 + rangePct)) / 10000) * 10000;

  const verifiedRatio = verified.length / comparables.length;
  let dataQuality: DataQuality = 'low';
  if (comparables.length >= 6 && verifiedRatio >= 0.5) dataQuality = 'high';
  else if (comparables.length >= 4) dataQuality = 'medium';

  const confidence = Math.min(
    0.85,
    0.3 + comparables.length * 0.05 + verifiedRatio * 0.2
  );

  const featureContributions: FeatureContribution[] = [
    {
      feature: 'locality',
      label: 'Locality',
      impact: 0.35,
      direction: 'positive',
      description: `${property.locality || property.city} comparable prices are the primary basis for this estimate, contributing the largest share of the valuation.`,
    },
    {
      feature: 'area',
      label: 'Property Size',
      impact: 0.25,
      direction: 'positive',
      description: `Total area of ${areaForCalc} sq ft directly scales the estimated value from the per-square-foot base rate.`,
    },
    {
      feature: 'property_type',
      label: 'Property Type',
      impact: 0.15,
      direction: 'positive',
      description: `${PROPERTY_TYPE_LABELS[property.property_type]} properties in this area have a characteristic price range that anchors the estimate.`,
    },
  ];

  if (property.bedrooms) {
    featureContributions.push({
      feature: 'bedrooms',
      label: 'Number of Bedrooms',
      impact: 0.1,
      direction: 'positive',
      description: `${property.bedrooms} BHK configuration matches comparable records and supports the estimated value.`,
    });
  }

  for (const adj of adjustments) {
    featureContributions.push({
      feature: adj.factor.toLowerCase().replace(/\s+/g, '_'),
      label: adj.factor,
      impact: Math.abs(adj.adj),
      direction: adj.adj > 0 ? 'positive' : 'negative',
      description: `${adj.factor} adjustment of ${adj.adj > 0 ? '+' : ''}${(adj.adj * 100).toFixed(1)}% applied based on property attributes.`,
    });
  }

  featureContributions.push({
    feature: 'comparable_transactions',
    label: 'Comparable Transaction Prices',
    impact: 0.2,
    direction: 'positive',
    description: `${comparables.length} comparable records (median ₹${Math.round(median)}/sq ft) used as the pricing base.`,
  });

  return {
    estimatedValue,
    lowerBound,
    upperBound,
    pricePerSqft: Math.round(adjustedPricePerSqft),
    comparablesCount: comparables.length,
    comparables,
    dataQuality,
    confidence,
    modelVersion: 'demo-v1',
    valuationType: 'demo',
    featureContributions,
    notes:
      'DEMO ESTIMATE — Not a verified market valuation. This estimate is derived from comparable property records using a documented comparable-based estimation method. It is not a machine learning prediction and should not be used for lending decisions without professional verification.',
  };
}
