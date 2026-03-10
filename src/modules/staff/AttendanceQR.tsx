"use client";

import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, ShieldCheck } from "lucide-react";

export function AttendanceQR({ orgId }: { orgId: string }) {
    const [token, setToken] = useState(() => btoa(`${orgId}-${Date.now()}-${Math.random()}`).substring(0, 16));
    const [timeLeft, setTimeLeft] = useState(30);

    // Generate a dynamic, time-sensitive token for QR attendance
    const generateToken = useCallback(() => {
        const newToken = btoa(`${orgId}-${Date.now()}-${Math.random()}`).substring(0, 16);
        setToken(newToken);
        setTimeLeft(30);
    }, [orgId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    generateToken();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [generateToken]);

    return (
        <Card className="glass w-full max-w-sm mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Staff Check-in
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-xl">
                    <QRCodeSVG value={token} size={200} level="H" includeMargin />
                </div>

                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                        <RefreshCcw className={`w-3 h-3 ${timeLeft < 5 ? 'animate-spin text-red-400' : ''}`} />
                        Rolling update in {timeLeft}s
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono">
                        SECURE TOKEN: {token}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
