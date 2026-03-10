"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Plus, CreditCard, Printer, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/components/providers/TenantProvider";

interface FolioItem {
    id: string;
    description: string;
    amount: number;
    type: 'accommodation' | 'service' | 'tax' | 'adjustment';
    created_at: string;
}

interface Folio {
    id: string;
    status: 'open' | 'closed' | 'void';
    total_amount: number;
    items: FolioItem[];
}

interface GuestFolioProps {
    bookingId: string;
    guestName: string;
    onClose: () => void;
}

export function GuestFolio({ bookingId, guestName, onClose }: GuestFolioProps) {
    const { tenant } = useTenant();
    const [folio, setFolio] = useState<Folio | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenant || !bookingId) return;

        async function fetchFolio() {
            setLoading(true);
            // 1. Get or Create Folio
            let { data: folioData, error: folioError } = await supabase
                .from('folios')
                .select('*')
                .eq('booking_id', bookingId)
                .single();

            if (!folioData && !folioError) {
                // Create folio if it doesn't exist
                const { data: newFolio, error: createError } = await supabase
                    .from('folios')
                    .insert([{ org_id: tenant?.id, booking_id: bookingId, status: 'open' }])
                    .select()
                    .single();
                folioData = newFolio;
            }

            if (folioData) {
                // 2. Get Folio Items
                const { data: itemsData } = await supabase
                    .from('folio_items')
                    .select('*')
                    .eq('folio_id', folioData.id)
                    .order('created_at', { ascending: true });

                setFolio({
                    ...folioData,
                    items: itemsData || []
                });
            }
            setLoading(false);
        }

        fetchFolio();
    }, [bookingId, tenant]);

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Calculating Folio...
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <Card className="w-full max-w-2xl glass-premium border-white/10 bg-[#0a0a0c]/90 backdrop-blur-3xl text-white rounded-[3rem] overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.02]">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <Receipt className="w-6 h-6 text-blue-400" />
                                Guest Folio
                            </CardTitle>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{guestName} • Booking Reference</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="max-h-[60vh] overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {folio?.items.length === 0 ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
                                        <Plus className="w-5 h-5 text-zinc-600" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No charges posted yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {folio?.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-blue-500/30 transition-all">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-white/90">{item.description}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.type}</p>
                                            </div>
                                            <div className="text-sm font-black text-white">
                                                ₹{item.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-blue-600/5 border-t border-white/5 space-y-6">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Outstanding Balance</p>
                                    <h2 className="text-4xl font-black tracking-tighter text-white">₹{folio?.total_amount.toLocaleString() || '0'}</h2>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                                    {folio?.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <Button className="h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-[10px] gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Settle Folio
                                </Button>
                                <Button variant="outline" className="h-14 rounded-2xl glass-premium border-white/5 font-black uppercase tracking-widest text-[10px] gap-2">
                                    <Plus className="w-4 h-4" />
                                    Post Charge
                                </Button>
                                <Button variant="outline" className="h-14 rounded-2xl glass-premium border-white/5 font-black uppercase tracking-widest text-[10px] gap-2">
                                    <Printer className="w-4 h-4" />
                                    Print Bill
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
