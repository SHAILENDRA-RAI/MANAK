import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Brain,
  MapPin,
  BarChart3,
  FileText,
  ShieldCheck,
  Database,
  Zap,
  TrendingUp,
  CheckCircle2,
  Globe,
  Lock,
} from 'lucide-react';
import { ManakLogo } from '@/components/manak-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <ManakLogo size="md" />
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#technology" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Technology
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-accent" />
              AI-Powered Property Valuation Platform
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Intelligent Property Valuation.
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Transparent Lending Decisions.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              MANAK uses machine learning, historical transaction data, and geographical
              intelligence to estimate fair market value of residential properties —
              helping housing finance companies make faster, more consistent valuation decisions.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Valuing Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In to Dashboard</Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                RLS-secured Database
              </span>
              <span className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                Explainable AI Models
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                Geospatial Intelligence
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-card py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 lg:grid-cols-4 lg:px-8">
          {[
            { label: 'Valuation Engine', value: 'AI + ML', icon: Brain },
            { label: 'Data Coverage', value: 'Jaipur (Demo)', icon: Database },
            { label: 'Model Types', value: 'CatBoost + Baseline', icon: TrendingUp },
            { label: 'Security', value: 'Row-Level', icon: Lock },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-accent" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Comprehensive Valuation Intelligence
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every tool a housing finance team needs for consistent, transparent, and
              data-driven property valuation decisions.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Valuation',
                desc: 'Machine learning models estimate fair market value using property characteristics, historical transactions, and geographical data.',
              },
              {
                icon: BarChart3,
                title: 'Explainable AI',
                desc: 'SHAP-based feature importance shows exactly which property attributes influenced the estimated value — no black boxes.',
              },
              {
                icon: MapPin,
                title: 'Geospatial Intelligence',
                desc: 'Interactive maps with nearby facilities analysis — schools, hospitals, transport, and commercial areas visualized on OpenStreetMap.',
              },
              {
                icon: Building2,
                title: 'Comparable Properties',
                desc: 'Legitimate comparable transaction records with clear labeling of verified prices vs. asking prices vs. government circle rates.',
              },
              {
                icon: FileText,
                title: 'Professional PDF Reports',
                desc: 'Downloadable valuation reports with property details, estimated value, comparables, explanations, and disclaimers.',
              },
              {
                icon: Database,
                title: 'Dataset Management',
                desc: 'Admin tools to upload, validate, and import CSV datasets with automatic detection of missing values and duplicates.',
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/60 transition-all hover:shadow-lg hover:border-accent/30"
              >
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How MANAK Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From property registration to valuation report in four streamlined steps.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Register Property',
                desc: 'Capture location, structural, and additional details through a guided multi-step form with validation.',
                icon: Building2,
              },
              {
                step: '02',
                title: 'AI Valuation',
                desc: 'Submit property data to the valuation engine. Get estimated value, range, and confidence indicators.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Review Explanations',
                desc: 'Understand which features drove the estimate. Compare with similar properties in the area.',
                icon: Brain,
              },
              {
                step: '04',
                title: 'Download Report',
                desc: 'Generate a professional PDF with all valuation details, comparables, and disclaimers.',
                icon: FileText,
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 3 && (
                  <div className="absolute left-full top-12 hidden h-px w-full bg-border md:block" />
                )}
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="mb-1 text-xs font-bold text-accent">{item.step}</p>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built on Modern Technology
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A modular, production-ready architecture with clearly separated responsibilities.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Frontend',
                items: ['React + TypeScript', 'Tailwind CSS + shadcn/ui', 'Recharts + Leaflet Maps'],
                icon: Globe,
              },
              {
                title: 'Backend & Database',
                items: ['Supabase + PostgreSQL', 'Row Level Security', 'Supabase Authentication'],
                icon: ShieldCheck,
              },
              {
                title: 'AI/ML Service',
                items: ['Python + FastAPI', 'Scikit-learn + CatBoost', 'SHAP Explainability'],
                icon: Brain,
              },
            ].map((tech) => (
              <Card key={tech.title} className="border-border/60">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <tech.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{tech.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tech.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-t bg-gradient-to-br from-primary to-primary/80 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Benefits for Housing Finance Companies
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Make faster, more consistent, and transparent property valuation decisions.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Faster Turnaround', desc: 'Generate valuations in minutes, not days. Reduce loan processing time significantly.' },
              { title: 'Consistency', desc: 'Standardized valuation methodology eliminates subjective bias between valuers.' },
              { title: 'Transparency', desc: 'Every estimate comes with explanations, comparables, and confidence indicators.' },
              { title: 'Audit Trail', desc: 'Complete audit logging of all valuations and user actions for regulatory compliance.' },
            ].map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to transform your valuation process?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create an account and start generating intelligent property valuations today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <ManakLogo size="md" />
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                AI-powered property valuation and collateral intelligence platform for
                housing finance companies. Built with transparency, accuracy, and
                regulatory compliance at its core.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Platform</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Create Account</Link></li>
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#technology" className="hover:text-foreground transition-colors">Technology</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Valuation Disclaimer</li>
                <li>Data Privacy</li>
                <li>Terms of Use</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>
              MANAK provides indicative property valuations for assessment purposes only.
              Estimates are not legal ownership verification, title verification, structural
              certification, or a substitute for physical property inspection.
            </p>
            <p className="mt-4">© 2026 MANAK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
