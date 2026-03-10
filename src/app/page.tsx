"use client";

import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Image from 'next/image';
import {
  ArrowRight, Shield, Zap, History, Users,
  BarChart3, Brush, WashingMachine, CheckCircle2,
  Star, Plus, Minus, ChevronDown, Check, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 overflow-x-hidden">
      <div className="noise-overlay" />
      <div className="bg-mesh opacity-30" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Luxury 3D Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/landing/hero-bg-abstract-final.png"
            alt="HD Abstract Luxury Hotel Background"
            fill
            className="object-cover opacity-35"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Left Column: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-10 tracking-[0.2em] uppercase"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Hotelify Now Accepting New Properties
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter mb-6 md:mb-10 leading-[1.1] md:leading-[0.9] text-white"
              >
                Fill Every Room. <br />
                <span className="text-blue-400">Delight Every Guest.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 md:mb-14 leading-relaxed max-w-2xl font-medium"
              >
                The all-in-one management suite for modern hotels. Automate your front desk, coordinate staff, and maximize bookings from a single dashboard.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-6"
              >
                <button className="w-full sm:w-auto px-12 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
                <motion.div
                  className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-3xl backdrop-blur-xl"
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-zinc-800 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20" />
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-wider text-white">Join 500+ Properties</div>
                    <div className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">Trusted by 2,500+ Luxury Stays</div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1 }}
              className="lg:col-span-5 relative mt-12 lg:mt-0"
            >
              <div className="space-y-12 md:space-y-16 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-white/10" />

                <OnboardingStep
                  number="1"
                  tag="Step 1: Front Desk Sync"
                  title="PMS & Bookings"
                  description="Manage bookings and check-ins instantly. Go live in minutes, not days."
                  isActive={activeStep === 0}
                  onHover={() => setActiveStep(0)}
                />
                <OnboardingStep
                  number="2"
                  tag="Step 2: Team Workflow"
                  title="Staff Coordination"
                  description="Housekeeping, staff, and laundry in perfect sync. Eliminate the coordination chaos."
                  isActive={activeStep === 1}
                  onHover={() => setActiveStep(1)}
                />
                <OnboardingStep
                  number="3"
                  tag="Step 3: Revenue Growth"
                  title="Smart Pricing"
                  description="Maximize earnings with AI-driven pricing and automatic room inventory sync."
                  isActive={activeStep === 2}
                  onHover={() => setActiveStep(2)}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-0 lg:divide-x divide-white/10 text-center">
            <StatItem value="2,500+" label="Global Properties" />
            <StatItem value="1.2M+" label="Annual Bookings" />
            <StatItem value="98%" label="Staff Retention" />
            <StatItem value="24/7" label="Elite Support" />
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent relative">
          <div className="absolute inset-0 blur-sm bg-blue-500/10" />
        </div>
      </div>

      {/* Featured Capabilities (Bento) */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-glow mb-6"
            >
              The Strategic <span className="text-gradient-premium">Advantage</span>
            </motion.h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Why Global Property Groups and Boutique Owners Choose Hotelify for Absolute Operational Control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min md:auto-rows-[340px]">
            {/* Advantage 1: Institutional Access */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-2 p-10 rounded-[2.5rem] glass-premium group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-48 h-48 -rotate-12" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Multi-Property <br />Control</h3>
                  <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                    Manage one hotel or a hundred from a single login. Get real-time visibility across your entire portfolio without switching accounts.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Advantage 2: Uncapped Operations */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-10 rounded-[2.5rem] glass group relative overflow-hidden border border-white/5"
            >
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-48 h-48" />
              </div>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tight">Smart Pricing <br />& Revenue</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Automatically adjust your room rates based on local demand. Ensure you never leave money on the table even while you sleep.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Advantage 3: Automated Backend */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-10 rounded-[2.5rem] glass group relative overflow-hidden border border-white/5"
            >
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tight">Frictionless <br />Check-ins</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Give your guests the modern experience they expect. Digital check-ins, mobile keys, and automated guest onboarding in one flow.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Advantage 4: High-Revenue Intelligence */}
            <motion.div
              whileHover={{ y: -5 }}
              className="lg:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05] border border-white/10 group relative overflow-hidden"
            >
              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity hidden lg:block">
                <Users className="w-32 h-32" />
              </div>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <MousePointer2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Operational <br />Analytics</h3>
                  <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                    Understand your room maintenance costs and staff performance. Use real-world data to make smarter decisions for your hotel's growth.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Modules: PMS, Housekeeping, Laundry, Staff */}
      <section className="py-16 md:py-32 lg:py-48 space-y-24 md:space-y-32 lg:space-y-48 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Module 1: Core PMS & Booking (Image Right) */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-glow leading-[1.1]">Reception & <br /><span className="text-blue-400">Bookings.</span></h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Centralized reservation management with integrated real-time room availability and guest profiling.
              </p>
              <ul className="space-y-6">
                <ListItem text="Instant booking update & sync" />
                <ListItem text="Multi-channel reservation synchronization" />
                <ListItem text="Comprehensive guest history and preferences" />
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] rounded-full" />
              <Image
                src="/images/landing/pms_booking_feature.png"
                alt="Core PMS & Booking"
                width={800}
                height={800}
                className="relative rounded-[3rem] border border-white/10 shadow-3xl glass-premium"
              />
            </motion.div>
          </div>

          {/* Module 2: Housekeeping (Image Left) */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center pt-24 md:pt-32 lg:pt-48">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative order-2 lg:order-1"
            >
              <div className="absolute -inset-10 bg-purple-500/10 blur-[100px] rounded-full" />
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/landing/housekeeping.png"
                  alt="Smart Housekeeping"
                  fill
                  className="object-cover rounded-2xl md:rounded-[3rem] border border-white/10 shadow-3xl glass-premium"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-6 md:space-y-8 order-1 lg:order-2"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-glow leading-[1.1]">Lightning-Fast <br /><span className="text-purple-400">Housekeeping.</span></h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Empower your cleaning staff with real-time room status updates and mobile-ready task lists.
              </p>
              <ul className="space-y-6">
                <ListItem text="Instant status sync with reception" />
                <ListItem text="Mobile-first staff dashboard" />
                <ListItem text="Cleaning duration analytics" />
              </ul>
            </motion.div>
          </div>

          {/* Module 3: Cloud Laundry (Image Right) */}
          <div className="grid lg:grid-cols-2 gap-24 items-center pt-48">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-6xl font-black tracking-tighter text-glow leading-[1.1]">Smart Linen <br /><span className="text-emerald-400">Management.</span></h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Manage in-house and guest laundry with a dual-mode system designed for maximum throughput.
              </p>
              <ul className="space-y-6">
                <ListItem text="Guest billing automation" />
                <ListItem text="Linen inventory tracking" />
                <ListItem text="Vendor management portal" />
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-emerald-500/10 blur-[100px] rounded-full" />
              <Image
                src="/images/landing/laundry.png"
                alt="Cloud Laundry"
                width={800}
                height={800}
                className="relative rounded-[3rem] border border-white/10 shadow-3xl glass-premium"
              />
            </motion.div>
          </div>

          {/* Module 4: Staff Excellence (Image Left) */}
          <div className="grid lg:grid-cols-2 gap-24 items-center pt-48">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative order-2 lg:order-1"
            >
              <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] rounded-full" />
              <Image
                src="/images/landing/staff_management_feature.png"
                alt="Staff Excellence"
                width={800}
                height={800}
                className="relative rounded-[3rem] border border-white/10 shadow-3xl glass-premium"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8 order-1 lg:order-2"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-6xl font-black tracking-tighter text-glow leading-[1.1]">Team <br /><span className="text-blue-400">Coordination.</span></h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Advanced staff orchestration with QR-based attendance and granular role management.
              </p>
              <ul className="space-y-6">
                <ListItem text="Secure QR-based attendance tracking" />
                <ListItem text="Custom permissions for all hotel staff" />
                <ListItem text="Real-time performance metrics" />
              </ul>
            </motion.div>
          </div>
        </div>
      </section >


      {/* Testimonials */}
      < section className="py-24 md:py-32 lg:py-48 relative overflow-hidden" >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/[0.02] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-glow">Trusted by <span className="text-gradient-premium">industry leaders</span></h2>
            <p className="text-lg md:text-xl text-muted-foreground">What elite hoteliers around the globe are saying about Hotelify 2.0.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Jenkins"
              role="GM at Azure Boutique"
              content="The real-time sync between PMS and Housekeeping has cut our turnover time by 40%. Absolutely game-changing for our operations."
              delay={0.1}
            />
            <TestimonialCard
              name="David Chen"
              role="Owner, Chen Hospitality"
              content="The laundry module is the most intuitive I've used. Finally, a platform that understands hotel operations deeply and securely."
              delay={0.2}
            />
            <TestimonialCard
              name="Marcus Thorne"
              role="Director of Ops, Grand Plaza"
              content="Switching to this SaaS was the best decision for our scalability. The security features and custom domains are top-notch."
              delay={0.3}
            />
          </div>
        </div>
      </section >

      {/* Pricing */}
      < section id="pricing" className="py-24 md:py-32 lg:py-48 bg-white/[0.02] relative" >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-glow">Scale with <span className="text-gradient-premium">no limits</span></h2>
            <p className="text-lg md:text-xl text-muted-foreground">Transparent pricing designed to grow with your property portfolio.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            <PricingCard
              tier="Starter"
              price="₹4,999"
              description="Perfect for boutiques"
              features={['Up to 20 Rooms', 'Basic PMS Core', 'Housekeeping', 'Email Support']}
            />
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <PricingCard
                tier="Professional"
                price="₹12,499"
                description="Our most popular choice"
                highlights
                features={['Up to 100 Rooms', 'Full PMS & Laundry', 'QR Attendance', 'Priority 24/7 Support', 'Advanced Analytics']}
              />
            </div>
            <PricingCard
              tier="Enterprise"
              price="Custom"
              description="For large hotel chains"
              features={['Unlimited Rooms', 'Custom White-label Domains', 'Dedicated Success Manager', 'Full API Access', 'On-site training']}
            />
          </div>
        </div>
      </section >

      {/* FAQ */}
      < section className="py-24 md:py-32 lg:py-48 relative overflow-hidden" >
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-24"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-glow">Common <span className="text-blue-400">questions</span></h2>
            <p className="text-base md:text-lg text-muted-foreground">Everything you need to know about the Hotelify platform.</p>
          </motion.div>

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
      </section >

      <Footer />
    </div >
  );
}

