import Link from 'next/link';
import { Zap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-background pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-blue-400 fill-blue-400/20" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Hotel<span className="text-blue-400">ify</span></span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            Empowering hoteliers with next-gen property management solutions. Scale your business with unmatched precision and ease.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Github className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Product</h4>
                        <ul className="space-y-4">
                            <FooterLink href="#features">Features</FooterLink>
                            <FooterLink href="#pms">PMS</FooterLink>
                            <FooterLink href="#housekeeping">Housekeeping</FooterLink>
                            <FooterLink href="#pricing">Pricing</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Company</h4>
                        <ul className="space-y-4">
                            <FooterLink href="#">About Us</FooterLink>
                            <FooterLink href="#">Blog</FooterLink>
                            <FooterLink href="#">Careers</FooterLink>
                            <FooterLink href="#">Contact</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Stay Updated</h4>
                        <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for the latest updates.</p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-blue-500/50"
                            />
                            <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 transition-colors">
                                <Mail className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Hotelify. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-muted-foreground hover:text-blue-400 transition-colors text-sm">
                {children}
            </Link>
        </li>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-blue-400 hover:border-blue-500/30 transition-all"
        >
            {icon}
        </Link>
    );
}
