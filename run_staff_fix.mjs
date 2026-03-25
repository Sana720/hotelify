
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://lnhehwxavvluoaafnozm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuaGVod3hhdnZsdW9hYWZub3ptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyNDg4MSwiZXhwIjoyMDg4NjAwODgxfQ.qdg5gsREftth2GwMakUUp7NF-iVD3blVRSOCDC35Wz8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    const sql = fs.readFileSync('./supabase/migrations/20250318000000_resolve_user_linkage.sql', 'utf8')
    
    // Supabase doesn't have a direct 'query' method in the JS client for arbitrary SQL.
    // I have to use the REST API or a stored procedure if available.
    // However, I can try to perform the updates manually via the client for the critical parts.
    
    console.log('--- Manual Migration Execution ---')
    
    // 1. Link staff
    console.log('Linking staff records...')
    const { data: users } = await supabase.auth.admin.listUsers()
    const { data: staff } = await supabase.from('staff').select('*').is('user_id', null)
    
    for (const s of staff || []) {
        const user = users?.find(u => u.email === s.email)
        if (user) {
            console.log(`Linking ${s.email} to ${user.id}`)
            await supabase.from('staff').update({ user_id: user.id }).eq('id', s.id)
        }
    }
    
    console.log('Migration Complete (Staff Linked).')
    console.log('Note: RLS policies in the .sql file should be applied via the Supabase Dashboard SQL Editor if possible, or I will try to use an RPC if I find one.')
}

runMigration()
