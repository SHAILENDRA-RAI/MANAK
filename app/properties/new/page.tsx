'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!user) {
      setError('Your session has expired. Please sign in again.');
      return;
    }

    const form = new FormData(event.currentTarget);

    const numberOrNull = (key: string) => {
      const value = String(form.get(key) || '').trim();
      if (!value) return null;

      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    };

    const address = String(form.get('address') || '').trim();
    const city = String(form.get('city') || '').trim();
    const state = String(form.get('state') || '').trim();
    const propertyType = String(form.get('property_type') || '');

    const builtUpArea = numberOrNull('built_up_area');
    const carpetArea = numberOrNull('carpet_area');

    if (!address || !city || !state || !propertyType) {
      setError('Please complete all required fields.');
      return;
    }

    if (
      (builtUpArea !== null && builtUpArea <= 0) ||
      (carpetArea !== null && carpetArea <= 0)
    ) {
      setError('Property areas must be greater than zero.');
      return;
    }

    if (builtUpArea === null && carpetArea === null) {
      setError('Enter at least one area measurement.');
      return;
    }

    const property = {
      user_id: user.id,
      address,
      city,
      state,
      locality: String(form.get('locality') || '').trim() || null,
      pincode: String(form.get('pincode') || '').trim() || null,

      property_type: propertyType,

      built_up_area: builtUpArea,
      carpet_area: carpetArea,

      bedrooms: numberOrNull('bedrooms'),
      bathrooms: numberOrNull('bathrooms'),
      floor_number: numberOrNull('floor_number'),
      total_floors: numberOrNull('total_floors'),
      property_age: numberOrNull('property_age'),

      property_condition:
        String(form.get('property_condition') || '') || null,

      furnishing:
        String(form.get('furnishing') || '') || null,

      parking:
        String(form.get('parking') || '') || null,

      construction_quality:
        String(form.get('construction_quality') || '') || null,

      amenities: String(form.get('amenities') || '').trim() || null,
      remarks: String(form.get('remarks') || '').trim() || null,
    };

    setSaving(true);

    try {
      const { data, error: insertError } = await supabase
        .from('properties')
        .insert(property)
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      if (!data?.id) {
        throw new Error('Property was saved, but no record ID was returned.');
      }

      setSuccess(true);

      window.setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch (err) {
      console.error('Property registration error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save property. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Register Property' },
    ]}>
      <div className="mx-auto max-w-4xl space-y-6">

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Register Property
            </h1>
            <p className="text-sm text-muted-foreground">
              Add residential property information for preliminary valuation.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            Property registered successfully. Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property Location
              </CardTitle>
              <CardDescription>
                Enter the property's address and geographical details.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Flat number, building, street"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue="Jaipur"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue="Rajasthan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input
                  id="locality"
                  name="locality"
                  placeholder="e.g. Vaishali Nagar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="302001"
                />
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Specifications</CardTitle>
              <CardDescription>
                Provide the basic residential property characteristics.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <select
                  id="property_type"
                  name="property_type"
                  required
                  defaultValue="apartment"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="apartment">Apartment</option>
                  <option value="flat">Flat</option>
                  <option value="independent_house">Independent House</option>
                  <option value="villa">Villa</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="built_up_area">Built-up Area (sq ft)</Label>
                <Input
                  id="built_up_area"
                  name="built_up_area"
                  type="number"
                  min="1"
                  placeholder="1200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carpet_area">Carpet Area (sq ft)</Label>
                <Input
                  id="carpet_area"
                  name="carpet_area"
                  type="number"
                  min="1"
                  placeholder="950"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms (BHK)</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor_number">Floor Number</Label>
                <Input
                  id="floor_number"
                  name="floor_number"
                  type="number"
                  min="0"
                  placeholder="4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_floors">Total Floors</Label>
                <Input
                  id="total_floors"
                  name="total_floors"
                  type="number"
                  min="1"
                  placeholder="12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_age">Property Age (years)</Label>
                <Input
                  id="property_age"
                  name="property_age"
                  type="number"
                  min="0"
                  max="200"
                  placeholder="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_condition">Property Condition</Label>
                <select
                  id="property_condition"
                  name="property_condition"
                  defaultValue="good"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>
                These details can help contextualise the property record.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">

              <div className="space-y-2">
                <Label htmlFor="furnishing">Furnishing</Label>
                <select
                  id="furnishing"
                  name="furnishing"
                  defaultValue="semi_furnished"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="furnished">Furnished</option>
                  <option value="semi_furnished">Semi-furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking">Parking</Label>
                <select
                  id="parking"
                  name="parking"
                  defaultValue="covered"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="covered">Covered</option>
                  <option value="open">Open</option>
                  <option value="none">No Parking</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="construction_quality">Construction Quality</Label>
                <select
                  id="construction_quality"
                  name="construction_quality"
                  defaultValue="standard"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="premium">Premium</option>
                  <option value="standard">Standard</option>
                  <option value="basic">Basic</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Textarea
                  id="amenities"
                  name="amenities"
                  placeholder="e.g. Lift, security, gym, swimming pool"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="remarks">Additional Remarks</Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  placeholder="Any additional property information..."
                />
              </div>

            </CardContent>
          </Card>

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>

            <Button type="submit" disabled={saving || success}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving Property...' : 'Save Property'}
            </Button>
          </div>

        </form>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Property records are used for preliminary property intelligence.
          Registration does not constitute a formal valuation or verification
          of ownership.
        </p>

      </div>
    </AppShell>
  );
}
