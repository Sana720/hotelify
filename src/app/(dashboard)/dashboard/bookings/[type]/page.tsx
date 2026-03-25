"use client";

import { use } from "react";
import { BookingList } from "@/modules/pms/BookingList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CalendarDays, UserCheck, UserMinus, History, BellRing, CalendarRange, CalendarFold } from "lucide-react";
import Link from "next/link";

const configMap: Record<string, { title: string; icon: any; color: string }> = {
    requests: { title: "Booking Requests", icon: BellRing, color: "text-blue-400" },
    today: { title: "Today's Schedule", icon: CalendarDays, color: "text-indigo-400" },
    checkin: { title: "Today's Check-ins", icon: UserCheck, color: "text-emerald-400" },
    pending: { title: "Pending Arrivals", icon: History, color: "text-amber-400" },
    checkout: { title: "Today's Check-outs", icon: UserMinus, color: "text-red-400" },
    delayed: { title: "Delayed Check-outs", icon: Clock, color: "text-rose-500" },
    "upcoming-in": { title: "Upcoming Arrivals", icon: CalendarRange, color: "text-purple-400" },
    "upcoming-out": { title: "Upcoming Departures", icon: CalendarFold, color: "text-blue-500" },
};

export default function BookingFilterPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = use(params);
    const config = configMap[type] || { title: "Filtered Reservations", icon: Clock, color: "text-zinc-400" };
    const Icon = config.icon;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-3">
                    <Link href="/dashboard/bookings" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group">
                        <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
                            <ArrowLeft className="w-3 h-3" />
                        </div>
                        Back to Overview
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-3xl bg-white/[0.03] border border-white/5 shadow-2xl ${config.color.replace('text-', 'shadow-').replace('400', '500/10').replace('500', '500/10')}`}>
                            <Icon className={`w-8 h-8 ${config.color}`} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">{config.title}</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mt-2 italic flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                Real-time filtered intelligence
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <BookingList filterType={type} />
            </div>
        </div>
    );
}
