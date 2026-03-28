"use client";

import { Table as BaseTable, TableHeader as BaseTableHeader, TableRow as BaseTableRow, TableHead as BaseTableHead, TableBody as BaseTableBody, TableCell as BaseTableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Loader2, Plus, X, Shield, Key } from "lucide-react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function StaffList() {
    const { tenant, isLoading: isTenantLoading } = useTenant();
    const [staff, setStaff] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        role_id: "",
        pin_code: ""
    });

    const resetForm = () => {
        setFormData({
            full_name: "",
            email: "",
            role_id: "",
            pin_code: ""
        });
    };

    useEffect(() => {
        async function fetchStaff() {
            if (!tenant) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('staff')
                    .select('*, roles(name)')
                    .eq('org_id', tenant.id);

                if (error) throw error;
                setStaff(data || []);
            } catch (err) {
                console.error("Error fetching staff:", err);
            } finally {
                setIsLoading(false);
            }
        }

        async function fetchRoles() {
            if (!tenant) return;
            const { data } = await supabase
                .from('roles')
                .select('*')
                .eq('org_id', tenant.id)
                .order('name');
            if (data) setRoles(data);
        }

        if (!isTenantLoading) {
            fetchStaff();
            fetchRoles();
        }
    }, [tenant, isTenantLoading]);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsSubmitting(true);
        try {
            // Use the Secure Auth Bridge instead of direct insertion
            const response = await fetch('/api/staff/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    email: formData.email,
                    role_id: formData.role_id,
                    pin_code: formData.pin_code,
                    org_id: tenant.id
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create staff account");
            }

            toast.success("Team member onboarded and account created.");
            setIsDialogOpen(false);
            resetForm();
            
            // Refresh Staff List
            const { data } = await supabase
                .from('staff')
                .select('*, roles(name)')
                .eq('org_id', tenant.id);
            if (data) setStaff(data);
            
        } catch (err: any) {
            toast.error(`Onboarding Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isTenantLoading || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-300 gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Synchronizing Team Data...</span>
            </div>
        );
    }

    return (
        <Card className="glass-premium border-white/10 overflow-hidden font-sans">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <div>
                    <CardTitle className="text-2xl text-gradient-premium">Staff Directory</CardTitle>
                    <p className="text-sm text-white/40 mt-1.5">Manage your team and their roles at {tenant?.name}.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:scale-105 border border-indigo-500/50 h-11 px-6 font-black uppercase tracking-widest text-[10px]">
                            <UserPlus className="w-4 h-4" />
                            Add Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-premium border-white/10 bg-[#0a0a0c]/95 backdrop-blur-3xl text-white rounded-[2.5rem] p-8 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-2">
                                <Plus className="w-6 h-6 text-indigo-400" />
                                Team <span className="text-indigo-400">Onboarding</span>
                            </DialogTitle>
                            <DialogDescription className="text-white/40 font-medium">Register a new team member and assign their system permissions.</DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleAddStaff} className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Full Identity Name</Label>
                                    <Input
                                        placeholder="e.g. John Doe"
                                        className="h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-indigo-500/20 font-bold"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Communication Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="john@property.com"
                                        className="h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-indigo-500/20 font-bold"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Assigned Role</Label>
                                        <Select 
                                            value={formData.role_id} 
                                            onValueChange={(v) => setFormData({...formData, role_id: v})}
                                            required
                                        >
                                            <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-2xl font-bold">
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent className="glass-premium border-white/10">
                                                {roles.map(role => (
                                                    <SelectItem key={role.id} value={role.id} className="font-bold">{role.name}</SelectItem>
                                                ))}
                                                {roles.length === 0 && (
                                                    <div className="p-4 text-center text-white/20 text-xs italic">No roles defined. Click the Roles tab to create one.</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
                                            <Key className="w-3 h-3" />
                                            Access PIN
                                        </Label>
                                        <Input
                                            type="text"
                                            maxLength={4}
                                            placeholder="1234"
                                            className="h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-indigo-500/20 font-bold text-center tracking-[0.5em]"
                                            value={formData.pin_code}
                                            onChange={(e) => setFormData({...formData, pin_code: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.role_id}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-indigo-900/40 transition-all"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    Finalize Onboarding
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-0">
                <BaseTable>
                    <BaseTableHeader className="bg-white/[0.02]">
                        <BaseTableRow className="hover:bg-transparent border-white/5">
                            <BaseTableHead className="text-white/60 font-semibold pl-6 tracking-wide uppercase text-[10px]">Name</BaseTableHead>
                            <BaseTableHead className="text-white/60 font-semibold tracking-wide uppercase text-[10px]">Role</BaseTableHead>
                            <BaseTableHead className="text-white/60 font-semibold tracking-wide uppercase text-[10px]">Status</BaseTableHead>
                            <BaseTableHead className="text-right text-white/60 font-semibold pr-6 tracking-wide uppercase text-[10px]">Actions</BaseTableHead>
                        </BaseTableRow>
                    </BaseTableHeader>
                    <BaseTableBody>
                        {staff.length === 0 ? (
                            <BaseTableRow>
                                <BaseTableCell colSpan={4} className="text-center py-20 text-white/20 italic text-sm">
                                    No staff members registered for this property yet.
                                </BaseTableCell>
                            </BaseTableRow>
                        ) : staff.map((person) => (
                            <BaseTableRow key={person.id} className="group hover:bg-white/[0.04] border-white/5 transition-colors duration-300">
                                <BaseTableCell className="pl-6 py-4">
                                    <div className="font-semibold text-white/90 group-hover:text-indigo-300 transition-colors">{person.full_name}</div>
                                    <div className="text-xs text-white/40 mt-1">{person.email}</div>
                                </BaseTableCell>
                                <BaseTableCell className="text-white/70 py-4 font-medium uppercase text-[10px] tracking-tight">
                                    {person.roles?.name || "No Role"}
                                </BaseTableCell>
                                <BaseTableCell className="py-4">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${person.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${person.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                        {person.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </BaseTableCell>
                                <BaseTableCell className="text-right pr-6 py-4">
                                    <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/10 transition-colors rounded-full">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </BaseTableCell>
                            </BaseTableRow>
                        ))}
                    </BaseTableBody>
                </BaseTable>
            </CardContent>
        </Card>
    );
}
