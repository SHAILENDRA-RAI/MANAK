'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getNavItemsForRole } from '@/lib/nav';
import { ROLE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ManakLogo } from '@/components/manak-logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs: { label: string; href?: string }[];
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  const { profile, signOut, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse">
          <ManakLogo size="lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    router.push('/login');
    return null;
  }

  const navItems = getNavItemsForRole(profile.role);

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/login');
  }

  const initials = (profile.full_name || profile.email)
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border/40 px-6">
          <Link href="/dashboard">
            <ManakLogo size="md" />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/40 p-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Model Status
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span className="text-xs font-semibold text-foreground">
                Demo Mode Active
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ML service not connected
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:block">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((bc, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {bc.href ? (
                          <Link href={bc.href} className="hover:text-foreground">
                            {bc.label}
                          </Link>
                        ) : (
                          <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </span>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
              <Link href="/valuation">
                <Search className="h-4.5 w-4.5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold leading-none">
                      {profile.full_name || 'User'}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {ROLE_LABELS[profile.role]}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{profile.full_name}</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {profile.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {profile.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AppShellWrapper({
  children,
  breadcrumbs,
}: AppShellProps) {
  return <AppShell breadcrumbs={breadcrumbs}>{children}</AppShell>;
}
