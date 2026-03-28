const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
    console.log('Seeding Master Amenities...');
    const amenities = [
        { name: 'High-Speed Wi-Fi', icon: 'Wifi' },
        { name: 'Air Conditioning', icon: 'Wind' },
        { name: 'Smart TV', icon: 'Tv' },
        { name: 'Premium Coffee Maker', icon: 'Coffee' },
        { name: 'Safety Deposit Box', icon: 'Lock' },
        { name: 'Mini Bar', icon: 'Wine' },
        { name: 'Room Service', icon: 'Bell' },
        { name: 'En-suite Bathroom', icon: 'Bath' },
        { name: 'Work Desk & Chair', icon: 'Laptop' },
        { name: 'Iron & Ironing Board', icon: 'Shirt' },
        { name: 'Hair Dryer', icon: 'Wind' },
        { name: 'Bathrobes & Slippers', icon: 'Shirt' },
        { name: 'Complimentary Toiletries', icon: 'Sparkles' },
        { name: 'Balcony / Terrace', icon: 'Trees' },
        { name: 'In-room Microwave', icon: 'Microwave' },
        { name: 'Refrigerator', icon: 'Refrigerator' }
    ];

    const { error: amError } = await supabase
        .from('amenities_master')
        .insert(amenities.map(a => ({ name: a.name, icon: a.icon })));

    if (amError) {
        console.warn('Error seeding amenities_master (trying without icon):', amError.message);
        const { error: amError2 } = await supabase
            .from('amenities_master')
            .insert(amenities.map(a => ({ name: a.name })));
        if (amError2) console.error('Error seeding amenities_master:', amError2.message);
        else console.log('Seeded amenities_master (without icon).');
    } else {
        console.log('Seeded amenities_master successfully.');
    }

    console.log('Seeding Bed Types...');
    const beds = [
        { name: 'King Bed' },
        { name: 'Queen Bed' },
        { name: 'Double Bed' },
        { name: 'Twin Beds' },
        { name: 'Sofa Bed' },
        { name: 'Triple Bed' }
    ];

    const { error: bedError } = await supabase
        .from('bed_types')
        .insert(beds);

    if (bedError) {
        console.error('Error seeding bed_types:', bedError.message);
    } else {
        console.log('Seeded bed_types successfully.');
    }

    console.log('Seeding Custom Amenities for Org: ba732ea4-a2e9-42c0-a7e4-67eab8539624');
    const customAmenities = [
        { org_id: 'ba732ea4-a2e9-42c0-a7e4-67eab8539624', name: 'Infinity Pool', icon: 'Waves' },
        { org_id: 'ba732ea4-a2e9-42c0-a7e4-67eab8539624', name: 'Rooftop Bar', icon: 'Wine' },
        { org_id: 'ba732ea4-a2e9-42c0-a7e4-67eab8539624', name: 'Tesla Charging Station', icon: 'Zap' },
        { org_id: 'ba732ea4-a2e9-42c0-a7e4-67eab8539624', name: '24/7 Butler Service', icon: 'Bell' }
    ];

    const { error: customError } = await supabase
        .from('amenities')
        .insert(customAmenities);

    if (customError) {
        console.error('Error seeding custom amenities:', customError.message);
    } else {
        console.log('Seeded custom amenities successfully.');
    }
}

seedData();
