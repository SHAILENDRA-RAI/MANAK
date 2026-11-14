'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Valuation, Property, AuditLog, ComparableSale } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export interface DashboardStats {
  totalProperties: number;
  totalValuations: number;
  avgValuation: number;
  pendingReview: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentValuations: (Valuation & { property?: Property })[];
  recentActivity: AuditLog[];
  monthlyTrend: { month: string; valuations: number; avgValue: number }[];
  cityDistribution: { city: string; count: number }[];
  typeDistribution: { type: string; count: number }[];
  valueRangeDistribution: { range: string; count: number }[];
  comparablesCount: number;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData>({
    stats: { totalProperties: 0, totalValuations: 0, avgValuation: 0, pendingReview: 0 },
    recentValuations: [],
    recentActivity: [],
    monthlyTrend: [],
    cityDistribution: [],
    typeDistribution: [],
    valueRangeDistribution: [],
    comparablesCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;

    async function load() {
      try {
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('*');
        if (propError) throw propError;

        const { data: valuations, error: valError } = await supabase
          .from('valuations')
          .select('*, property:properties(*)')
          .order('created_at', { ascending: false });
        if (valError) throw valError;

        const { data: comparables } = await supabase
          .from('comparable_sales')
          .select('id');

        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (cancelled) return;

        const props = (properties || []) as Property[];
        const vals = (valuations || []) as (Valuation & { property?: Property })[];
        const comps = (comparables || []) as ComparableSale[];
        const activity = (logs || []) as AuditLog[];

        const totalValuations = vals.length;
        const avgValuation =
          totalValuations > 0
            ? vals.reduce((sum, v) => sum + (v.estimated_value || 0), 0) / totalValuations
            : 0;
        const pendingReview = vals.filter((v) => v.status === 'pending_review').length;

        // Monthly trend (last 6 months)
        const now = new Date();
        const months: { month: string; valuations: number; avgValue: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = d.toLocaleString('en-IN', { month: 'short' });
          const monthVals = vals.filter((v) => {
            const vd = new Date(v.created_at);
            return vd.getFullYear() === d.getFullYear() && vd.getMonth() === d.getMonth();
          });
          months.push({
            month: monthLabel,
            valuations: monthVals.length,
            avgValue:
              monthVals.length > 0
                ? monthVals.reduce((s, v) => s + v.estimated_value, 0) / monthVals.length
                : 0,
          });
        }

        // City distribution
        const cityMap = new Map<string, number>();
        props.forEach((p) => {
          cityMap.set(p.city, (cityMap.get(p.city) || 0) + 1);
        });
        const cityDistribution = Array.from(cityMap.entries())
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count);

        // Type distribution
        const typeMap = new Map<string, number>();
        props.forEach((p) => {
          typeMap.set(p.property_type, (typeMap.get(p.property_type) || 0) + 1);
        });
        const typeDistribution = Array.from(typeMap.entries()).map(([type, count]) => ({
          type,
          count,
        }));

        // Value range distribution
        const ranges = [
          { range: 'Below ₹40L', min: 0, max: 4000000 },
          { range: '₹40L – ₹70L', min: 4000000, max: 7000000 },
          { range: '₹70L – ₹1Cr', min: 7000000, max: 10000000 },
          { range: '₹1Cr – ₹1.5Cr', min: 10000000, max: 15000000 },
          { range: 'Above ₹1.5Cr', min: 15000000, max: Infinity },
        ];
        const valueRangeDistribution = ranges.map((r) => ({
          range: r.range,
          count: vals.filter((v) => v.estimated_value >= r.min && v.estimated_value < r.max)
            .length,
        }));

        setData({
          stats: {
            totalProperties: props.length,
            totalValuations,
            avgValuation,
            pendingReview,
          },
          recentValuations: vals.slice(0, 5),
          recentActivity: activity,
          monthlyTrend: months,
          cityDistribution,
          typeDistribution,
          valueRangeDistribution,
          comparablesCount: comps.length,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setData((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load dashboard data',
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  return data;
}
