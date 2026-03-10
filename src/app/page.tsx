"use client";

import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Image from 'next/image';
import {
  ArrowRight, Shield, Zap, History, Users,
  BarChart3, Brush, WashingMachine, CheckCircle2,
  Star, Plus, Minus, ChevronDown, Check, MousePointer2
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Immersive Background Blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Content */}
            <div className="text-left max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-fade-in whitespace-nowrap">
                <Zap className="w-3.5 h-3.5 fill-blue-400/20" />
                Hotel Management Redefined for <span className="text-white font-bold ml-1">Hotelify</span>
              </div>
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter mb-8 leading-[0.95] text-glow">
                Elevate your <br />
                <span className="text-gradient-premium">hospitality experience</span>.
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-12 leading-relaxed max-w-xl">
                The industry's most advanced PMS, designed for elite hotels. Real-time sync, automated housekeeping, and premium guest services in one unified platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <button className="w-full sm:w-auto px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-all primary-glow flex items-center justify-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-full sm:w-auto px-10 py-5 glass-premium rounded-2xl font-bold hover:bg-white/10 transition-all border-white/20">
                  Book a Demo
                </button>
              </div>

              {/* Trust Badge */}
              <div className="mt-12 flex items-center gap-4 text-sm text-muted-foreground opacity-60">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                    </div>
                  ))}
                </div>
                <p>Trusted by <span className="text-foreground font-bold font-sans">500+</span> luxury hotels</p>
              </div>
            </div>

            {/* Right Column: Image / Dashboard Preview */}
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-emerald-500/50 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-500" />

              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/20 bg-black/40 backdrop-blur-3xl shadow-2xl animate-fade-in-up">
                {/* macOS Window Title Bar */}
                <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-5 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/20">hotelify.dashboard.v2</span>
                  </div>
                </div>

                <div className="p-1 sm:p-1.5 bg-gradient-to-b from-white/5 to-transparent">
                  <Image
                    src="/images/landing/hero-pms.png"
                    alt="Hotelify PMS Dashboard Preview"
                    width={1000}
                    height={700}
                    className="rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
                    priority
                  />
                </div>
              </div>

              {/* Floating Elements with Enhanced Glassmorphism */}
              <div className="absolute -top-8 -right-8 hidden xl:block animate-bounce-slow">
                <div className="glass-premium p-4 rounded-3xl border border-emerald-500/30 flex items-center gap-4 shadow-xl">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5 whitespace-nowrap">Real-time status</div>
                    <div className="text-sm font-bold">Room 402 Cleaned</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-8 hidden xl:block animate-pulse-slow" style={{ animationDelay: '1s' }}>
                <div className="glass-premium p-4 rounded-3xl border border-blue-500/30 flex items-center gap-4 shadow-xl">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5 whitespace-nowrap">Revenue</div>
                    <div className="text-sm font-bold">+12% vs last month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem value="500+" label="Global Hotels" />
            <StatItem value="1.2M" label="Annual Bookings" />
            <StatItem value="99.9%" label="Uptime SLA" />
            <StatItem value="24/7" label="Elite Support" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Powerful Core Features</h2>
            <p className="text-muted-foreground">Built for performance, scalability, and security.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-blue-400" />}
              title="Enterprise Security"
              description="Bank-grade multi-tenancy with RBAC and secure custom domain orchestration."
            />
            <FeatureCard
              icon={<History className="w-6 h-6 text-emerald-400" />}
              title="Real-time PMS"
              description="Live room status, booking collisions prevention, and instant check-in workflows."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-purple-400" />}
              title="Staff Excellence"
              description="QR-based attendance and granular role management for elite service teams."
            />
          </div>
        </div>
      </section>

      {/* Detailed Modules: PMS, Housekeeping, Laundry, Staff */}
      <section className="py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Module 1: Core PMS & Booking (Image Right) */}
          <div className="grid lg:grid-cols-2 gap-32 items-center mb-48">
            <div className="space-y-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <History className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-4xl font-bold text-glow">Core PMS & Booking</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Centralized reservation management with integrated real-time room availability and guest profiling.
              </p>
              <ul className="space-y-4">
                <ListItem text="Intelligent booking collision prevention" />
                <ListItem text="Multi-channel reservation synchronization" />
                <ListItem text="Comprehensive guest history and preferences" />
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-[3rem]"></div>
              <Image
                src="/images/landing/pms_booking_feature.png"
                alt="Core PMS & Booking"
                width={800}
                height={800}
                className="relative rounded-[2.5rem] border border-white/10 shadow-2xl glass-premium"
              />
            </div>
          </div>

          {/* Module 2: Housekeeping (Image Left) */}
          <div className="grid lg:grid-cols-2 gap-32 items-center mb-48">
            <div className="relative order-1 lg:order-1">
              <div className="absolute -inset-4 bg-purple-500/10 blur-2xl rounded-[3rem]"></div>
              <Image
                src="/images/landing/housekeeping.png"
                alt="Smart Housekeeping"
                width={800}
                height={800}
                className="relative rounded-[2.5rem] border border-white/10 shadow-2xl glass-premium"
              />
            </div>

            <div className="space-y-8 order-2 lg:order-2">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Brush className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-4xl font-bold text-glow">Smart Housekeeping</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Empower your cleaning staff with real-time room status updates and mobile-ready task lists.
              </p>
              <ul className="space-y-4">
                <ListItem text="Instant status sync with reception" />
                <ListItem text="Mobile-first staff dashboard" />
                <ListItem text="Cleaning duration analytics" />
              </ul>
            </div>
          </div>

          {/* Module 3: Cloud Laundry (Image Right) */}
          <div className="grid lg:grid-cols-2 gap-32 items-center mb-48">
            <div className="space-y-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <WashingMachine className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-4xl font-bold text-glow">Cloud Laundry</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Manage in-house and guest laundry with a dual-mode system designed for efficiency.
              </p>
              <ul className="space-y-4">
                <ListItem text="Guest billing automation" />
                <ListItem text="Linen inventory tracking" />
                <ListItem text="Vendor management portal" />
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-[3rem]"></div>
              <Image
                src="/images/landing/laundry.png"
                alt="Cloud Laundry"
                width={800}
                height={800}
                className="relative rounded-[2.5rem] border border-white/10 shadow-2xl glass-premium"
              />
            </div>
          </div>

          {/* Module 4: Staff Excellence (Image Left) */}
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <div className="relative order-1 lg:order-1">
              <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-[3rem]"></div>
              <Image
                src="/images/landing/staff_management_feature.png"
                alt="Staff Excellence"
                width={800}
                height={800}
                className="relative rounded-[2.5rem] border border-white/10 shadow-2xl glass-premium"
              />
            </div>

            <div className="space-y-8 order-2 lg:order-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-4xl font-bold text-glow">Staff Excellence</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Advanced staff orchestration with QR-based attendance and granular role management.
              </p>
              <ul className="space-y-4">
                <ListItem text="Secure QR-based attendance tracking" />
                <ListItem text="Granular RBAC for all hotel roles" />
                <ListItem text="Real-time performance metrics" />
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Trusted by Leaders</h2>
            <p className="text-muted-foreground">What hoteliers around the globe are saying.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Jenkins"
              role="GM at Azure Boutique"
              content="The real-time sync between PMS and Housekeeping has cut our turnover time by 40%. Absolutely game-changing."
            />
            <TestimonialCard
              name="David Chen"
              role="Owner, Chen Hospitality"
              content="The laundry module is the most intuitive I've used. Finally, a platform that understands hotel operations deeply."
            />
            <TestimonialCard
              name="Marcus Thorne"
              role="Director of Ops, Grand Plaza"
              content="Switching to this SaaS was the best decision for our scalability. The security features are top-notch."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Choose the plan that scales with your growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              tier="Starter"
              price="$49"
              features={['Up to 20 Rooms', 'Basic PMS', 'Housekeeping', 'Email Support']}
            />
            <PricingCard
              tier="Professional"
              price="$129"
              highlights
              features={['Up to 100 Rooms', 'Full PMS & Laundry', 'QR Attendance', 'Priority Support']}
            />
            <PricingCard
              tier="Enterprise"
              price="Custom"
              features={['Unlimited Rooms', 'Custom Domains', 'Dedicated Manager', 'API Access']}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            <FAQItem
              question="How easy is the setup process?"
              answer="Our onboarding team helps you go live in less than 48 hours. Most data can be imported instantly from CSV."
            />
            <FAQItem
              question="Can I manage multiple properties?"
              answer="Yes! Our Enterprise plan is built for multi-property orchestration with centralized reporting."
            />
            <FAQItem
              question="Is my data secure?"
              answer="We use bank-grade AES-256 encryption and follow strict multi-tenancy isolation protocols."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-extrabold text-blue-400 mb-2">{value}</div>
      <div className="text-muted-foreground text-sm uppercase tracking-widest">{label}</div>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-muted-foreground">
      <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl glass hover:border-blue-500/40 transition-all hover:-translate-y-1 group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function TestimonialCard({ name, role, content }: { name: string, role: string, content: string }) {
  return (
    <div className="p-8 rounded-3xl glass-premium italic text-muted-foreground relative">
      <Star className="w-6 h-6 text-yellow-500/40 absolute top-8 right-8" />
      <p className="mb-8 leading-relaxed">"{content}"</p>
      <div className="not-italic flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30" />
        <div>
          <div className="text-foreground font-bold">{name}</div>
          <div className="text-xs uppercase tracking-wider opacity-60">{role}</div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ tier, price, features, highlights = false }: { tier: string, price: string, features: string[], highlights?: boolean }) {
  return (
    <div className={`p-8 rounded-[2.5rem] transition-all ${highlights ? 'glass border-blue-500/50 scale-105 shadow-[0_0_50px_-15px_rgba(59,130,246,0.5)]' : 'glass-premium'}`}>
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">{tier}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black">{price}</span>
          {price !== 'Custom' && <span className="text-muted-foreground">/mo</span>}
        </div>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <Check className="w-4 h-4 text-blue-400" />
            {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-4 rounded-xl font-bold transition-all ${highlights ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>
        Get Started
      </button>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-2xl glass-premium overflow-hidden border border-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/2 transition-colors"
      >
        <span className="font-bold">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
          {answer}
        </div>
      )}
    </div>
  );
}

