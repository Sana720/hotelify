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

interface Booking {
    id: string;
    guest_name: string;
    guest_email: string;
    check_in: string;
    check_out: string;
    status: string;
    total_price: number;
    room_number?: string;
}

const statusConfig = {
    confirmed: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <Clock className="w-3 h-3" />, label: "Confirmed" },
    checked_in: { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" />, label: "Checked In" },
    checked_out: { color: "bg-white/10 text-white/60 border-white/20", icon: <Calendar className="w-3 h-3" />, label: "Checked Out" },
    cancelled: { color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <XCircle className="w-3 h-3" />, label: "Cancelled" },
};

export function BookingList() {
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

            // Re-fetch bookings
            const { data } = await supabase
                .from('bookings')
                .select('*, rooms (room_number)')
                .eq('org_id', tenant.id)
                .order('check_in', { ascending: false });

            if (data) {
                setBookings(data.map((b: any) => ({
                    ...b,
                    room_number: b.rooms?.room_number || "N/A"
                })));
            }
        }
        setLoading(false);
    };

    const handleCheckOut = async (bookingId: string, booking: any) => {
        if (!tenant) return;
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

            // Re-fetch bookings
            const { data } = await supabase
                .from('bookings')
                .select('*, rooms (room_number)')
                .eq('org_id', tenant.id)
                .order('check_in', { ascending: false });

            if (data) {
                setBookings(data.map((b: any) => ({
                    ...b,
                    room_number: b.rooms?.room_number || "N/A"
                })));
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!tenant) return;

        async function fetchBookings() {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('*, rooms (room_number)')
                .eq('org_id', tenant?.id)
                .order('check_in', { ascending: false });

            if (data) {
                setBookings(data.map((b: any) => ({
                    ...b,
                    room_number: b.rooms?.room_number || "N/A"
                })));
            }
            setLoading(false);
        }

        fetchBookings();
    }, [tenant]);

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
                        onClose={() => setSelectedBooking(null)}
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

                                    <div className="space-y-2">
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                            <CreditCard className="w-3 h-3 text-emerald-400" /> Total Folio
                                        </p>
                                        <div className="text-sm font-bold text-white/80">${booking.total_price?.toLocaleString()}</div>
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
                                        View Folio
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
