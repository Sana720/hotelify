"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Search, Filter, MoreVertical, Globe, Calendar, ShieldCheck, Loader2, CreditCard, Trash2, ShieldAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddHotelModal } from "./add-hotel-modal"
import { updateOrganizationStatus, deleteOrganization } from "./actions";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminHotelsPage() {
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    async function fetchHotels() {
        setLoading(true);
        const { data, error } = await supabase
            .from('organizations')
            .select('*, subscription_plans(name)')
            .order('created_at', { ascending: false });

        if (data) {
            setHotels(data.map((h: any) => ({
                id: h.id,
                name: h.name,
                domain: h.subdomain + ".hotelify.com",
                tier: h.subscription_plans?.name || (h.subscription_tier ? h.subscription_tier.charAt(0).toUpperCase() + h.subscription_tier.slice(1) : "Starter"),
                status: h.status || "Active",
                joined: new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            })));
        }
        setLoading(false);
    }

    const handleUpdateStatus = async (orgId: string, status: string) => {
        setActionLoading(orgId);
        const result = await updateOrganizationStatus(orgId, status);
        if (result.success) {
            await fetchHotels();
        } else {
            alert("Failed to update status: " + result.error);
        }
        setActionLoading(null);
        setActiveDropdown(null);
    };

    const handleDeleteHotel = async (orgId: string, name: string) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete ${name}? This action cannot be undone.`)) return;
        
        setActionLoading(orgId);
        const result = await deleteOrganization(orgId);
        if (result.success) {
            await fetchHotels();
        } else {
            alert("Failed to delete property: " + result.error);
        }
        setActionLoading(null);
        setActiveDropdown(null);
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const filteredHotels = hotels.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Retrieving Properties...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Property Management</h1>
                    <p className="text-zinc-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Manage & Monitor Global Organizations</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                    >
                        Add New Property
                    </Button>
                </div>
            </div>

            <AddHotelModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchHotels}
            />

            <Card className="glass-premium border-white/5 bg-white/[0.02]">
                <CardHeader className="pb-0">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-400 transition-colors" />
                            <Input
                                placeholder="Search by name, domain or owner email..."
                                className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl focus:ring-blue-500/20 focus:border-blue-500/40 text-sm font-medium"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="h-12 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] flex items-center gap-2 px-4 rounded-xl">
                                <Filter className="w-4 h-4 text-zinc-300" />
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Filters</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="rounded-2xl border border-white/5">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Infrastructure</th>
                                    <th className="px-6 py-4">Subscription</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredHotels.map((hotel, index) => (
                                    <tr key={hotel.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{hotel.name}</div>
                                                    <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Joined {hotel.joined}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                                                    <Globe className="w-3.5 h-3.5 text-blue-400/50" />
                                                    {hotel.domain}
                                                </div>
                                                {hotel.custom && (
                                                    <div className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest pl-5">
                                                        {hotel.custom}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${hotel.tier === 'Enterprise' ? 'bg-blue-500' : hotel.tier === 'Professional' ? 'bg-purple-500' : 'bg-zinc-500'}`} />
                                                    <span className="font-black uppercase tracking-widest text-[10px]">{hotel.tier}</span>
                                                </div>
                                                <div className="text-[10px] text-zinc-600 font-bold flex items-center gap-1">
                                                    <CreditCard className="w-3 h-3" /> Billing Active
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${hotel.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                hotel.status === 'Trial' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                    hotel.status === 'Maintenance' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                }`}>
                                                {hotel.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative flex justify-end">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="rounded-xl hover:bg-white/5"
                                                    onClick={() => setActiveDropdown(activeDropdown === hotel.id ? null : hotel.id)}
                                                    disabled={actionLoading === hotel.id}
                                                >
                                                    {actionLoading === hotel.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                    ) : (
                                                        <MoreVertical className="w-4 h-4 text-zinc-400" />
                                                    )}
                                                </Button>

                                                <AnimatePresence>
                                                    {activeDropdown === hotel.id && (
                                                        <>
                                                            <div 
                                                                className="fixed inset-0 z-30" 
                                                                onClick={() => setActiveDropdown(null)}
                                                            />
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: index > filteredHotels.length - 3 ? 10 : -10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: index > filteredHotels.length - 3 ? 10 : -10 }}
                                                                className={`absolute right-0 w-56 glass-premium border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-3xl rounded-2xl shadow-2xl z-40 overflow-hidden py-2 ${index > filteredHotels.length - 3 ? 'bottom-full mb-2' : 'top-12'}`}
                                                            >
                                                                <div className="px-4 py-2 border-b border-white/5 mb-2">
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Actions</p>
                                                                </div>

                                                                <button
                                                                    onClick={() => window.open(`/dashboard?org_id=${hotel.id}`, '_blank')}
                                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-blue-400 hover:bg-blue-400/10 transition-colors text-[10px] font-black uppercase tracking-widest"
                                                                >
                                                                    <Globe className="w-4 h-4" />
                                                                    Login to Dashboard
                                                                </button>

                                                                <div className="h-px bg-white/5 my-2" />

                                                                <button
                                                                    onClick={() => handleUpdateStatus(hotel.id, 'Active')}
                                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-emerald-400 hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                                                    disabled={hotel.status === 'Active'}
                                                                >
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                    Activate Property
                                                                </button>

                                                                <button
                                                                    onClick={() => handleUpdateStatus(hotel.id, 'Suspended')}
                                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-amber-400 hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                                                    disabled={hotel.status === 'Suspended'}
                                                                >
                                                                    <ShieldAlert className="w-4 h-4" />
                                                                    Suspend Access
                                                                </button>

                                                                <button
                                                                    onClick={() => handleUpdateStatus(hotel.id, 'Maintenance')}
                                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-blue-400 hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                                                    disabled={hotel.status === 'Maintenance'}
                                                                >
                                                                    <Filter className="w-4 h-4" />
                                                                    Maintenance Mode
                                                                </button>

                                                                <div className="h-px bg-white/5 my-2" />

                                                                <button
                                                                    onClick={() => handleDeleteHotel(hotel.id, hotel.name)}
                                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-rose-500 hover:bg-rose-500/10 transition-colors text-[10px] font-black uppercase tracking-widest"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Terminate Prop
                                                                </button>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
