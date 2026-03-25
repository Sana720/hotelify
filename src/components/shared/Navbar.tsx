import Link from 'next/link';
import { Hotel, Menu } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                        <Hotel className="w-8 h-8 text-blue-400" />
                        <span className="text-xl font-bold tracking-tight">Hotelify</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-sm font-medium hover:text-blue-400 transition-colors">Features</Link>
                        <Link href="#pricing" className="text-sm font-medium hover:text-blue-400 transition-colors">Pricing</Link>
                        <Link href="#about" className="text-sm font-medium hover:text-blue-400 transition-colors">About</Link>
                        <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign In</Link>
                        <Link
                            href="/signup"
                            className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                        >
                            Get Started
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <Menu className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
