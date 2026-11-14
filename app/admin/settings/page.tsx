'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Database,
  Brain,
  Activity,
  Server,
  Info,
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
import type { ModelVersion, ModelMetric } from '@/lib/types';

type ModelWithMetrics = ModelVersion & {
  metrics: ModelMetric[];
};

export default function SystemSettingsPage() {
  const { user, profile } = useAuth();

  const [models, setModels] = useState<ModelWithMetrics[]>([]);
  const [datasetCount, setDatasetCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = profile?.role === 'admin';

  async function loadSettings() {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const [modelResult, datasetResult, userResult] = await Promise.all([
      supabase
        .from('model_versions')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('datasets')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
    ]);

    const errors = [
      modelResult.error?.message,
      datasetResult.error?.message,
      userResult.error?.message,
    ].filter(Boolean);

    if (errors.length > 0) {
      setError(errors.join(' | '));
    }

    const modelRecords = (modelResult.data || []) as ModelVersion[];

    if (modelRecords.length > 0) {
      const modelIds = modelRecords.map((item) => item.id);

      const { data: metricData, error: metricError } = await supabase
        .from('model_metrics')
        .select('*')
        .in('model_version_id', modelIds)
        .order('evaluated_at', { ascending: false });

      if (metricError) {
        setError((previous) =>
          previous
            ? `${previous} | ${metricError.message}`
            : metricError.message
        );
      }

      const metrics = (metricData || []) as ModelMetric[];

      setModels(
        modelRecords.map((model) => ({
          ...model,
          metrics: metrics.filter(
            (metric) => metric.model_version_id === model.id
          ),
        }))
      );
    } else {
      setModels([]);
    }

    setDatasetCount(datasetResult.count || 0);
    setUserCount(userResult.count || 0);
    setLoading(false);
  }

  useEffect(() => {
    if (profile) loadSettings();
  }, [user, profile]);

  if (profile && !isAdmin) {
    return (
      <AppShell
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'System Settings' },
        ]}
      >
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">
              Access Restricted
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              System settings are available only to administrators.
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
        { label: 'System Settings' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-3">
              <Settings className="h-6 w-6 text-accent" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                System Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Platform configuration and model registry overview.
              </p>
            </div>
          </div>

          <button
            onClick={loadSettings}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Registered Users
                </p>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : userCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Uploaded Datasets
                </p>
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : datasetCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Registered Models
                </p>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : models.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Active Models
                </p>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">
                {loading
                  ? '...'
                  : models.filter((model) => model.status === 'active').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Platform Configuration
            </CardTitle>
            <CardDescription>
              Current application configuration. Values shown are informational.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="divide-y">
              <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row">
                <span className="text-sm text-muted-foreground">
                  Application
                </span>
                <span className="text-sm font-medium">MANAK — Property Intelligence</span>
              </div>

              <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row">
                <span className="text-sm text-muted-foreground">
                  Deployment
                </span>
                <span className="text-sm font-medium">GitHub Pages</span>
              </div>

              <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row">
                <span className="text-sm text-muted-foreground">
                  Database
                </span>
                <span className="text-sm font-medium">Supabase</span>
              </div>

              <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row">
                <span className="text-sm text-muted-foreground">
                  Initial Operating Region
                </span>
                <span className="text-sm font-medium">Jaipur, Rajasthan</span>
              </div>

              <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row">
                <span className="text-sm text-muted-foreground">
                  Initial Property Segment
                </span>
                <span className="text-sm font-medium">Residential Apartments</span>
              </div>

              <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row">
                <span className="text-sm text-muted-foreground">
                  Current Valuation Method
                </span>
                <span className="text-sm font-medium">
                  Comparable-based demonstration method
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Registry</CardTitle>
            <CardDescription>
              Model versions and evaluation metrics stored in Supabase.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading model registry...
              </div>
            ) : models.length === 0 ? (
              <div className="py-10 text-center">
                <Brain className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">No model versions registered</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Model versions will appear here when records are added to the registry.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {models.map((model) => {
                  const latestMetric = model.metrics[0];

                  return (
                    <div key={model.id} className="rounded-lg border p-4">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="font-semibold">{model.version}</h3>
                          <p className="mt-1 text-sm capitalize text-muted-foreground">
                            {model.model_type.replaceAll('_', ' ')}
                          </p>
                          {model.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {model.description}
                            </p>
                          )}
                        </div>

                        <span className="w-fit rounded-full border px-3 py-1 text-xs capitalize">
                          {model.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">MAE</p>
                          <p className="mt-1 font-semibold">
                            {latestMetric?.mae ?? '—'}
                          </p>
                        </div>

                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">RMSE</p>
                          <p className="mt-1 font-semibold">
                            {latestMetric?.rmse ?? '—'}
                          </p>
                        </div>

                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">R²</p>
                          <p className="mt-1 font-semibold">
                            {latestMetric?.r2 ?? '—'}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">
                        Last trained: {model.trained_at
                          ? new Date(model.trained_at).toLocaleDateString('en-IN')
                          : 'Not recorded'}
                      </p>

                      {!latestMetric && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          No evaluation metrics have been recorded for this model.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold">Configuration and security</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Supabase credentials are supplied through GitHub Actions
                repository variables. Never place a service-role key in
                frontend code. This page does not modify database policies,
                credentials, or deployment settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
