import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}

/**
 * Shared Supabase client instance.
 * Uses the anon key for public operations (waitlist insert).
 * Authenticated operations (admin select/delete) automatically use
 * the session token from Supabase Auth once a user signs in.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
