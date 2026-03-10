"use client";

import { motion } from "framer-motion";
import { Hotel } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col relative overflow-hidden selection:bg-blue-500/30">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="p-8 lg:p-12 relative z-10">
                <Link href="/" className="flex items-center gap-3 group w-fit">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Hotel className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-gradient-premium">Hotelify</span>
                </Link>
            </header>

            {/* Content Area */}
            <main className="flex-grow flex items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    {children}
                </motion.div>
            </main>

            {/* Footer / Legal */}
            <footer className="p-8 text-center text-zinc-600 text-xs font-medium relative z-10">
                &copy; {new Date().getFullYear()} Hotelify Technologies Inc. All rights reserved.
            </footer>
        </div>
    );
}
