const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBedTypes() {
    console.log('Checking bed_types table...');
    const { data, error } = await supabase
        .from('bed_types')
        .select('*');

    if (error) {
        console.error('Error fetching bed_types:', error);
    } else {
        console.log('Bed Types List:', data);
    }
}

checkBedTypes();
