"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Hammer, CheckCircle2, Moon, WashingMachine } from "lucide-react";
import { motion } from "framer-motion";

const rooms = [
    { id: "101", status: "available", type: "Deluxe King", price: 299 },
    { id: "102", status: "occupied", type: "Standard Queen", price: 199 },
    { id: "103", status: "dirty", type: "Suite", price: 450 },
    { id: "104", status: "cleaning", type: "Deluxe King", price: 299 },
    { id: "105", status: "maintenance", type: "Standard Queen", price: 199 },
    { id: "106", status: "available", type: "Suite", price: 450 },
];

const statusConfig = {
    available: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" />, label: "Available" },
    occupied: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Moon className="w-3 h-3" />, label: "Occupied" },
    dirty: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <Sparkles className="w-3 h-3" />, label: "Needs Cleaning" },
    cleaning: { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: <WashingMachine className="w-3 h-3 text-purple-400 animate-pulse" />, label: "Cleaning" },
    maintenance: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: <Hammer className="w-3 h-3" />, label: "Maintenance" },
};

export function RoomGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room, index) => (
                <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Card className="glass group hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden border">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-2xl font-bold">Room {room.id}</span>
                                    <p className="text-xs text-muted-foreground">{room.type}</p>
                                </div>
                                <Badge variant="outline" className={`gap-1 px-2 ${statusConfig[room.status as keyof typeof statusConfig].color}`}>
                                    {statusConfig[room.status as keyof typeof statusConfig].icon}
                                    {statusConfig[room.status as keyof typeof statusConfig].label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">${room.price}/night</span>
                                <Button size="sm" variant="ghost" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
