'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Search,
  Save,
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
import type { Profile, UserRole } from '@/lib/types';

export default function UserManagementPage() {
  const { user, profile } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [roleChanges, setRoleChanges] = useState<Record<string, UserRole>>({});

  const isAdmin = profile?.role === 'admin';

  async function loadUsers() {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setUsers([]);
    } else {
      setUsers((data || []) as Profile[]);
      setRoleChanges({});
    }

    setLoading(false);
  }

  useEffect(() => {
    if (profile) loadUsers();
  }, [user, profile]);

  async function updateRole(target: Profile) {
    const newRole = roleChanges[target.id];

    if (!newRole || newRole === target.role) return;

    if (target.id === user?.id) {
      setError('You cannot change your own role from this screen.');
      return;
    }

    const adminCount = users.filter((item) => item.role === 'admin').length;

    if (target.role === 'admin' && newRole !== 'admin' && adminCount <= 1) {
      setError('The last administrator cannot be demoted.');
      return;
    }

    const confirmed = window.confirm(
      `Change ${target.full_name || target.email} from ${target.role} to ${newRole}?`
    );

    if (!confirmed) return;

    setSavingId(target.id);
    setError('');
    setMessage('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', target.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(`Role updated for ${target.full_name || target.email}.`);
      await loadUsers();
    }

    setSavingId('');
  }

  const filteredUsers = users.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      (item.full_name || '').toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      (item.organization || '').toLowerCase().includes(query) ||
      item.role.toLowerCase().includes(query)
    );
  });

  if (profile && !isAdmin) {
    return (
      <AppShell
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'User Management' },
        ]}
      >
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Access Restricted</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Only administrators can access user management.
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
        { label: 'User Management' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-3">
              <Users className="h-6 w-6 text-accent" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-sm text-muted-foreground">
                View registered users and manage their application roles.
              </p>
            </div>
          </div>

          <button
            onClick={loadUsers}
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

        {message && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : users.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Administrators</p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? '...' : users.filter((item) => item.role === 'admin').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Valuers and Analysts</p>
              <p className="mt-2 text-2xl font-bold">
                {loading
                  ? '...'
                  : users.filter((item) => item.role !== 'admin').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Accounts</CardTitle>
            <CardDescription>
              Role changes are subject to Supabase row-level security policies.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, organization, or role..."
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No matching users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="px-3 py-3">User</th>
                      <th className="px-3 py-3">Organization</th>
                      <th className="px-3 py-3">Current Role</th>
                      <th className="px-3 py-3">Change Role</th>
                      <th className="px-3 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-3 py-4">
                          <p className="font-medium">
                            {item.full_name || 'Unnamed user'}
                            {item.id === user?.id && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.email}
                          </p>
                        </td>

                        <td className="px-3 py-4">
                          {item.organization || '—'}
                        </td>

                        <td className="px-3 py-4 capitalize">
                          {item.role}
                        </td>

                        <td className="px-3 py-4">
                          <select
                            value={roleChanges[item.id] || item.role}
                            onChange={(event) =>
                              setRoleChanges((previous) => ({
                                ...previous,
                                [item.id]: event.target.value as UserRole,
                              }))
                            }
                            disabled={item.id === user?.id || savingId === item.id}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                            aria-label={`Change role for ${item.email}`}
                          >
                            <option value="valuer">Valuer</option>
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td className="px-3 py-4">
                          <button
                            onClick={() => updateRole(item)}
                            disabled={
                              item.id === user?.id ||
                              savingId === item.id ||
                              !roleChanges[item.id] ||
                              roleChanges[item.id] === item.role
                            }
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {savingId === item.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
          <strong>Security note:</strong> This interface does not create
          authentication accounts or change passwords. Role updates must also
          be protected by database policies. Never expose a Supabase
          service-role key in frontend code.
        </div>
      </div>
    </AppShell>
  );
}
