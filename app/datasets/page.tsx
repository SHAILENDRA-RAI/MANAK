'use client';

import { useEffect, useState } from 'react';
import {
  Database,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  ShieldAlert,
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
import type { Dataset, SourceType } from '@/lib/types';

const REQUIRED_COLUMNS = [
  'locality',
  'city',
  'state',
  'property_type',
  'sale_price',
];

const OPTIONAL_COLUMNS = [
  'built_up_area',
  'carpet_area',
  'bedrooms',
  'bathrooms',
  'price_per_sqft',
  'transaction_date',
  'latitude',
  'longitude',
  'data_source',
];

type ParsedRow = Record<string, string>;

type ValidationResult = {
  row: ParsedRow;
  valid: boolean;
  errors: string[];
};

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i++;

      row.push(cell.trim());

      if (row.some((value) => value !== '')) {
        rows.push(row);
      }

      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());

  if (row.some((value) => value !== '')) {
    rows.push(row);
  }

  return rows;
}

function validateRows(
  headers: string[],
  rows: string[][]
): ValidationResult[] {
  return rows.map((values) => {
    const row: ParsedRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const errors: string[] = [];

    REQUIRED_COLUMNS.forEach((column) => {
      if (!row[column]?.trim()) {
        errors.push(`Missing ${column}`);
      }
    });

    if (
      row.sale_price &&
      (!Number.isFinite(Number(row.sale_price)) ||
        Number(row.sale_price) <= 0)
    ) {
      errors.push('Invalid sale_price');
    }

    if (
      row.property_type &&
      !['apartment', 'flat', 'independent_house', 'villa'].includes(
        row.property_type.toLowerCase()
      )
    ) {
      errors.push('Invalid property_type');
    }

    ['built_up_area', 'carpet_area', 'bedrooms', 'bathrooms'].forEach(
      (column) => {
        if (
          row[column] &&
          (!Number.isFinite(Number(row[column])) ||
            Number(row[column]) < 0)
        ) {
          errors.push(`Invalid ${column}`);
        }
      }
    );

    return {
      row,
      valid: errors.length === 0,
      errors,
    };
  });
}

