// Backward-compatible browser Supabase exports.
// New code should prefer explicit helpers from:
// - ./supabase-browser
// - ./supabase-server
// - ./supabase-admin
export {
  getSupabaseBrowser as getSupabase,
  isSupabaseBrowserConfigured as isSupabaseConfigured,
} from './supabase-browser';
