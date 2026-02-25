// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('Supabase URL:', supabaseUrl ? '✓ Loaded' : '✗ Missing');
console.log('Supabase Key:', supabaseAnonKey ? '✓ Loaded' : '✗ Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection on startup
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('admin_users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
    return false;
  }
};