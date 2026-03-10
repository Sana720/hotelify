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
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
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
