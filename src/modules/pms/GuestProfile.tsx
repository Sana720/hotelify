"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    User, 
    Calendar, 
    TrendingUp, 
    History, 
    X, 
    Loader2, 
    Hotel,
    Heart,
    Star,
    Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/components/providers/TenantProvider";

interface GuestProfileProps {
    guest: any;
    onClose: () => void;
}

export function GuestProfile({ guest, onClose }: GuestProfileProps) {
    const { tenant } = useTenant();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStays: 0,
        totalSpend: 0,
        avgStayLength: 0
    });

    useEffect(() => {
        if (!tenant || !guest) return;

        async function fetchHistory() {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('*, rooms(room_number)')
                .eq('org_id', tenant!.id)
                .eq('phone', guest.phone)
                .order('check_in', { ascending: false });

            if (data) {
                setHistory(data);
                
                const totalSpend = data.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
                const totalStays = data.length;
                
                setStats({
                    totalStays,
                    totalSpend,
                    avgStayLength: 0 // Could calculate this if needed
                });
            }
            setLoading(false);
        }

        fetchHistory();
    }, [guest, tenant]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <Card className="w-full max-w-3xl glass-premium border-white/10 bg-[#0a0a0c]/90 backdrop-blur-3xl text-white rounded-[3rem] overflow-hidden shadow-2xl">
                <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 relative">
                        <div className="w-24 h-24 rounded-3xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            <User className="w-12 h-12 text-indigo-400" />
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <CardTitle className="text-4xl font-black tracking-tighter italic uppercase">{guest.name}</CardTitle>
                                {stats.totalStays > 5 && (
                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest gap-1">
                                        <Crown className="w-3 h-3" />
                                        VIP Member
                                    </Badge>
                                )}
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Guest Profile & Operational History</p>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="absolute -top-4 -right-4 rounded-full hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="grid grid-cols-3 border-b border-white/5 bg-black/20">
                        <div className="p-8 text-center border-r border-white/5">
                            <div className="flex items-center justify-center gap-2 mb-2 text-zinc-500">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Total Stays</span>
                            </div>
                            <p className="text-2xl font-black text-white">{stats.totalStays}</p>
                        </div>
                        <div className="p-8 text-center border-r border-white/5">
                            <div className="flex items-center justify-center gap-2 mb-2 text-zinc-500">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Lifetime Value</span>
                            </div>
                            <p className="text-2xl font-black text-white">₹{stats.totalSpend.toLocaleString()}</p>
                        </div>
                        <div className="p-8 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2 text-zinc-500">
                                <Heart className="w-3.5 h-3.5 text-pink-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Loyalty Score</span>
                            </div>
                            <p className="text-2xl font-black text-white">{Math.min(100, stats.totalStays * 15)}%</p>
                        </div>
                    </div>

                    <div className="p-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <History className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Residency Timeline</h3>
                        </div>

                        <div className="max-h-[30vh] overflow-y-auto custom-scrollbar pr-4 space-y-4">
                            {loading ? (
                                <div className="py-12 flex flex-col items-center gap-4 text-zinc-600 font-black uppercase tracking-widest text-[9px]">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                    Synchronizing Timeline...
                                </div>
                            ) : history.length === 0 ? (
                                <div className="py-12 text-center text-zinc-700 font-bold uppercase tracking-widest text-[9px] italic border border-dashed border-white/5 rounded-[2rem]">
                                    No historical stays recorded.
                                </div>
                            ) : (
                                history.map((stay, i) => (
                                    <motion.div 
                                        key={stay.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group/stay"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover/stay:bg-indigo-500/10 transition-colors">
                                                <Hotel className="w-5 h-5 text-zinc-500 group-hover/stay:text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-white/90">Room {stay.rooms?.room_number || stay.room_id.slice(0, 4)}</span>
                                                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0">
                                                        {stay.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] font-bold text-zinc-600 mt-0.5">
                                                    {new Date(stay.check_in).toLocaleDateString()} - {new Date(stay.check_out).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white/90">₹{Number(stay.total_price).toLocaleString()}</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Settled Amount</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-10 pt-0">
                        <Button 
                            onClick={onClose}
                            className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl"
                        >
                            Return to Registry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
