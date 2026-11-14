'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Search,
  RefreshCw,
  AlertCircle,
  MapPin,
  IndianRupee,
  Database,
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
import type { ComparableSale } from '@/lib/types';

function currency(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return '—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function number(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return '—';

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function date(value: string | null | undefined) {
  if (!value) return 'Date unavailable';

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return 'Date unavailable';

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ComparablesPage() {
  const { user } = useAuth();

  const [records, setRecords] = useState<ComparableSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  async function loadRecords() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: queryError } = await supabase
      .from('comparable_sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setRecords([]);
    } else {
      setRecords((data || []) as ComparableSale[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRecords();
  }, [user]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        (record.locality || '').toLowerCase().includes(query) ||
        (record.city || '').toLowerCase().includes(query) ||
        (record.data_source || '').toLowerCase().includes(query);

      const matchesType =
        typeFilter === 'all' || record.property_type === typeFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        record.verification_status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [records, search, typeFilter, statusFilter]);

  const verifiedCount = records.filter(
    (record) => record.verification_status === 'verified'
  ).length;

  const averageRate = records.length
    ? records.reduce(
        (sum, record) => sum + Number(record.price_per_sqft || 0),
        0
      ) / records.length
    : 0;

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Comparable Properties' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-3">
            <BarChart3 className="h-6 w-6 text-accent" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Comparable Properties
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore available property transaction and listing records.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-sm">Dataset notice</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This dataset may contain synthetic demonstration records.
                Records shown here must not be treated as verified market
                transactions unless their source and verification status
                have been independently confirmed.
              </p>
            </div>
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
                Total Records
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : records.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Marked Verified
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : verifiedCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Average Listed Rate
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : `${currency(averageRate)} / sq.ft.`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Comparable Records</CardTitle>
            <CardDescription>
              Filter records by locality, property type, or verification status.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search locality or city..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by property type"
              >
                <option value="all">All property types</option>
                <option value="apartment">Apartment</option>
                <option value="flat">Flat</option>
                <option value="independent_house">Independent house</option>
                <option value="villa">Villa</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by verification status"
              >
                <option value="all">All verification statuses</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available Records</h2>

          <button
            onClick={loadRecords}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading comparable records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No matching records</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try changing your search or filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold capitalize">
                        {(record.property_type || 'Property').replaceAll('_', ' ')}
                      </h3>

                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {[record.locality, record.city, record.state]
                          .filter(Boolean)
                          .join(', ') || 'Location unavailable'}
                      </p>
                    </div>

                    <span className="rounded-full border px-2.5 py-1 text-xs capitalize">
                      {(record.verification_status || 'unknown').replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Sale / Listing Price
                      </p>
                      <p className="mt-1 font-semibold">
                        {currency(record.sale_price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Price per sq.ft.
                      </p>
                      <p className="mt-1 font-semibold">
                        {currency(record.price_per_sqft)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Built-up Area
                      </p>
                      <p className="mt-1 font-medium">
                        {number(record.built_up_area)} sq.ft.
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Bedrooms
                      </p>
                      <p className="mt-1 font-medium">
                        {record.bedrooms ?? '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      Source: {record.data_source || record.source_type || 'Not specified'}
                    </span>
                    <span>
                      Date: {date(record.transaction_date)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
