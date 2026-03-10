"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Mail, CreditCard, Hotel, Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const bookings = [
    {
        id: "BK-1001",
        room: "101",
        guest: "John Doe",
        email: "john@example.com",
        checkIn: "2026-03-05",
        checkOut: "2026-03-08",
        status: "confirmed",
        price: 897,
    },
    {
        id: "BK-1002",
        room: "204",
        guest: "Alice Smith",
        email: "alice@example.com",
        checkIn: "2026-03-04",
        checkOut: "2026-03-06",
        status: "checked_in",
        price: 450,
    },
    {
        id: "BK-1003",
        room: "105",
        guest: "Bob Wilson",
        email: "bob@example.com",
        checkIn: "2026-03-01",
        checkOut: "2026-03-03",
        status: "checked_out",
        price: 398,
    },
];

const statusConfig = {
    confirmed: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]", icon: <Clock className="w-3 h-3" />, label: "Confirmed" },
    checked_in: { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]", icon: <CheckCircle2 className="w-3 h-3" />, label: "Checked In" },
    checked_out: { color: "bg-white/10 text-white/60 border-white/20", icon: <Calendar className="w-3 h-3" />, label: "Checked Out" },
    cancelled: { color: "bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]", icon: <XCircle className="w-3 h-3" />, label: "Cancelled" },
};

export function BookingList() {
    return (
        <div className="space-y-4">
            {bookings.map((booking, index) => (
                <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="glass-premium border-white/10 group hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden border">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row items-stretch">
                                <div className="p-6 md:w-64 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center bg-black/20 group-hover:bg-indigo-500/5 transition-colors duration-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hotel className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                                        <span className="text-sm font-semibold uppercase tracking-wider text-white/50">Room {booking.room}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white/90 group-hover:text-white transition-colors">{booking.guest}</div>
                                    <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                                        <Mail className="w-3 h-3" />
                                        {booking.email}
                                    </div>
                                </div>

                                <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Dates
                                        </p>
                                        <div className="text-sm font-medium text-white/80">
                                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" /> Payment
                                        </p>
                                        <div className="text-sm font-medium text-white/80">${booking.price.toLocaleString()} Total</div>
                                    </div>

                                    <div className="flex flex-col justify-center items-start lg:items-end gap-2">
                                        <Badge variant="outline" className={`gap-1 px-3 py-1 ${statusConfig[booking.status as keyof typeof statusConfig].color}`}>
                                            {statusConfig[booking.status as keyof typeof statusConfig].icon}
                                            {statusConfig[booking.status as keyof typeof statusConfig].label}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-4 md:p-6 border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/10 text-white/70 hover:text-white">
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
