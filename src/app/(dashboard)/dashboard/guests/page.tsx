"use client";

import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import {
    Users,
    Building2,
    User,
    Search,
    Phone,
    Mail,
    CreditCard,
    Filter,
    Plus,
    Loader2,
    CalendarCheck,
    ChevronRight,
    MapPin,
    Fingerprint
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegisterGuestDialog } from "@/modules/pms/RegisterGuestDialog";
import { GuestProfile } from "@/modules/pms/GuestProfile";
import { AnimatePresence } from "framer-motion";

export default function GuestsPage() {
    const { tenant } = useTenant();
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedGuest, setSelectedGuest] = useState<any | null>(null);

    const stats = {
        total: guests.length,
        corporate: guests.filter(g => g.guest_type === 'corporate').length,
        individual: guests.filter(g => g.guest_type === 'individual').length,
    };

    useEffect(() => {
        if (!tenant) return;

        async function fetchGuests() {
            setLoading(true);
            const { data, error } = await supabase
                .from('guests')
                .select('*')
                .eq('org_id', tenant!.id)
                .order('name');
            
            if (data) setGuests(data);
            setLoading(false);
        }

        fetchGuests();
    }, [tenant, refreshKey]);

    const filteredGuests = guests.filter(guest => {
        const matchesSearch = 
            guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guest.phone.includes(searchQuery) ||
            guest.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
            filter === "all" || 
            guest.guest_type === filter;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                Synchronizing Guest Intelligence...
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Guest Discovery</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.25em] text-[10px] mt-2">Managing {stats.total} identified entities in your ecosystem.</p>
                </div>
                <div className="flex items-center gap-4 h-16 bg-black/40 px-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                   <div className="flex flex-col items-center px-4 border-r border-white/5">
                        <span className="text-xs font-black text-indigo-400">{stats.total}</span>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Total</span>
                   </div>
                   <div className="flex flex-col items-center px-4 border-r border-white/5">
                        <span className="text-xs font-black text-emerald-400">{stats.corporate}</span>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Corporate</span>
                   </div>
                   <div className="flex flex-col items-center px-4">
                        <span className="text-xs font-black text-blue-400">{stats.individual}</span>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Individual</span>
                   </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <Tabs value={filter} onValueChange={setFilter} className="w-full max-w-md">
                    <TabsList className="bg-white/[0.03] border border-white/5 p-1 h-12 rounded-2xl w-full">
                        <TabsTrigger value="all" className="rounded-xl font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-indigo-500 data-[state=active]:text-white flex-1 h-full">All Entites</TabsTrigger>
                        <TabsTrigger value="individual" className="rounded-xl font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-indigo-500 data-[state=active]:text-white flex-1 h-full">Individual</TabsTrigger>
                        <TabsTrigger value="corporate" className="rounded-xl font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-indigo-500 data-[state=active]:text-white flex-1 h-full">Corporate</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-4 shrink-0">
                    <div className="relative w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify guest..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-11 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-sans"
                        />
                    </div>
                    <RegisterGuestDialog 
                        onSuccess={() => setRefreshKey(k => k + 1)}
                        trigger={
                            <Button className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all">
                                <Plus className="w-4 h-4" />
                                Discovery Mode
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Guest List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGuests.length === 0 ? (
                    <div className="col-span-full py-24 text-center text-zinc-600 font-bold uppercase tracking-[0.3em] text-[10px] italic">
                        No entities found matching your search parameters.
                    </div>
                ) : (
                    filteredGuests.map(guest => (
                        <div 
                            key={guest.id} 
                            className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all" />
                            
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner ${guest.guest_type === 'corporate' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {guest.guest_type === 'corporate' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{guest.name}</h3>
                                        <Badge variant="outline" className="mt-1 text-[8px] uppercase tracking-[0.2em] border-white/10 text-zinc-500 font-black">
                                            {guest.guest_type === 'corporate' ? 'Corporate Tier' : 'Individual Tier'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                                    </div>
                                    <span className="text-xs font-bold text-white/80">{guest.phone}</span>
                                </div>
                                
                                {guest.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Mail className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                        <span className="text-xs font-bold text-white/60 truncate max-w-[200px]">{guest.email}</span>
                                    </div>
                                )}

                                <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                                    {guest.guest_type === 'corporate' ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3 h-3 text-indigo-400" />
                                                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Company</span>
                                                </div>
                                                <span className="text-[10px] font-black text-white">{guest.company_name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Fingerprint className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">GSTIN</span>
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-400">{guest.company_gst}</span>
                                            </div>
                                            {guest.company_address && (
                                                <div className="flex items-start gap-4 pt-1">
                                                    <MapPin className="w-3 h-3 text-zinc-600 shrink-0 mt-0.5" />
                                                    <p className="text-[9px] leading-relaxed text-zinc-500 font-medium italic">{guest.company_address}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Fingerprint className="w-3 h-3 text-indigo-400" />
                                                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Gov ID</span>
                                            </div>
                                            <span className="text-[10px] font-black text-white">{guest.aadhaar_number || 'Not Linked'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                onClick={() => setSelectedGuest(guest)}
                                className="w-full mt-6 h-11 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-indigo-600 transition-all font-black uppercase tracking-widest text-[9px] group/btn"
                            >
                                Guest Profile
                                <ChevronRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {selectedGuest && (
                    <GuestProfile 
                        guest={selectedGuest}
                        onClose={() => setSelectedGuest(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
