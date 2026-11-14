'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  RefreshCw,
  AlertCircle,
  Building2,
  Navigation,
  Search,
  ExternalLink,
} from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { Property, ComparableSale } from '@/lib/types';

type MapRecord = {
  id: string;
  label: string;
  locality: string;
  city: string;
  latitude: number;
  longitude: number;
  category: 'Registered Property' | 'Comparable Record';
  details: string;
};

export default function GeospatialPage() {
  const { user } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [comparables, setComparables] = useState<ComparableSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showProperties, setShowProperties] = useState(true);
  const [showComparables, setShowComparables] = useState(true);

  async function loadData() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const [propertyResult, comparableResult] = await Promise.all([
      supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id),

      supabase
        .from('comparable_sales')
        .select('*'),
    ]);

    if (propertyResult.error) {
      setError(propertyResult.error.message);
    } else {
      setProperties((propertyResult.data || []) as Property[]);
    }

    if (comparableResult.error) {
      setError((previous) =>
        previous
          ? `${previous} | ${comparableResult.error.message}`
          : comparableResult.error.message
      );
    } else {
      setComparables((comparableResult.data || []) as ComparableSale[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [user]);

  const mapRecords = useMemo<MapRecord[]>(() => {
    const propertyRecords: MapRecord[] = showProperties
      ? properties
          .filter(
            (item) =>
              item.latitude != null &&
              item.longitude != null &&
              Number.isFinite(Number(item.latitude)) &&
              Number.isFinite(Number(item.longitude))
          )
          .map((item) => ({
            id: item.id,
            label: item.address,
            locality: item.locality || '',
            city: item.city,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            category: 'Registered Property',
            details: `${item.property_type.replaceAll('_', ' ')} · ${item.bedrooms ?? '—'} bedrooms · ${item.built_up_area ?? '—'} sq.ft.`,
          }))
      : [];

    const comparableRecords: MapRecord[] = showComparables
      ? comparables
          .filter(
            (item) =>
              item.latitude != null &&
              item.longitude != null &&
              Number.isFinite(Number(item.latitude)) &&
              Number.isFinite(Number(item.longitude))
          )
          .map((item) => ({
            id: item.id,
            label: item.locality,
            locality: item.locality,
            city: item.city,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            category: 'Comparable Record',
            details: `${item.property_type.replaceAll('_', ' ')} · ${item.bedrooms ?? '—'} bedrooms · ₹${Number(item.price_per_sqft || 0).toLocaleString('en-IN')} / sq.ft.`,
          }))
      : [];

    const query = search.trim().toLowerCase();

    return [...propertyRecords, ...comparableRecords].filter((item) => {
      if (!query) return true;

      return (
        item.label.toLowerCase().includes(query) ||
        item.locality.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query)
      );
    });
  }, [
    properties,
    comparables,
    showProperties,
    showComparables,
    search,
  ]);

  const mappedProperties = mapRecords.filter(
    (item) => item.category === 'Registered Property'
  ).length;

  const mappedComparables = mapRecords.filter(
    (item) => item.category === 'Comparable Record'
  ).length;

  const mapUrl =
    mapRecords.length > 0
      ? `https://www.google.com/maps/dir/${mapRecords
          .slice(0, 20)
          .map((item) => `${item.latitude},${item.longitude}`)
          .join('/')}`
      : 'https://www.google.com/maps/search/?api=1&query=Jaipur%2C%20Rajasthan';

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Geospatial Intelligence' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-3">
            <MapPin className="h-6 w-6 text-accent" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Geospatial Intelligence
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore the geographic distribution of properties and comparable records.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Registered Properties
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : properties.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Comparable Records
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : comparables.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Records With Coordinates
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : mapRecords.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Map Filters</CardTitle>
            <CardDescription>
              Choose which records to display and search by location.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search city or locality..."
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showProperties}
                  onChange={(event) => setShowProperties(event.target.checked)}
                />
                Registered properties
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showComparables}
                  onChange={(event) => setShowComparables(event.target.checked)}
                />
                Comparable records
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  Only records with valid latitude and longitude are included.
                </CardDescription>
              </div>

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                <Navigation className="h-4 w-4" />
                Open in Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading location records...
              </div>
            ) : mapRecords.length === 0 ? (
              <div className="py-12 text-center">
                <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">
                  No mappable records found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Records need valid latitude and longitude coordinates to appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm font-medium">
                    {mapRecords.length} records available
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mappedProperties} registered properties · {mappedComparables} comparable records
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Open Google Maps to view the listed coordinates. This page does not infer or generate missing coordinates.
                  </p>
                </div>

                <div className="divide-y rounded-lg border">
                  {mapRecords.map((item) => (
                    <div
                      key={`${item.category}-${item.id}`}
                      className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3">
                        {item.category === 'Registered Property' ? (
                          <Building2 className="mt-1 h-5 w-5 text-accent" />
                        ) : (
                          <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                        )}

                        <div>
                          <p className="font-medium">{item.label || item.locality}</p>
                          <p className="text-sm text-muted-foreground">
                            {[item.locality, item.city].filter(Boolean).join(', ')}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.details}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground sm:text-right">
                        <p>{item.category}</p>
                        <p className="mt-1">
                          {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                        </p>
                        <a
                          className="mt-1 inline-block text-accent underline"
                          href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View location
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
        </div>
      </div>
    </AppShell>
  );
}
