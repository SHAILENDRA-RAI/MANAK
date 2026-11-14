'use client';

import Link from 'next/link';
import {
  Building2,
  Calculator,
  ClipboardList,
  IndianRupee,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

function formatCurrency(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const data = useDashboardData();

  const stats = [
    {
      label: 'Registered Properties',
      value: data.stats.totalProperties.toString(),
      icon: Building2,
    },
    {
      label: 'Total Valuations',
      value: data.stats.totalValuations.toString(),
      icon: Calculator,
    },
    {
      label: 'Average Estimated Value',
      value: formatCurrency(data.stats.avgValuation),
      icon: IndianRupee,
    },
    {
      label: 'Pending Reviews',
      value: data.stats.pendingReview.toString(),
      icon: ClipboardList,
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {profile?.full_name || 'User'}.
              Here is your property intelligence overview.
            </p>
          </div>

          <Button asChild>
            <Link href="/properties/new">
              <Building2 className="mr-2 h-4 w-4" />
              Register Property
            </Link>
          </Button>
        </div>

        {data.error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="font-semibold">
                Unable to load dashboard data
              </p>
              <p className="mt-1 text-muted-foreground">
                {data.error}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <Icon className="h-5 w-5 text-accent" />
                </div>

                <p className="mt-3 text-2xl font-bold">
                  {data.loading ? '...' : stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Recent Valuations
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Latest property valuation records.
                </p>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link href="/history">View history</Link>
              </Button>
            </div>

            {data.loading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Loading valuations...
              </p>
            ) : data.recentValuations.length === 0 ? (
              <div className="py-10 text-center">
                <Building2 className="mx-auto h-9 w-9 text-muted-foreground" />
                <p className="mt-3 font-medium">
                  No valuations yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Register a property to get started.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/properties/new">
                    Register Property
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-5 divide-y">
                {data.recentValuations.map((valuation) => (
                  <div
                    key={valuation.id}
                    className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {valuation.property?.address || 'Property valuation'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {valuation.property?.city || 'Location unavailable'}
                        {' · '}
                        {new Date(valuation.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-semibold">
                        {formatCurrency(valuation.estimated_value)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {valuation.valuation_type === 'demo'
                          ? 'Demo estimate'
                          : 'ML estimate'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Access the main MANAK tools.
            </p>

            <div className="mt-5 space-y-3">
              {[
                {
                  label: 'Register Property',
                  description: 'Add a residential property',
                  href: '/properties/new',
                  icon: Building2,
                },
                {
                  label: 'AI Valuation',
                  description: 'Estimate property value',
                  href: '/valuation',
                  icon: Calculator,
                },
                {
                  label: 'Comparable Properties',
                  description: 'Explore market comparables',
                  href: '/comparables',
                  icon: ClipboardList,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-secondary/60"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-accent" />
                      <div>
                        <p className="text-sm font-medium">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold">
                Valuation estimate disclaimer
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                MANAK provides automated estimates for preliminary property
                and collateral assessment. Estimates are not formal valuation
                certificates, do not replace physical inspection or professional
                valuation, and must not be treated as loan approval or lending decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
