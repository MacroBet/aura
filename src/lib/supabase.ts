import { createClient } from '@supabase/supabase-js';

// Fallback values for development - replace with your actual Supabase project details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Log warning if using placeholder values
if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn(
    '⚠️ SUPABASE NOT CONFIGURED\n\n' +
    'Please set up your Supabase project:\n' +
    '1. Create a new project at https://supabase.com\n' +
    '2. Add your credentials to .env:\n' +
    '   VITE_SUPABASE_URL=your-project-url\n' +
    '   VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
    '3. Run the SQL schema from /docs/supabase-schema.sql\n\n' +
    'The app will run in demo mode with limited functionality.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);