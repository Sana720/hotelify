"use client";

import { useState } from "react";
import { BookingList } from "@/modules/pms/BookingList";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NewBookingDialog } from "@/modules/pms/NewBookingDialog";

export default function BookingsPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white uppercase">Reservations</h1>
                    <p className="text-zinc-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Managing the guest journey from check-in to check-out.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="glass-premium border-white/5 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px]">
                        <Filter className="w-4 h-4" />
                        Intelligence Filter
                    </Button>

                    <NewBookingDialog 
                        onSuccess={() => setRefreshKey(prev => prev + 1)}
                        trigger={
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 transition-all">
                                <Plus className="w-4 h-4" />
                                New Reservation
                            </Button>
                        }
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input
                        placeholder="Search by identity, suite, or digital signature..."
                        className="pl-14 h-14 glass-premium border-white/5 rounded-2xl focus:ring-indigo-500/20 font-bold bg-white/[0.02]"
                    />
                </div>
            </div>

            <BookingList key={refreshKey} />
        </div>
    );
}
