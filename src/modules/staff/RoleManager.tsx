"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Trash2, CheckCircle2, Loader2, Key } from "lucide-react";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";

const AVAILABLE_PERMISSIONS = [
    { id: "pms.view", label: "View PMS Grid", description: "Access the room inventory and status grid." },
    { id: "booking.create", label: "Create Bookings", description: "Make new reservations and guest check-ins." },
    { id: "cleaning.manage", label: "Manage Cleaning", description: "Assign and track room housekeeping tasks." },
    { id: "laundry.log", label: "Log Laundry", description: "Record internal and vendor laundry cycles." },
    { id: "staff.manage", label: "Manage Staff", description: "Add/edit team members and permissions." },
    { id: "settings.edit", label: "Edit Property", description: "Modify hotel identity and operational policies." },
];

import { toast } from "sonner";

export function RoleManager() {
    const { tenant } = useTenant();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });

    useEffect(() => {
        if (tenant) fetchRoles();
    }, [tenant]);

    async function fetchRoles() {
        if (!tenant) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("roles")
                .select("*")
                .eq("org_id", tenant.id)
                .order("name");
            
            if (error) throw error;
            if (data) setRoles(data);
        } catch (err: any) {
            toast.error(`Failed to fetch roles: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    const togglePermission = (permId: string) => {
        setNewRole(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId]
        }));
    };

    const handleCreateRole = async () => {
        if (!newRole.name || !tenant) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from("roles").insert([{
                org_id: tenant.id,
                name: newRole.name,
                permissions: newRole.permissions
            }]);

            if (error) throw error;

            toast.success(`Role "${newRole.name}" created successfully.`);
            setNewRole({ name: "", permissions: [] });
            fetchRoles();
        } catch (err: any) {
            console.error("Role creation error:", err);
            toast.error(`Failed to create role: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        try {
            const { error } = await supabase.from("roles").delete().eq("id", roleId);
            if (error) throw error;
            toast.success("Role deleted.");
            fetchRoles();
        } catch (err: any) {
            toast.error(`Failed to delete role: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Synchronizing Permissions...
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 glass-premium border-white/10">
                <CardHeader>
                    <CardTitle className="text-2xl text-gradient-premium">System Roles</CardTitle>
                    <p className="text-sm text-white/40">Define access levels for your property staff.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {roles.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center italic text-white/20">
                            No custom roles defined.
                        </div>
                    ) : roles.map(role => (
                        <div key={role.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-white text-lg">{role.name}</div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {role.permissions?.map((p: string) => (
                                            <span key={p} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 text-white/30 rounded border border-white/5">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleDeleteRole(role.id)}
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full text-white/10 hover:text-red-400 hover:bg-red-500/10 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="glass-premium border-white/10 h-fit sticky top-8">
                <CardHeader>
                    <CardTitle className="text-xl text-white italic">Create <span className="text-blue-500">New Role</span></CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Role Name</Label>
                        <Input
                            placeholder="e.g. Front Desk Lead"
                            className="h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-blue-500/20 font-bold"
                            value={newRole.name}
                            onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
                            <Key className="w-3 h-3" />
                            Assigned Permissions
                        </Label>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-premium">
                            {AVAILABLE_PERMISSIONS.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => togglePermission(p.id)}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                                        newRole.permissions.includes(p.id)
                                            ? "bg-blue-500/10 border-blue-500/30"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">{p.label}</div>
                                        {newRole.permissions.includes(p.id) && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                                    </div>
                                    <p className="text-[9px] text-white/30 mt-1 leading-tight">{p.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleCreateRole}
                        disabled={submitting || !newRole.name}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-blue-900/40 transition-all"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Save Access Role
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
