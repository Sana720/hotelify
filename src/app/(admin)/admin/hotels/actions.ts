'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function provisionHotel(formData: {
    name: string;
    subdomain: string;
    adminEmail: string;
    adminName: string;
    tier: string;
    planId: string;
}) {
    const cookieStore = await cookies();
    
    // Use a dedicated service role client from supabase-js (NOT ssr)
    // to guarantee we are bypassing RLS by not including user cookies.
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
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Please add it to your .env.local.");
        }

        // 1. Create Organization
        const { data: org, error: orgError } = await supabaseService
            .from("organizations")
            .insert([{
                name: formData.name,
                subdomain: formData.subdomain.toLowerCase().replace(/\s+/g, '-'),
                subscription_tier: formData.tier,
                plan_id: formData.planId,
                status: 'Trial'
            }])
            .select()
            .single();

        if (orgError) throw orgError;

        // 2. Create Default Admin Role for this Org
        const { data: role, error: roleError } = await supabaseService
            .from("roles")
            .insert([{
                org_id: org.id,
                name: "Property Owner",
                permissions: ["all"]
            }])
            .select()
            .single();

        if (roleError) throw roleError;

        // 3. Invite Admin via Auth (Service Role required)
        const { data: inviteData, error: inviteError } = await supabaseService.auth.admin.inviteUserByEmail(
            formData.adminEmail,
            {
                data: { full_name: formData.adminName },
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
            }
        );

        if (inviteError) throw inviteError;

        // 4. Create Staff Record
        const { error: staffError } = await supabaseService
            .from("staff")
            .insert([{
                org_id: org.id,
                user_id: inviteData.user.id,
                email: formData.adminEmail,
                full_name: formData.adminName,
                role_id: role.id,
                is_active: true
            }]);

        if (staffError) throw staffError;

        // 5. Initialize Property Identity
        await supabaseService.from("property_identity").insert([{
            org_id: org.id,
            legal_name: formData.name
        }]);

        // 6. Initialize Operational Policies
        await supabaseService.from("operational_policies").insert([{
            org_id: org.id
        }]);

        return { success: true, orgId: org.id };
    } catch (error: any) {
        console.error("Provisioning Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updatePropertySettings(orgId: string, data: {
    name?: string;
    identityUpdate: any;
    policyUpdate: any;
}) {
    // Only verify if we have the service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Update blocked.");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        console.log("SERVER ACTION - Syncing Settings for Org:", orgId);
        
        const updates = [];
        
        // 1. Update Organization Name if provided
        if (data.name) {
            updates.push(supabaseService.from('organizations').update({ name: data.name }).eq('id', orgId));
        }

        // 2. Update Property Identity
        updates.push(supabaseService.from('property_identity').upsert({ ...data.identityUpdate, org_id: orgId }, { onConflict: 'org_id' }));

        // 3. Update Operational Policies
        updates.push(supabaseService.from('operational_policies').upsert({ ...data.policyUpdate, org_id: orgId }, { onConflict: 'org_id' }));

        const results = await Promise.all(updates);
        
        for (const res of results) {
            if (res.error) {
                console.error("Partial Sync Error:", res.error);
                throw res.error;
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Settings Update Error Full Trace:", error);
        return { success: false, error: error.message };
    }
}

export async function fetchPropertySettings(orgId: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const [identityRes, policyRes] = await Promise.all([
            supabaseService.from('property_identity').select('*').eq('org_id', orgId).maybeSingle(),
            supabaseService.from('operational_policies').select('*').eq('org_id', orgId).maybeSingle()
        ]);

        if (identityRes.error) throw identityRes.error;
        if (policyRes.error) throw policyRes.error;

        return { 
            success: true, 
            identity: identityRes.data,
            policy: policyRes.data
        };
    } catch (error: any) {
        console.error("Fetch Settings Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createRoomType(orgId: string, data: {
    name: string;
    description?: string;
    base_occupancy: number;
    max_occupancy: number;
    base_price: number;
    amenities: string[];
    bed_configuration: any[];
}) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { data: rt, error } = await supabaseService
            .from('room_types')
            .insert([{
                ...data,
                org_id: orgId
            }])
            .select()
            .single();

        if (error) throw error;

        return { success: true, roomType: rt };
    } catch (error: any) {
        console.error("Create Room Type Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteRoomType(orgId: string, roomTypeId: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { error } = await supabaseService
            .from('room_types')
            .delete()
            .eq('id', roomTypeId)
            .eq('org_id', orgId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Delete Room Type Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateRoomType(orgId: string, roomTypeId: string, data: {
    name?: string;
    description?: string;
    base_occupancy?: number;
    max_occupancy?: number;
    base_price?: number;
    amenities?: string[];
    bed_configuration?: any[];
}) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { data: rt, error } = await supabaseService
            .from('room_types')
            .update(data)
            .eq('id', roomTypeId)
            .eq('org_id', orgId)
            .select()
            .single();

        if (error) throw error;

        // If base_price was updated, sync it to all linked rooms
        if (data.base_price !== undefined) {
            console.log("SERVER ACTION - Syncing Room Prices for Room Type:", roomTypeId);
            const { error: syncError } = await supabaseService
                .from('rooms')
                .update({ base_price: data.base_price })
                .eq('room_type_id', roomTypeId)
                .eq('org_id', orgId);
            
            if (syncError) {
                console.error("Price Sync Warning (Rooms):", syncError.message);
                // We don't throw here to avoid failing the main RT update, 
                // but in a production app we might want more robust sync.
            }
        }

        return { success: true, roomType: rt };
    } catch (error: any) {
        console.error("Update Room Type Error:", error);
        return { success: false, error: error.message };
    }
}
export async function updateOrganizationStatus(orgId: string, status: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { error } = await supabaseService
            .from('organizations')
            .update({ status })
            .eq('id', orgId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Update Org Status Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteOrganization(orgId: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        // Cascade delete should handle related table data if configured in DB,
        // but we delete the primary record here.
        const { error } = await supabaseService
            .from('organizations')
            .delete()
            .eq('id', orgId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Delete Org Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createLaundryCycle(orgId: string, data: any) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { data: cycle, error } = await supabaseService
            .from('laundry_cycles')
            .insert([{ ...data, org_id: orgId }])
            .select()
            .single();

        if (error) throw error;
        return { success: true, cycle };
    } catch (error: any) {
        console.error("Create Laundry Cycle Error:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleLaundryCycleStatus(orgId: string, cycleId: string, status: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { data: cycle, error } = await supabaseService
            .from('laundry_cycles')
            .update({ status })
            .eq('id', cycleId)
            .eq('org_id', orgId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, cycle };
    } catch (error: any) {
        console.error("Toggle Laundry Cycle Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteLaundryCycle(orgId: string, cycleId: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { error } = await supabaseService
            .from('laundry_cycles')
            .delete()
            .eq('id', cycleId)
            .eq('org_id', orgId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Delete Laundry Cycle Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateRoomStatus(orgId: string, roomId: string, status: string, assignedStaffId?: string | null) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const updateData: any = { status };
        if (assignedStaffId !== undefined) {
            updateData.assigned_staff_id = assignedStaffId;
        }

        const { error } = await supabaseService
            .from('rooms')
            .update(updateData)
            .eq('id', roomId)
            .eq('org_id', orgId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Update Room Status Error:", error);
        return { success: false, error: error.message };
    }
}

export async function logHousekeepingAction(orgId: string, data: {
    room_id: string;
    staff_id?: string | null;
    old_status?: string | null;
    new_status: string;
    action_type?: string;
}) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { error } = await supabaseService
            .from('housekeeping_logs')
            .insert([{ ...data, org_id: orgId }]);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Log Housekeeping Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getHousekeepingHistory(orgId: string, roomId?: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        let query = supabaseService
            .from('housekeeping_logs')
            .select(`
                *,
                staff:staff_id (full_name),
                room:room_id (room_number)
            `)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (roomId) {
            query = query.eq('room_id', roomId);
        }

        const { data, error } = await query.limit(100);

        if (error) throw error;
        return { success: true, logs: data };
    } catch (error: any) {
        console.error("Fetch Housekeeping Logs Error:", error);
        return { success: false, error: error.message };
    }
}

export async function registerGuest(orgId: string, data: {
    name: string;
    phone: string;
    email?: string;
    aadhaar_number?: string;
    guest_type: 'individual' | 'corporate';
    company_name?: string;
    company_gst?: string;
    company_address?: string;
}) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { data: guest, error } = await supabaseService
            .from('guests')
            .upsert([{ ...data, org_id: orgId }], { onConflict: 'org_id, phone' })
            .select()
            .single();

        if (error) throw error;
        return { success: true, guest };
    } catch (error: any) {
        console.error("Register Guest Error:", error);
        return { success: false, error: error.message };
    }
}
