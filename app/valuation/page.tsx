'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  RefreshCw,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import {
  calculateDemoValuation,
  findComparables,
} from '@/lib/valuation-engine';

import type { Property, ComparableSale } from '@/lib/types';
import type { ValuationResult } from '@/lib/valuation-engine';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ValuationPage() {
  const { user } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      if (!user) {
        setLoadingProperties(false);
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        const records = (data || []) as Property[];
        setProperties(records);

        if (records.length > 0) {
          setSelectedProperty(records[0].id);
        }
      }

      setLoadingProperties(false);
    }

    loadProperties();
  }, [user]);

  async function generateValuation() {
    setError('');
    setResult(null);
    setSaved(false);

    if (!user) {
      setError('Please sign in again to continue.');
      return;
    }

    const property = properties.find(
      (item) => item.id === selectedProperty
    );

    if (!property) {
      setError('Please select a registered property.');
      return;
    }

    if (!property.carpet_area && !property.built_up_area) {
      setError('The selected property does not have a valid area measurement.');
      return;
    }

    setCalculating(true);

    try {
      const { data: comparableData, error: comparableError } =
        await supabase
          .from('comparable_sales')
          .select('*')
          .eq('city', property.city);

      if (comparableError) throw comparableError;

      const comparables = (comparableData || []) as ComparableSale[];

      const valuation = calculateDemoValuation(
        property,
        comparables
      );

      if (valuation.estimatedValue <= 0) {
        setResult(valuation);
        setError(
          'No reliable estimate could be generated. Add suitable comparable property records before trying again.'
        );
        return;
      }

      const { error: saveError } = await supabase
        .from('valuations')
        .insert({
          property_id: property.id,
          user_id: user.id,
          estimated_value: valuation.estimatedValue,
          lower_bound: valuation.lowerBound,
          upper_bound: valuation.upperBound,
          price_per_sqft: valuation.pricePerSqft,
          valuation_type: 'demo',
          model_version: valuation.modelVersion,
          confidence: valuation.confidence,
          data_quality: valuation.dataQuality,
          comparables_count: valuation.comparablesCount,
          status: 'completed',
          feature_contributions: valuation.featureContributions,
          comparable_ids: valuation.comparables.map((item) => item.id),
          notes: valuation.notes,
        });

      if (saveError) throw saveError;

      setResult(valuation);
      setSaved(true);
    } catch (err) {
      console.error('Valuation error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate valuation.'
      );
    } finally {
      setCalculating(false);
    }
  }

  const selected = properties.find(
    (item) => item.id === selectedProperty
  );

  return (
    <AppShell breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'AI Valuation' },
    ]}>
      <div className="mx-auto max-w-5xl space-y-6">

        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-3">
              <Calculator className="h-6 w-6 text-accent" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                AI Property Valuation
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate a preliminary estimate using available comparable records.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Select Property</CardTitle>
            <CardDescription>
              Choose a property that has already been registered in MANAK.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">

            {loadingProperties ? (
              <p className="text-sm text-muted-foreground">
                Loading registered properties...
              </p>
            ) : properties.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />

                <p className="mt-3 font-semibold">
                  No registered properties found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Register a property before generating a valuation.
                </p>

                <Button className="mt-4" asChild>
                  <Link href="/properties/new">
                    Register Property
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="property"
                    className="text-sm font-medium"
                  >
                    Registered Property
                  </label>

                  <select
                    id="property"
                    value={selectedProperty}
                    onChange={(event) => {
                      setSelectedProperty(event.target.value);
                      setResult(null);
                      setError('');
                      setSaved(false);
                    }}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.address} — {property.locality || property.city}
                      </option>
                    ))}
                  </select>
                </div>

                {selected && (
                  <div className="grid gap-4 rounded-lg bg-secondary/50 p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Location
                      </p>
                      <p className="mt-1 font-medium">
                        {selected.locality || selected.city}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Property Type
                      </p>
                      <p className="mt-1 font-medium">
                        {selected.property_type.replaceAll('_', ' ')}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Area
                      </p>
                      <p className="mt-1 font-medium">
                        {selected.carpet_area || selected.built_up_area} sq ft
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={generateValuation}
                  disabled={calculating || !selectedProperty}
                  className="w-full sm:w-auto"
                >
                  {calculating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Calculating Estimate...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Generate Valuation
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {result && result.estimatedValue > 0 && (
          <>
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle>Valuation Result</CardTitle>
                    <CardDescription>
                      Preliminary comparable-based estimate
                    </CardDescription>
                  </div>

                  {saved && (
                    <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Saved to Supabase
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">

                <div className="rounded-xl bg-primary p-6 text-primary-foreground">
                  <p className="text-sm text-primary-foreground/70">
                    Estimated Property Value
                  </p>

                  <p className="mt-2 text-3xl font-bold sm:text-4xl">
                    {formatCurrency(result.estimatedValue)}
                  </p>

                  <p className="mt-3 text-sm text-primary-foreground/75">
                    Indicative range: {formatCurrency(result.lowerBound)}
                    {' – '}
                    {formatCurrency(result.upperBound)}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Estimated Rate
                    </p>
                    <p className="mt-2 text-xl font-bold">
                      {formatCurrency(result.pricePerSqft)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      per sq ft
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Comparable Records
                    </p>
                    <p className="mt-2 text-xl font-bold">
                      {result.comparablesCount}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Data Quality
                    </p>
                    <p className="mt-2 text-xl font-bold capitalize">
                      {result.dataQuality}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Factors Considered
                  </h3>

                  <div className="mt-3 space-y-3">
                    {result.featureContributions.map((feature, index) => (
                      <div
                        key={`${feature.feature}-${index}`}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">
                            {feature.label}
                          </p>

                          <span className="text-xs text-muted-foreground">
                            {feature.direction === 'positive'
                              ? 'Positive adjustment'
                              : 'Negative adjustment'}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-semibold">
                        Demo valuation disclaimer
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {result.notes}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Model version: {result.modelVersion} ·
                  Valuation type: {result.valuationType.toUpperCase()}
                </p>

                <Button variant="outline" asChild>
                  <Link href="/history">
                    View Valuation History
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

              </CardContent>
            </Card>
          </>
        )}

        <div className="rounded-lg border bg-secondary/30 p-4">
          <div className="flex items-start gap-2">
            <IndianRupee className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              MANAK currently uses a comparable-based demo estimation method.
              It is not a trained machine-learning model, a formal valuation
              certificate, or a lending decision.
            </p>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
