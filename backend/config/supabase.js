// ==============================
// config/supabase.js
// Creates connection to Supabase Storage
// Used for uploading and deleting files
// ==============================

const { createClient } = require('@supabase/supabase-js');

// These values come from your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Check that the values exist
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
}

// Create the Supabase client
// We use the SERVICE KEY (not anon key) because:
// - Service key has full access to storage
// - Anon key has limited permissions
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;