export default function DatasetManagementPage() {
  const { user, profile } = useAuth();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>('listing');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isAdmin = profile?.role === 'admin';

  async function loadDatasets() {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: queryError } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setDatasets([]);
    } else {
      setDatasets((data || []) as Dataset[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (profile) loadDatasets();
  }, [user, profile]);

  async function uploadDataset() {
    setError('');
    setMessage('');

    if (!user) {
      setError('Please sign in again.');
      return;
    }

    if (!isAdmin) {
      setError('Administrator access is required.');
      return;
    }

    if (!file) {
      setError('Select a CSV file first.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be below 10 MB.');
      return;
    }

    setUploading(true);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.length < 2) {
        throw new Error('The CSV must contain a header and at least one data row.');
      }

      const headers = parsed[0].map((header) =>
        header.trim().toLowerCase()
      );

      const duplicateHeaders = headers.filter(
        (header, index) => headers.indexOf(header) !== index
      );

      if (duplicateHeaders.length > 0) {
        throw new Error('The CSV contains duplicate column names.');
      }

      const missingColumns = REQUIRED_COLUMNS.filter(
        (column) => !headers.includes(column)
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing required columns: ${missingColumns.join(', ')}`
        );
      }

      const unknownColumns = headers.filter(
        (header) =>
          !REQUIRED_COLUMNS.includes(header) &&
          !OPTIONAL_COLUMNS.includes(header)
      );

      if (unknownColumns.length > 0) {
        throw new Error(
          `Unsupported columns: ${unknownColumns.join(', ')}`
        );
      }

      const validations = validateRows(headers, parsed.slice(1));

      const validRows = validations.filter((item) => item.valid);
      const invalidRows = validations.filter((item) => !item.valid);

      const summary = {
        required_columns: REQUIRED_COLUMNS,
        optional_columns: OPTIONAL_COLUMNS,
        detected_columns: headers,
        valid_rows: validRows.length,
        invalid_rows: invalidRows.length,
        validation_errors: invalidRows.slice(0, 100).map((item, index) => ({
          row_number: index + 2,
          errors: item.errors,
        })),
        note: 'CSV validation only. No comparable_sales records were imported.',
      };

      const { data: dataset, error: insertError } = await supabase
        .from('datasets')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_size: file.size,
          row_count: validations.length,
          valid_rows: validRows.length,
          invalid_rows: invalidRows.length,
          source_type: sourceType,
          status: validRows.length > 0 ? 'validated' : 'failed',
          validation_summary: summary,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      const recordPayload = validations.map((item) => ({
        dataset_id: dataset.id,
        raw_data: item.row,
        is_valid: item.valid,
        validation_errors: item.errors,
      }));

      for (let i = 0; i < recordPayload.length; i += 200) {
        const batch = recordPayload.slice(i, i + 200);

        const { error: recordsError } = await supabase
          .from('dataset_records')
          .insert(batch);

        if (recordsError) {
          await supabase
            .from('datasets')
            .update({ status: 'failed' })
            .eq('id', dataset.id);

          throw recordsError;
        }
      }

      setMessage(
        `Dataset saved. ${validRows.length} valid rows and ${invalidRows.length} invalid rows.`
      );

      setFile(null);

      const input = document.getElementById(
        'dataset-file'
      ) as HTMLInputElement | null;

      if (input) input.value = '';

      await loadDatasets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Dataset upload failed.'
      );
    } finally {
      setUploading(false);
    }
  }

  if (profile && !isAdmin) {
    return (
      <AppShell
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Dataset Management' },
        ]}
      >
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Access Restricted</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dataset Management is available only to administrators.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Dataset Management' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-3">
            <Database className="h-6 w-6 text-accent" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dataset Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload and validate property datasets.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
          Uploading a CSV stores its metadata and parsed rows in Supabase.
          It does not automatically publish records as comparable sales.
          Verify source documents before treating any record as genuine market evidence.
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {message && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {message}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload Dataset</CardTitle>
            <CardDescription>
              CSV files only. Maximum file size: 10 MB.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dataset-file">
                Select CSV file
              </label>

              <input
                id="dataset-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) =>
                  setFile(event.target.files?.[0] || null)
                }
                className="block w-full rounded-md border border-input bg-background p-3 text-sm"
              />

              {file && (
                <p className="text-xs text-muted-foreground">
                  Selected: {file.name} · {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="source-type">
                Dataset source category
              </label>

              <select
                id="source-type"
                value={sourceType}
                onChange={(event) =>
                  setSourceType(event.target.value as SourceType)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="listing">Property listing</option>
                <option value="verified_transaction">
                  Verified transaction
                </option>
                <option value="circle_rate">Circle rate</option>
              </select>
            </div>

            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-sm font-semibold">Required CSV columns</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {REQUIRED_COLUMNS.join(', ')}
              </p>

              <p className="mt-3 text-sm font-semibold">
                Optional CSV columns
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {OPTIONAL_COLUMNS.join(', ')}
              </p>
            </div>

            <button
              onClick={uploadDataset}
              disabled={!file || uploading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Validating and saving...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Validate
                </>
              )}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <CardTitle>Dataset Register</CardTitle>
                <CardDescription>
                  Uploaded dataset metadata and validation status.
                </CardDescription>
              </div>

              <button
                onClick={loadDatasets}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading datasets...
              </div>
            ) : datasets.length === 0 ? (
              <div className="py-10 text-center">
                <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">No datasets uploaded</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Uploaded datasets will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="px-3 py-3">Filename</th>
                      <th className="px-3 py-3">Source</th>
                      <th className="px-3 py-3">Rows</th>
                      <th className="px-3 py-3">Valid</th>
                      <th className="px-3 py-3">Invalid</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Uploaded</th>
                    </tr>
                  </thead>

                  <tbody>
                    {datasets.map((dataset) => (
                      <tr key={dataset.id} className="border-b last:border-0">
                        <td className="px-3 py-4 font-medium">
                          {dataset.filename}
                        </td>
                        <td className="px-3 py-4 capitalize">
                          {dataset.source_type.replaceAll('_', ' ')}
                        </td>
                        <td className="px-3 py-4">{dataset.row_count}</td>
                        <td className="px-3 py-4 text-emerald-600">
                          {dataset.valid_rows}
                        </td>
                        <td className="px-3 py-4 text-destructive">
                          {dataset.invalid_rows}
                        </td>
                        <td className="px-3 py-4 capitalize">
                          {dataset.status}
                        </td>
                        <td className="px-3 py-4">
                          {new Date(dataset.created_at).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
