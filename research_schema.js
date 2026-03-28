const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log('Checking amenities_master and bed_types schema...');
    
    // We can't directly check schema with JS client easily, but we can try an insert with one field
    // or just check existing code.
    // Let's check RoomTypeManager.tsx again.
    // It says:
    // 49: supabase.from('amenities_master').select('*'),
    // 239: <span className="text-[10px] font-black uppercase tracking-wider truncate">{am.name}</span>
    
    // So 'amenities_master' has 'id' and 'name'. Does it have 'icon'?
    // Let's check 'bed_types'.
    // 50: supabase.from('bed_types').select('*')
    // 268: <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
    //      <Bed className="w-3.5 h-3.5 text-blue-500/50" /> {rt.base_occupancy} - {rt.max_occupancy} Guests
    //      </p>

    // Let's look at the fetch logic for amenities in AmenitiesPage.tsx:
    // .from('amenities').select('*').eq('org_id', tenant!.id).order('name');
    // It uses 'id', 'org_id', 'name', 'icon'.

    // Master amenities might be simpler. Let's try to get one row and see the keys (if any existed, but they don't).
    
    console.log('Looking at src/app/(admin)/admin/hotels/actions.ts for clues if it exists...');
}

checkSchema();
