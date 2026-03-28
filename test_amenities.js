const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAmenities() {
    console.log('Checking amenities table...');
    const { data: tables, error: tableError } = await supabase
        .from('amenities')
        .select('*', { count: 'exact', head: true });

    if (tableError) {
        console.error('Error checking amenities table:', tableError);
    } else {
        console.log('Amenities table exists.');
    }

    const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching amenities:', error);
    } else {
        console.log('Sample amenities:', data);
    }

    // Check organization ids
    const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .limit(5);
    
    if (orgError) {
        console.error('Error fetching organizations:', orgError);
    } else {
        console.log('Sample organizations:', orgs);
    }
}

checkAmenities();
