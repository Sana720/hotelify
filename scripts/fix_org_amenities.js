require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ORG_ID = 'ba732ea4-a2e9-42c0-a7e4-67eab8539624';

const AMENITIES = [
  { name: 'WIFI', icon: 'Wifi' },
  { name: 'AC', icon: 'Wind' },
  { name: 'TV', icon: 'Tv' },
  { name: 'COFFEE MAKER', icon: 'Coffee' },
  { name: 'GYM', icon: 'Dumbbell' },
  { name: 'MINI BAR', icon: 'Coffee' },
  { name: 'MICROWAVE', icon: 'Microwave' },
  { name: 'BATH TUB', icon: 'Bath' },
  { name: 'INFINITY POOL', icon: 'Waves' },
  { name: 'ROOFTOP BAR', icon: 'Wine' },
  { name: '24/7 BUTLER SERVICE', icon: 'Bell' }
];

async function seed() {
  console.log('Seeding amenities for org:', ORG_ID);
  
  // 1. Delete existing for this org (to avoid duplicates)
  await supabase.from('amenities').delete().eq('org_id', ORG_ID);
  
  // 2. Insert new
  const { data: inserted, error } = await supabase
    .from('amenities')
    .insert(AMENITIES.map(a => ({ ...a, org_id: ORG_ID })))
    .select();
  
  if (error) {
    console.error('Error inserting amenities:', error);
    return;
  }
  
  console.log(`Seeded ${inserted.length} amenities.`);
  
  // 3. Link them to King Suite and Queen Suite
  const amenityIds = inserted.map(a => a.id);
  
  const kingSuiteId = 'cf22f18c-d019-4a18-bc38-e889c873450c';
  const queenSuiteId = 'fa1da539-63cd-4166-87a6-f2f147b5a84c';
  
  await supabase
    .from('room_types')
    .update({ amenities: amenityIds })
    .eq('id', kingSuiteId);
    
  await supabase
    .from('room_types')
    .update({ amenities: amenityIds.slice(0, 6) }) // Queen gets first 6
    .eq('id', queenSuiteId);
    
  console.log('Linked amenities to room types.');
}

seed();
