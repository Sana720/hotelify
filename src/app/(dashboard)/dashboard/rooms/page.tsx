"use client";

import { RoomManager } from "./room-manager";
import { Home, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RoomsPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Room <span className="text-blue-500">Inventory</span></h1>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <Home className="w-3 h-3" />
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-zinc-300">Inventory</span>
                </div>
            </div>

            <div className="glass-premium border-white/10 p-10 rounded-[3rem] bg-white/[0.01]">
                <RoomManager />
            </div>
        </div>
    );
}
