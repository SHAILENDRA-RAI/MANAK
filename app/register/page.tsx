'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock, User as UserIcon, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ManakLogo } from '@/components/manak-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('valuer');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, role, organization);
    if (error) {
      setError(error);
      toast.error(error);
      setLoading(false);
    } else {
      toast.success('Account created successfully');
      router.push('/dashboard');
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary/80 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <ManakLogo size="lg" variant="dark" />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">
            Join MANAK.
            <br />
            Transform your valuation workflow.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Create an account to access AI-powered property valuation, comparable
            analysis, and professional reporting tools.
          </p>
        </div>
        <div className="relative space-y-3 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            Valuer: Generate valuations and reports
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            Analyst: Analyse statistics and model performance
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            Admin: Manage users, datasets, and settings
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <ManakLogo size="md" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Register to start using the MANAK valuation platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className="pl-9"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valuer">Valuer</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="organization"
                        placeholder="HFC Ltd."
                        className="pl-9"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      className="pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-accent hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
