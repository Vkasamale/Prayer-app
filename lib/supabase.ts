import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// The public client. It holds the anon key, which ships in the browser and is
// meant to be visible — every guard lives in the database, not here.
//
// This key can do exactly one thing: call submit_prayer(). It has no privileges
// on any table, so it cannot read a prayer request back, cannot mark anything
// prayed over, and cannot reach the contact details. See
// supabase/migrations/0001_initial_schema.sql.
//
// Built on first use rather than at import. Creating it at module scope meant
// that merely importing this file threw when the environment was not set, which
// broke the production build while prerendering pages that only talk to Supabase
// in the browser. A missing environment should fail where it is used, with a
// message someone can act on — not halt a build in an unrelated place.

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY — locally in .env.local, and in the ' +
        'project settings on the host.',
    )
  }

  client = createClient(url, anonKey)
  return client
}
