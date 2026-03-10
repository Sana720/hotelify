"use client";

import { LaundryDashboard } from "@/modules/laundry/LaundryDashboard";

export default function LaundryPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Laundry & Linen</h1>
                <p className="text-muted-foreground mt-1">Control your operational inventory and vendor flows.</p>
            </div>

            <LaundryDashboard />
        </div>
    );
}
