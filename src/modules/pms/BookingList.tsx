"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, CreditCard, Hotel, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";
import { GuestFolio } from "./GuestFolio";
import { toast } from "sonner";

interface Booking {
    id: string;
    guest_name: string;
    guest_email: string;
    check_in: string;
    check_out: string;
    status: string;
    total_price: number;
    advance_amount: number;
    room_number?: string;
    folios?: { status: string }[];
}

const statusConfig = {
    confirmed: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <Clock className="w-3 h-3" />, label: "Confirmed" },
    checked_in: { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" />, label: "Checked In" },
    checked_out: { color: "bg-white/10 text-white/60 border-white/20", icon: <Calendar className="w-3 h-3" />, label: "Checked Out" },
    cancelled: { color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <XCircle className="w-3 h-3" />, label: "Cancelled" },
};

export function BookingList({ filterType }: { filterType?: string }) {
    const { tenant, isLoading: tenantLoading } = useTenant();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<{ id: string, name: string } | null>(null);

    const handleCheckIn = async (bookingId: string, booking: any) => {
        if (!tenant) return;
        setLoading(true);

        const { error: bookingError } = await supabase
            .from('bookings')
            .update({ status: 'checked_in' })
            .eq('id', bookingId);

        if (!bookingError) {
            await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('room_number', booking.room_number)
                .eq('org_id', tenant.id);

            await fetchBookings();
        } else {
            toast.error(`Check-in failed: ${bookingError.message}`);
        }
        setLoading(false);
    };

    const handleCheckOut = async (bookingId: string, booking: any) => {
        if (!tenant) return;
        // If they have a folio, let the folio status dictate if they are settled.
        // If they don't have a folio, fallback to checking if advance covered total price.
        const hasFolio = booking.folios && booking.folios.length > 0;
        const isFolioOpen = hasFolio && booking.folios[0].status !== 'closed';
        const simpleDue = (booking.total_price || 0) - (booking.advance_amount || 0);

        const isBlocked = hasFolio ? isFolioOpen : simpleDue > 0;

        if (isBlocked) {
            toast.error("Unsettled Folio: Please clear the outstanding balance and close the statement before checkout.");
            setSelectedBooking({ id: booking.id, name: booking.guest_name });
            return;
        }

        setLoading(true);
        const { error: bookingError } = await supabase
            .from('bookings')
            .update({ status: 'checked_out' })
            .eq('id', bookingId);

        if (!bookingError) {
            await supabase
                .from('rooms')
                .update({ status: 'dirty' })
                .eq('room_number', booking.room_number)
                .eq('org_id', tenant.id);

            await fetchBookings();
        } else {
            toast.error(`Checkout failed: ${bookingError.message}`);
        }
        setLoading(false);
    };

    const fetchBookings = async () => {
        if (!tenant) return;
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        let query = supabase
            .from('bookings')
            .select('*, rooms (room_number), folios (status)')
            .eq('org_id', tenant.id);

        if (filterType === 'requests') {
            query = query.in('status', ['confirmed', 'pending']).gte('check_in', today);
        } else if (filterType === 'today') {
            query = query.or(`check_in.eq.${today},check_out.eq.${today}`);
        } else if (filterType === 'checkin') {
            query = query.eq('check_in', today).eq('status', 'confirmed');
        } else if (filterType === 'pending') {
            query = query.lt('check_in', today).eq('status', 'confirmed');
        } else if (filterType === 'checkout') {
            query = query.eq('check_out', today).eq('status', 'checked_in');
        } else if (filterType === 'delayed') {
            query = query.lt('check_out', today).eq('status', 'checked_in');
        } else if (filterType === 'upcoming-in') {
            query = query.gt('check_in', today).eq('status', 'confirmed');
        } else if (filterType === 'upcoming-out') {
            query = query.gt('check_out', today).eq('status', 'checked_in');
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (data) {
            setBookings(data.map((b: any) => ({
                ...b,
                room_number: b.rooms?.room_number || "N/A"
            })));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, [tenant, filterType]);

    if (tenantLoading || loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground uppercase tracking-[0.2em] text-xs font-black">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                Retrieving Reservations...
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 glass-premium rounded-[3rem] border border-white/5 text-muted-foreground">
                <p className="font-bold">No active bookings found.</p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-2xl font-bold">New Reservation</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {selectedBooking && (
                    <GuestFolio
                        bookingId={selectedBooking.id}
                        guestName={selectedBooking.name}
                        onClose={() => {
                            setSelectedBooking(null);
                            // Soft refresh bookings to reflect new folio status without reloading the entire page
                            fetchBookings(); 
                        }}
                    />
                )}
            </AnimatePresence>

            {bookings.map((booking, index) => (
                <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="glass-premium border-white/10 group hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 cursor-pointer overflow-hidden border rounded-[2rem]">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row items-stretch">
                                <div className="p-8 md:w-72 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center bg-black/20 group-hover:bg-indigo-500/5 transition-colors duration-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hotel className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Room {booking.room_number}</span>
                                    </div>
                                    <div className="text-2xl font-black text-white/90 group-hover:text-white transition-colors tracking-tight">{booking.guest_name}</div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 mt-2">
                                        <Mail className="w-3 h-3" />
                                        {booking.guest_email}
                                    </div>
                                </div>

                                <div className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-indigo-400" /> Stay Dates
                                        </p>
                                        <div className="text-sm font-bold text-white/80">
                                            {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-black flex items-center gap-2">
                                                <CreditCard className="w-3 h-3 text-emerald-400" /> Folio Summary
                                            </p>
                                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                <span className="text-[10px] text-white/40 font-bold">Total Tariff</span>
                                                <span className="text-sm font-black text-white/80">₹{booking.total_price?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-end mt-1">
                                                <span className="text-[10px] text-white/40 font-bold">Advance Paid</span>
                                                <span className="text-sm font-black text-emerald-400">₹{booking.advance_amount?.toLocaleString() || '0'}</span>
                                            </div>
                                        </div>
                                        
                                        {booking.folios?.[0]?.status === 'closed' ? (
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Digital Invoice</span>
                                                <span className="text-[11px] font-black text-white leading-none uppercase tracking-tighter bg-emerald-500/20 px-2 py-1 rounded-md">
                                                    Paid & Settled
                                                </span>
                                            </div>
                                        ) : ((booking.total_price || 0) - (booking.advance_amount || 0)) > 0 && (
                                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex justify-between items-center animate-pulse">
                                                <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">Balance Due</span>
                                                <span className="text-base font-black text-white leading-none">
                                                    ₹{((booking.total_price || 0) - (booking.advance_amount || 0)).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-center items-start lg:items-end">
                                        <Badge variant="outline" className={`gap-2 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest ${statusConfig[booking.status as keyof typeof statusConfig]?.color || ""}`}>
                                            {statusConfig[booking.status as keyof typeof statusConfig]?.icon}
                                            {statusConfig[booking.status as keyof typeof statusConfig]?.label || booking.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-white/5 flex flex-col gap-3 items-center justify-center">
                                    {booking.status === 'confirmed' && (
                                        <Button
                                            onClick={() => handleCheckIn(booking.id, booking)}
                                            className="w-32 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px]"
                                        >
                                            Check In
                                        </Button>
                                    )}
                                    {booking.status === 'checked_in' && (
                                        <Button
                                            onClick={() => handleCheckOut(booking.id, booking)}
                                            className="w-32 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px]"
                                        >
                                            Check Out
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedBooking({ id: booking.id, name: booking.guest_name })}
                                        className="w-32 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 text-white/50 hover:text-white"
                                    >
                                        View Bill
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
