import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// Opció A (Ajánlott): Használj .env fájlt ezekkel a változókkal:
// SUPABASE_URL=https://your-project.supabase.co
// SUPABASE_ANON_KEY=your-long-key-string
//
// Opció B (Gyors): Másold be közvetlenül ide a stringeket a '...' közé.
// ------------------------------------------------------------------

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

if (supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
    console.warn('⚠️ Supabase URL nincs beállítva! Kérlek frissítsd a lib/supabaseClient.ts fájlt.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);