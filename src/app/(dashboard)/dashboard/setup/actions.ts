"use server";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSetupProgress(orgId: string, nextStep: 'pending_settings' | 'pending_room_types' | 'pending_rooms' | 'completed') {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" };
    }

    const supabaseService = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log(`SERVER ACTION - Updating setup progress for Org: ${orgId} to ${nextStep}`);

    const { error } = await supabaseService
        .from('organizations')
        .update({ setup_step: nextStep })
        .eq('id', orgId);

    if (error) {
        console.error("SERVER ACTION - Failed to update setup progress:", error);
        return { success: false, error: error.message };
    }

    console.log(`SERVER ACTION - Database update successful. Calling revalidatePath('/dashboard') if nextStep was completed.`);
    // Revalidation is only strictly necessary for server components,
    // but we do it anyway to ensure any server-side state is fresh.
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/setup');
    
    return { success: true };
}
