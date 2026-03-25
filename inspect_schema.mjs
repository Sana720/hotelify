import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const { data: policies, error: pError } = await supabase.from('operational_policies').select('*').limit(1);
  const { data: bookings, error: bError } = await supabase.from('bookings').select('*').limit(1);

  console.log('--- Operational Policies Columns ---');
  if (policies && policies.length > 0) {
    console.log(Object.keys(policies[0]));
  } else if (pError) {
    console.error('Error fetching policies:', pError);
  } else {
    console.log('No data in operational_policies');
  }

  console.log('\n--- Bookings Columns ---');
  if (bookings && bookings.length > 0) {
    console.log(Object.keys(bookings[0]));
  } else if (bError) {
    console.error('Error fetching bookings:', bError);
  } else {
    console.log('No data in bookings');
  }
}

inspect();
