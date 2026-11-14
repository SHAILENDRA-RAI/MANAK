import {
  LayoutDashboard,
  Building2,
  Calculator,
  Brain,
  MapPin,
  History,
  FileText,
  Database,
  BarChart3,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Register Property', href: '/properties/new', icon: Building2, roles: ['admin', 'valuer'] },
  { label: 'AI Valuation', href: '/valuation', icon: Calculator },
  { label: 'Explainable AI', href: '/explainable-ai', icon: Brain, roles: ['admin', 'valuer', 'analyst'] },
  { label: 'Comparable Properties', href: '/comparables', icon: BarChart3 },
  { label: 'Geospatial Intelligence', href: '/geospatial', icon: MapPin },
  { label: 'Valuation History', href: '/history', icon: History },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Dataset Management', href: '/datasets', icon: Database, roles: ['admin'] },
  { label: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
  { label: 'System Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
];

export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  if (!role) return [];
  return navItems.filter((item) => !item.roles || item.roles.includes(role));
}
