export function formatINR(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatINRShort(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value.toFixed(0)}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

export function formatArea(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${formatNumber(value)} sq ft`;
}
