"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Users, 
    Mail, 
    Building2, 
    Calendar, 
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpRight,
    Phone
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { AddHotelModal } from "../hotels/add-hotel-modal";

interface Lead {
    id: string;
    email: string;
    phone: string;
    hotel_name: string;
    status: 'Pending' | 'Contacted' | 'Converted' | 'Spam';
    room_count?: number;
    property_type?: string;
    created_at: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
    const [selectedLeadForProvision, setSelectedLeadForProvision] = useState<Lead | null>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    async function fetchLeads() {
        setLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching leads:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        } else {
            setLeads(data || []);
        }
        setLoading(false);
    }

    const filteredLeads = leads.filter(lead => 
        lead.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Converted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Pending': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Spam': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Converted': return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case 'Pending': return <Clock className="w-3 h-3 mr-1" />;
            case 'Spam': return <XCircle className="w-3 h-3 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-400" />
                        Lead Management
                    </h1>
                    <p className="text-zinc-500 font-medium">Tracking {leads.length} trial signups from the platform</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-premium p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Pending Leads</span>
                    </div>
                    <div className="text-3xl font-black text-white">{leads.filter(l => l.status === 'Pending').length}</div>
                </div>
                <div className="glass-premium p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Converted</span>
                    </div>
                    <div className="text-3xl font-black text-white">{leads.filter(l => l.status === 'Converted').length}</div>
                </div>
                <div className="glass-premium p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-zinc-500/10 border border-zinc-500/20">
                            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Total Pipeline</span>
                    </div>
                    <div className="text-3xl font-black text-white">{leads.length}</div>
                </div>
            </div>

            {/* Table Section */}
            <div className="glass-premium rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-grow max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                        <Input 
                            placeholder="Search by hotel name or email..." 
                            className="pl-12 h-12 bg-white/5 border-white/5 rounded-2xl text-sm font-medium focus:ring-blue-500/20 focus:border-blue-500/40"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2">
                            <Filter className="w-3.5 h-3.5" />
                            Filter
                        </Button>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Property Details</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact Info</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Timeline</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-8">
                                            <div className="h-4 bg-white/5 rounded-full w-3/4 mx-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 rounded-full bg-zinc-500/5">
                                                <Search className="w-8 h-8 text-zinc-700" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No leads found</p>
                                                <p className="text-sm text-zinc-600 font-medium">Try adjusting your search criteria</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm">
                                                    {lead.hotel_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight italic">{lead.hotel_name}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{lead.property_type || 'Hotel'}</span>
                                                        {lead.room_count && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/60">{lead.room_count} Units</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium font-sans">
                                                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                                    {lead.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium font-sans">
                                                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                                                    {lead.phone || 'No phone'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant="outline" className={`font-black uppercase tracking-widest text-[9px] px-3 py-1 ${getStatusColor(lead.status)}`}>
                                                {getStatusIcon(lead.status)}
                                                {lead.status}
                                            </Badge>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                                                <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                                                {format(new Date(lead.created_at), 'MMM dd, yyyy • HH:mm')}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {lead.status !== 'Converted' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="h-8 rounded-lg border-blue-500/20 bg-blue-500/5 text-blue-400 font-black uppercase tracking-widest text-[9px] hover:bg-blue-500 hover:text-white transition-all"
                                                        onClick={() => {
                                                            setSelectedLeadForProvision(lead);
                                                            setIsProvisionModalOpen(true);
                                                        }}
                                                    >
                                                        Verify & Provision
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                                                    <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <AddHotelModal 
                    isOpen={isProvisionModalOpen}
                    onClose={() => setIsProvisionModalOpen(false)}
                    leadId={selectedLeadForProvision?.id}
                    initialData={selectedLeadForProvision ? {
                        name: selectedLeadForProvision.hotel_name,
                        email: selectedLeadForProvision.email
                    } : undefined}
                    onSuccess={() => {
                        fetchLeads();
                        setIsProvisionModalOpen(false);
                    }}
                />

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-white/5">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-6 animate-pulse">
                                <div className="h-4 bg-white/5 rounded-full w-3/4 mb-4" />
                                <div className="h-3 bg-white/5 rounded-full w-1/2" />
                            </div>
                        ))
                    ) : filteredLeads.length === 0 ? (
                        <div className="p-16 text-center">
                            <Search className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">No leads found</p>
                        </div>
                    ) : (
                        filteredLeads.map((lead) => (
                            <div key={lead.id} className="p-6 space-y-4 hover:bg-white/[0.01]">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm">
                                            {lead.hotel_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white uppercase tracking-tight">{lead.hotel_name}</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Trial Applicant</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 -mr-2">
                                        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium font-sans">
                                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                        {lead.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium font-sans">
                                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                                        {lead.phone || 'No phone'}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <Badge variant="outline" className={`font-black uppercase tracking-widest text-[8px] px-2 py-0.5 ${getStatusColor(lead.status)}`}>
                                        {getStatusIcon(lead.status)}
                                        {lead.status}
                                    </Badge>
                                    <div className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">
                                        {format(new Date(lead.created_at), 'dd MMM, yy • HH:mm')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
