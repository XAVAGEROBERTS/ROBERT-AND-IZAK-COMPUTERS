import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials
// For now, using placeholders that won't break the app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have valid-looking URLs
let supabase = null

if (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client initialized successfully')
  } catch (error) {
    console.error('Error initializing Supabase client:', error)
    supabase = null
  }
} else {
  console.warn('Supabase not configured. Using sample data.')
}

export { supabase }