'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
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

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setOrganization(profile.organization || '');
      setPhone(profile.phone || '');
      setLoading(false);
    }
  }, [profile]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!user) {
      setError('Please sign in again.');
      return;
    }

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (phone.trim() && !/^[+0-9\s()-]{7,20}$/.test(phone.trim())) {
      setError('Enter a valid phone number.');
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        organization: organization.trim() || null,
        phone: phone.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshProfile();
      setMessage('Your profile has been updated successfully.');
    }

    setSaving(false);
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'My Profile' },
      ]}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-3">
            <User className="h-6 w-6 text-accent" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              View and update your account information.
            </p>
          </div>
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
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update the details associated with your MANAK account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading profile...
              </div>
            ) : (
              <form onSubmit={saveProfile} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    maxLength={100}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="h-11 w-full rounded-md border border-input bg-muted px-3 text-sm opacity-70"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed from this page.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="organization" className="text-sm font-medium">
                    Organization
                  </label>
                  <input
                    id="organization"
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                    maxLength={150}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    placeholder="Enter your organization"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    maxLength={20}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="rounded-lg bg-muted/40 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">Account Role</p>
                  </div>
                  <p className="mt-2 text-sm capitalize text-muted-foreground">
                    {profile?.role || 'Not assigned'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Roles are managed by administrators and cannot be changed here.
                  </p>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
