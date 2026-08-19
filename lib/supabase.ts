import { createClient } from '@supabase/supabase-js'

// The public client. It holds the anon key, which ships in the browser and is
// meant to be visible — every guard lives in the database, not here.
//
// This key can do exactly one thing: call submit_prayer(). It has no privileges
// on any table, so it cannot read a prayer request back, cannot mark anything
// prayed over, and cannot reach the contact details. See
// supabase/migrations/0001_initial_schema.sql.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Supabase is not configured. Copy .env.example to .env.local and fill it in.',
  )
}

export const supabase = createClient(url, anonKey)
