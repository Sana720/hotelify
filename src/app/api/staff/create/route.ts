import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { full_name, email, pin_code, role_id, org_id } = await req.json();

        if (!full_name || !email || !pin_code || !role_id || !org_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Initialize Supabase with Service Role Key for Admin access
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Create the Auth User
        // We use the PIN as the password for staff accounts
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: pin_code,
            email_confirm: true,
            user_metadata: { full_name, role_id, org_id }
        });

        if (authError) {
            console.error("Auth creation error:", authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        const userId = authData.user.id;

        // 2. Create the Staff Profile record linked to the Auth User
        const { error: staffError } = await supabaseAdmin
            .from("staff")
            .insert([{
                id: userId, // Use the same ID for easy lookup
                user_id: userId,
                org_id,
                full_name,
                email,
                role_id,
                pin_code,
                is_active: true
            }]);

        if (staffError) {
            console.error("Staff record error:", staffError);
            // Cleanup: delete the auth user if record creation fails
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return NextResponse.json({ error: staffError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId });

    } catch (err: any) {
        console.error("Staff onboarding bridge error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
