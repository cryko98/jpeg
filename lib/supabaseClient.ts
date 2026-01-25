import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// ⚠️ FONTOS BEÁLLÍTÁS / IMPORTANT CONFIG
// ------------------------------------------------------------------
// Mivel a környezeti változók (process.env) nem mindig jutnak el a böngészőhöz,
// a legbiztosabb, ha ide másolod be közvetlenül az adatokat.
//
// 1. Töröld ki az üres stringet ("").
// 2. Másold be a Supabase URL-t és az ANON KEY-t az idézőjelek közé.
// ------------------------------------------------------------------

const MANUAL_SUPABASE_URL = ""; 
// Pl: "https://wkkeyyrknmnynlcefugq.supabase.co"

const MANUAL_SUPABASE_ANON_KEY = ""; 
// Pl: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// ------------------------------------------------------------------

// Segédfüggvény a környezeti változók biztonságos olvasására (ha mégis működnének)
const getEnvVar = (key: string) => {
  try {
    // Node/Webpack stílus
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    // Vite stílus
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    return '';
  }
  return '';
};

// Prioritás: 1. Manuális (hardcoded) 2. Környezeti változó
const supabaseUrl = MANUAL_SUPABASE_URL || getEnvVar('SUPABASE_URL') || '';
const supabaseAnonKey = MANUAL_SUPABASE_ANON_KEY || getEnvVar('SUPABASE_ANON_KEY') || '';

// URL Validáció
const isValidUrl = (url: string) => {
  try {
    if (!url) return false;
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 20;

if (!isConfigured) {
  console.log('%c⚠️ SUPABASE HIBA', 'color: red; font-size: 20px; font-weight: bold;');
  console.log('A leaderboard OFFLINE módban van.');
  console.log('Kérlek töltsd ki a MANUAL_SUPABASE_URL és MANUAL_SUPABASE_ANON_KEY változókat a lib/supabaseClient.ts fájlban!');
}

export const isSupabaseConfigured = isConfigured;

// Kliens létrehozása vagy Mockolása
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase credentials missing in lib/supabaseClient.ts" } }),
      }),
    } as any;