const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMasterAmenities() {
    console.log('Checking amenities_master table...');
    const { data, error } = await supabase
        .from('amenities_master')
        .select('*');

    if (error) {
        console.error('Error fetching amenities_master:', error);
    } else {
        console.log('Amenities Master List:', data);
    }
}

checkMasterAmenities();
