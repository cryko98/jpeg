import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// A process.env változók akkor működnek, ha be vannak állítva a build környezetben.
// Ha nincsenek, a kód a fallback értékeket használná.
// Mivel a 'YOUR_SUPABASE_URL_HERE' nem érvényes URL, a createClient hibát dobna.
// Ezért validáljuk az URL-t létrehozás előtt.
// ------------------------------------------------------------------

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Ellenőrizzük, hogy az URL érvényes formátumú-e
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 0;

if (!isConfigured) {
  console.warn('⚠️ Supabase credentials not found or invalid. Leaderboard will be disabled (mocked). Check lib/supabaseClient.ts');
}

export const isSupabaseConfigured = isConfigured;

// Ha van érvényes konfig, létrehozzuk az igazi klienst.
// Ha nincs, egy "mock" objektumot adunk vissza, ami imitálja a működést, hogy ne omoljon össze a játék.
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: (table: string) => ({
        select: (columns: string) => ({
          order: (column: string, opts: any) => ({
            limit: (count: number) => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: (data: any) => Promise.resolve({ data: null, error: null }),
      }),
    } as any;