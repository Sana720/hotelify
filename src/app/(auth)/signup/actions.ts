'use server';

import { createClient } from '@supabase/supabase-js';

export async function registerUserAndLead(formData: {
    email: string;
    phone: string;
    password: string;
    hotelName: string;
}) {
    // 1. Initialize Supabase Service Role Client
    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
        }

        // 2. Create User via Admin (Confirm instantly to bypass email limits)
        const { data: userData, error: userError } = await supabaseService.auth.admin.createUser({
            email: formData.email,
            password: formData.password,
            email_confirm: true,
            user_metadata: { full_name: formData.hotelName }
        });

        if (userError) throw userError;

        // 3. Create Lead Record
        const { error: leadError } = await supabaseService.from('leads').insert({
            email: formData.email,
            phone: formData.phone,
            hotel_name: formData.hotelName,
            status: 'Pending'
        });

        if (leadError) throw leadError;

        return { success: true };
    } catch (error: any) {
        console.error("Registration Error:", error);
        return { success: false, error: error.message };
    }
}
