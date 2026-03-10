"use client";

import { CleaningDashboard } from "@/modules/cleaning/CleaningDashboard";

export default function CleaningPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Housekeeping</h1>
                <p className="text-muted-foreground mt-1">Manage cleaning schedules and property hygiene standards.</p>
            </div>

            <CleaningDashboard />
        </div>
    );
}
