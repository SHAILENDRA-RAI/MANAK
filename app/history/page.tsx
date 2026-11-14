'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History,
  Calculator,
  Building2,
  IndianRupee,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { Valuation, Property } from '@/lib/types';

type HistoryRecord = Valuation & {
  property: Property | null;
};

function currency(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return '—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function ValuationHistoryPage() {
  const { user } = useAuth();

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function loadHistory() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      const { data, error: queryError } = await supabase
        .from('valuations')
        .select('*, property:properties(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setRecords([]);
      } else {
        setRecords((data || []) as HistoryRecord[]);
      }

      setLoading(false);
    }

    loadHistory();
  }, [user]);

  const filteredRecords = records.filter((record) => {
    if (filter === 'all') return true;
    return record.valuation_type === filter;
  });

  const totalValue = records.reduce(
    (sum, record) => sum + Number(record.estimated_value || 0),
    0
  );

  const averageValue = records.length
    ? totalValue / records.length
    : 0;

  return (
    <AppShell breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Valuation History' },
    ]}>
      <div className="space-y-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-3">
              <History className="h-6 w-6 text-accent" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Valuation History
              </h1>
              <p className="text-sm text-muted-foreground">
                Review your previously generated property estimates.
              </p>
            </div>
          </div>

          <Button asChild>
            <Link href="/valuation">
              <Calculator className="mr-2 h-4 w-4" />
              New Valuation
            </Link>
          </Button>
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
                Total Valuations
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : records.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Average Estimated Value
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : currency(averageValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Total Estimated Value
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : currency(totalValue)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <CardTitle>Previous Valuations</CardTitle>
                <CardDescription>
                  Records belonging to your account.
                </CardDescription>
              </div>

              <select
                aria-label="Filter valuation type"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All valuations</option>
                <option value="demo">Demo estimates</option>
                <option value="ml">ML valuations</option>
              </select>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading valuation history...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 font-semibold">
                  No valuation records found
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Generate your first property estimate to see it here.
                </p>

                <Button className="mt-5" asChild>
                  <Link href="/valuation">
                    Generate Valuation
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-xl border p-4 transition-colors hover:bg-secondary/30"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 shrink-0 text-accent" />

                          <h3 className="truncate font-semibold">
                            {record.property?.address || 'Property record'}
                          </h3>
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {record.property?.locality || record.property?.city || 'Location unavailable'}
                          {' · '}
                          {record.property?.property_type?.replaceAll('_', ' ') || 'Property'}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Generated on{' '}
                          {new Date(record.created_at).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Estimated Value
                          </p>
                          <p className="mt-1 text-xl font-bold">
                            {currency(record.estimated_value)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Indicative Range
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {currency(record.lower_bound)}
                            {' – '}
                            {currency(record.upper_bound)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                        {record.valuation_type === 'demo' ? 'Demo Estimate' : 'ML Valuation'}
                      </span>

                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                        {record.data_quality || 'Unknown'} Data Quality
                      </span>

                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                        {record.comparables_count || 0} Comparables
                      </span>

                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <IndianRupee className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold">Important valuation notice</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Historical estimates are indicative records. Demo estimates
                are not trained ML predictions, formal valuation certificates,
                or lending decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              Back to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

      </div>
    </AppShell>
  );
}
