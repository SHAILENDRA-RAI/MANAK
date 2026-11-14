'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  Calculator,
  IndianRupee,
  Building2,
  Printer,
} from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { Valuation, Property } from '@/lib/types';

type ReportRecord = Valuation & {
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

function formatDate(value: string | null | undefined) {
  if (!value) return '—';

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return '—';

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function escapeCSV(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export default function ReportsPage() {
  const { user } = useAuth();

  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  async function loadReports() {
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
      setRecords((data || []) as ReportRecord[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadReports();
  }, [user]);

  const filteredRecords = useMemo(() => {
    if (typeFilter === 'all') return records;

    return records.filter(
      (record) => record.valuation_type === typeFilter
    );
  }, [records, typeFilter]);

  const totalEstimatedValue = filteredRecords.reduce(
    (sum, record) => sum + Number(record.estimated_value || 0),
    0
  );

  const averageValue = filteredRecords.length
    ? totalEstimatedValue / filteredRecords.length
    : 0;

  const averageConfidence = filteredRecords.length
    ? filteredRecords.reduce(
        (sum, record) => sum + Number(record.confidence || 0),
        0
      ) / filteredRecords.length
    : 0;

  function downloadCSV() {
    const headers = [
      'Valuation ID',
      'Property Address',
      'Locality',
      'City',
      'Property Type',
      'Area (sq ft)',
      'Estimated Value (INR)',
      'Lower Bound (INR)',
      'Upper Bound (INR)',
      'Price per Sq Ft (INR)',
      'Valuation Type',
      'Model Version',
      'Data Quality',
      'Confidence',
      'Comparable Count',
      'Status',
      'Created At',
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      record.property?.address,
      record.property?.locality,
      record.property?.city,
      record.property?.property_type,
      record.property?.carpet_area || record.property?.built_up_area,
      record.estimated_value,
      record.lower_bound,
      record.upper_bound,
      record.price_per_sqft,
      record.valuation_type,
      record.model_version,
      record.data_quality,
      record.confidence,
      record.comparables_count,
      record.status,
      record.created_at,
    ]);

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `MANAK_Valuation_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Reports' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-3">
              <FileText className="h-6 w-6 text-accent" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Valuation Reports
              </h1>
              <p className="text-sm text-muted-foreground">
                Review and export your property valuation records.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              disabled={loading || filteredRecords.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>

            <Button
              onClick={downloadCSV}
              disabled={loading || filteredRecords.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Select which valuation records to include in the report.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:max-w-xs"
              aria-label="Filter report by valuation type"
            >
              <option value="all">All valuation types</option>
              <option value="demo">Demo estimates</option>
              <option value="ml">ML valuations</option>
            </select>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Valuation Records
                </p>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : filteredRecords.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total Estimated Value
                </p>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-xl font-bold">
                {loading ? '...' : currency(totalEstimatedValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Average Estimate
                </p>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-xl font-bold">
                {loading ? '...' : currency(averageValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Average Recorded Confidence
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : `${(averageConfidence * 100).toFixed(1)}%`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <CardTitle>Valuation Register</CardTitle>
                <CardDescription>
                  Valuation records associated with your account.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={loadReports}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading report records...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">
                  No report records available
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate a valuation to create your first report record.
                </p>
                <Button className="mt-5" asChild>
                  <Link href="/valuation">Generate Valuation</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="px-3 py-3 font-medium">Property</th>
                      <th className="px-3 py-3 font-medium">Estimated Value</th>
                      <th className="px-3 py-3 font-medium">Price / Sq.ft.</th>
                      <th className="px-3 py-3 font-medium">Data Quality</th>
                      <th className="px-3 py-3 font-medium">Comparables</th>
                      <th className="px-3 py-3 font-medium">Type</th>
                      <th className="px-3 py-3 font-medium">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b last:border-0">
                        <td className="px-3 py-4">
                          <p className="font-medium">
                            {record.property?.address || 'Property unavailable'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[record.property?.locality, record.property?.city]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </td>

                        <td className="px-3 py-4 font-semibold">
                          {currency(record.estimated_value)}
                        </td>

                        <td className="px-3 py-4">
                          {currency(record.price_per_sqft)}
                        </td>

                        <td className="px-3 py-4 capitalize">
                          {record.data_quality || '—'}
                        </td>

                        <td className="px-3 py-4">
                          {record.comparables_count}
                        </td>

                        <td className="px-3 py-4 uppercase">
                          {record.valuation_type}
                        </td>

                        <td className="px-3 py-4">
                          {formatDate(record.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-lg border p-4 text-xs text-muted-foreground">
          <strong>Important:</strong> Exported reports contain recorded
          estimates, not formal valuation certificates. MANAK estimates do not
          replace physical inspection or professional valuation and must not
          be treated as loan approval or a lending decision. Demo estimates
          must not be represented as verified market valuations.
        </div>
      </div>
    </AppShell>
  );
}
