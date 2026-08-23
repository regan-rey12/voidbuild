export function sanitizeSupabaseEnvValue(value?: string | null): string {
  return (value || '')
    .replace(/^['"`\[\s]+/, '')
    .replace(/['"`\]\s]+$/, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

export function readSupabaseUrl(): string {
  return sanitizeSupabaseEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function readSupabaseAnonKey(): string {
  return sanitizeSupabaseEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function readSupabaseServiceRoleKey(): string {
  return sanitizeSupabaseEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasUsableSupabaseUrl(url: string): boolean {
  return !!url && url.startsWith('http') && !url.includes('placeholder');
}

export function hasUsableSupabaseKey(key: string): boolean {
  return !!key && key.length >= 20 && !key.includes('placeholder') && !key.includes('YOUR_');
}
