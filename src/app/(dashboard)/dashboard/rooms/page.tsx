"use client";

import { RoomGrid } from "@/modules/pms/RoomGrid";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

export default function RoomsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Room Inventory</h1>
                    <p className="text-muted-foreground mt-1">Live status of all rooms across your property.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="glass gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button className="rounded-full gap-2">
                        <Plus className="w-4 h-4" />
                        Add Room
                    </Button>
                </div>
            </div>

            <RoomGrid />
        </div>
    );
}
