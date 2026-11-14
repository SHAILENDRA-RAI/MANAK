'use client';

import { supabase } from './supabase';

export async function logAudit(
  userId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      details: details || null,
    });
  } catch (err) {
    console.error('Failed to log audit entry:', err);
  }
}
