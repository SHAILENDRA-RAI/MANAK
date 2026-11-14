'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ManakLogo } from '@/components/manak-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      toast.error(error);
      setLoading(false);
    } else {
      toast.success('Welcome back to MANAK');
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
            Intelligent Property Valuation.
            <br />
            Transparent Lending Decisions.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            AI-powered fair market value estimation using machine learning, historical
            transactions, and geographical intelligence.
          </p>
        </div>
        <div className="relative flex gap-8 text-sm">
          <div>
            <p className="text-2xl font-bold">AI</p>
            <p className="text-white/60">Valuation Engine</p>
          </div>
          <div>
            <p className="text-2xl font-bold">SHAP</p>
            <p className="text-white/60">Explainability</p>
          </div>
          <div>
            <p className="text-2xl font-bold">GIS</p>
            <p className="text-white/60">Spatial Analysis</p>
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
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access the MANAK dashboard
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
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-accent hover:underline">
                  Create one
                </Link>
              </div>
              <div className="mt-4 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
