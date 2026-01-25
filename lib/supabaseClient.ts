import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// This client relies on Environment Variables.
// It supports both standard Node.js (process.env) and Vite (import.meta.env)
// ------------------------------------------------------------------

const getEnvVar = (key: string) => {
  try {
    // Check for Vite prefixed variables first if using Vite
    const viteKey = `VITE_${key}`;
    
    // Check import.meta.env (Vite/Modern browsers)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        if ((import.meta as any).env[key]) return (import.meta as any).env[key];
        if ((import.meta as any).env[viteKey]) return (import.meta as any).env[viteKey];
    }
    
    // Check process.env (Node/Webpack)
    if (typeof process !== 'undefined' && process.env) {
        if (process.env[key]) return process.env[key];
        if (process.env[viteKey]) return process.env[viteKey];
    }
  } catch (e) { 
      return ''; 
  }
  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

const isValidUrl = (url: string) => {
  try {
    if (!url) return false;
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch { return false; }
};

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey.length > 20;

if (!isConfigured) {
  console.warn("Supabase is not configured. Leaderboard will be offline.");
  console.log("Required Env Vars: SUPABASE_URL, SUPABASE_ANON_KEY");
}

export const isSupabaseConfigured = isConfigured;

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase credentials missing in environment variables." } }),
      }),
    } as any;