function OnboardingStep({ number, tag, title, description, isActive = false, onHover }: { number: string, tag: string, title: string, description: string, isActive?: boolean, onHover: () => void }) {
  return (
    <div
      className="relative pl-12 md:pl-16 group cursor-pointer"
      onMouseEnter={onHover}
    >
      <div className={`absolute left-0 top-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${isActive ? 'bg-blue-500 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-transparent border-white/20 group-hover:border-blue-500/50'}`}>
        {isActive ? (
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white animate-pulse" />
        ) : (
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white/20 bg-transparent group-hover:border-blue-500/30" />
        )}
      </div>
      <div>
        <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 transition-colors ${isActive ? 'text-blue-400' : 'text-muted-foreground group-hover:text-blue-400/70'}`}>
          {tag}
        </div>
        <h4 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 tracking-tight">{title}</h4>
        <p className="text-muted-foreground leading-relaxed font-medium text-xs md:text-sm max-w-sm group-hover:text-zinc-300 transition-colors">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="px-4">
      <div className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">{value}</div>
      <div className="text-muted-foreground text-[10px] md:text-sm uppercase tracking-widest leading-tight">{label}</div>
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

function TestimonialCard({ name, role, content, delay = 0 }: { name: string, role: string, content: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className="p-10 rounded-[2.5rem] glass-premium italic text-muted-foreground relative group hover:border-blue-500/30 transition-colors"
    >
      <Star className="w-6 h-6 text-yellow-500/20 absolute top-10 right-10 group-hover:scale-110 transition-transform" />
      <p className="mb-10 text-lg leading-relaxed">"{content}"</p>
      <div className="not-italic flex items-center gap-5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10" />
        <div>
          <div className="text-foreground font-bold text-lg">{name}</div>
          <div className="text-xs uppercase tracking-[0.2em] font-black opacity-40">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

function PricingCard({ tier, price, description, features, highlights = false }: { tier: string, price: string, description: string, features: string[], highlights?: boolean }) {
  return (
    <div className={`p-10 rounded-[3rem] transition-all duration-500 h-full flex flex-col ${highlights ? 'bg-white/[0.03] border-white/20 scale-105 shadow-2xl relative' : 'glass-premium border-white/5 opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}>
      {highlights && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl">
          Most Popular
        </div>
      )}
      <div className="mb-10">
        <h3 className="text-2xl font-black mb-2 tracking-tight">{tier}</h3>
        <p className="text-sm text-muted-foreground mb-6 font-medium">{description}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tighter">{price}</span>
          {price !== 'Custom' && <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">/ month</span>}
        </div>
      </div>
      <ul className="space-y-5 mb-12 flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Check className="w-3 h-3 text-blue-400" />
            </div>
            {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all ${highlights ? 'bg-primary text-primary-foreground primary-glow hover:scale-[1.03]' : 'glass-premium hover:bg-white/10'}`}>
        Secure My License
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

