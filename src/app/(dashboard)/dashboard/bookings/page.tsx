"use client";

import { BookingList } from "@/modules/pms/BookingList";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BookingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-muted-foreground mt-1">Manage reservations, check-ins, and guest folios.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="glass gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button className="rounded-full gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <Plus className="w-4 h-4" />
                        New Booking
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by guest name, room, or email..."
                        className="pl-10 glass focus:ring-blue-500/50"
                    />
                </div>
            </div>

            <BookingList />
        </div>
    );
}
