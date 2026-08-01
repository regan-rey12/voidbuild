// Debug env - shows if env vars are loaded (without exposing secrets)
export const runtime = 'edge';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const momoNumber = process.env.NEXT_PUBLIC_MOMO_MTN_NUMBER;

  return Response.json({
    supabaseUrl: supabaseUrl ? `${supabaseUrl.slice(0, 30)}... (length ${supabaseUrl.length})` : 'MISSING',
    supabaseUrlExists: !!supabaseUrl,
    anonKeyExists: !!anonKey,
    anonKeyLength: anonKey?.length || 0,
    anonKeyStartsWith: anonKey ? anonKey.slice(0, 20) + '...' : 'MISSING',
    hasPlaceholder: supabaseUrl?.includes('placeholder') || anonKey?.includes('placeholder'),
    openRouterExists: !!openRouterKey,
    momoNumber: momoNumber || 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('OPENROUTER') || k.includes('MOMO')).slice(0, 20),
    cwd: process.cwd(),
    message: supabaseUrl && anonKey && !supabaseUrl.includes('placeholder') 
      ? 'Supabase env looks OK - restart server if still shows not configured' 
      : 'Supabase env MISSING or has placeholder - check .env.local location and content',
  });
}
