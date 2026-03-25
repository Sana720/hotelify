"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
    Plus, Calendar as CalendarIcon, User, Mail, CreditCard, Loader2, 
    Landmark, Wallet, ReceiptText, Percent, Phone, Fingerprint, 
    Users, Baby, UserPlus, CheckCircle2, Building2 
} from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";

interface NewBookingDialogProps {
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultRoomId?: string;
}

export function NewBookingDialog({ trigger, onSuccess, open: externalOpen, onOpenChange: setExternalOpen, defaultRoomId }: NewBookingDialogProps) {
    const { tenant } = useTenant();
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    const [searchData, setSearchData] = useState({
        check_in: new Date().toISOString().split('T')[0],
        check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        num_adults: 1,
        num_children: 0,
    });

    const [formData, setFormData] = useState({
        guest_name: "",
        guest_email: "",
        phone: "",
        aadhaar_number: "",
        company_name: "",
        company_gst: "",
        room_id: "", // Will be set from Step 2
        gst_applied: false,
        payment_method: "Cash",
        advance_amount: 0,
        companions: [] as { name: string, aadhaar: string }[]
    });

    const [taxPercentage, setTaxPercentage] = useState(18);
    const [guestType, setGuestType] = useState<'individual' | 'corporate'>('individual');
    const [isSearching, setIsSearching] = useState(false);

    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

    useEffect(() => {
        if (tenant && isOpen) {
            fetchTaxSettings();
            if (defaultRoomId) {
                setFormData(prev => ({ ...prev, room_id: defaultRoomId }));
            }
        }
    }, [tenant, isOpen, defaultRoomId]);

    // Reset state when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setAvailableRooms([]);
            setSelectedRoomId(null);
            setSearchData({
                check_in: new Date().toISOString().split('T')[0],
                check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                num_adults: 1,
                num_children: 0,
            });
            setFormData({
                guest_name: "",
                guest_email: "",
                phone: "",
                aadhaar_number: "",
                company_name: "",
                company_gst: "",
                room_id: "",
                gst_applied: false,
                payment_method: "Cash",
                advance_amount: 0,
                companions: []
            });
            setGuestType('individual');
        }
    }, [isOpen]);

    // Handle Auto-fill by phone
    useEffect(() => {
        const searchGuest = async () => {
            if (formData.phone.length >= 10 && tenant) {
                setIsSearching(true);
                const { data } = await supabase
                    .from('guests')
                    .select('name, email, aadhaar_number')
                    .eq('org_id', tenant.id)
                    .eq('phone', formData.phone)
                    .maybeSingle();
                
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        guest_name: data.name,
                        guest_email: data.email || "",
                        aadhaar_number: data.aadhaar_number || ""
                    }));
                }
                setIsSearching(false);
            }
        };

        const timer = setTimeout(searchGuest, 500);
        return () => clearTimeout(timer);
    }, [formData.phone, tenant]);

    // Update companions array based on searchData.num_adults
    useEffect(() => {
        const numCompanionsNeeded = Math.max(0, searchData.num_adults - 1);
        if (formData.companions.length !== numCompanionsNeeded) {
            setFormData(prev => {
                const newCompanions = [...prev.companions];
                if (newCompanions.length < numCompanionsNeeded) {
                    for (let i = newCompanions.length; i < numCompanionsNeeded; i++) {
                        newCompanions.push({ name: "", aadhaar: "" });
                    }
                } else {
                    newCompanions.splice(numCompanionsNeeded);
                }
                return { ...prev, companions: newCompanions };
            });
        }
    }, [searchData.num_adults]);

    async function fetchTaxSettings() {
        if (!tenant) return;
        const { data } = await supabase
            .from('property_identity')
            .select('tax_percent')
            .eq('org_id', tenant.id)
            .maybeSingle();
        
        if (data?.tax_percent !== undefined && data?.tax_percent !== null) {
            setTaxPercentage(parseFloat(data.tax_percent));
        }
    }

    const handleSearchRooms = async () => {
        if (!tenant) return;
        setIsLoading(true);
        try {
            // 1. Get ALL rooms with their type capacity
            const { data: allRooms } = await supabase
                .from('rooms')
                .select('*, room_types(max_occupancy, base_price)')
                .eq('org_id', tenant.id);

            // 2. Get overlapping bookings
            const { data: bookings } = await supabase
                .from('bookings')
                .select('room_id')
                .eq('org_id', tenant.id)
                .neq('status', 'cancelled')
                .filter('check_in', 'lt', searchData.check_out)
                .filter('check_out', 'gt', searchData.check_in);

            const bookedRoomIds = (bookings || []).map(b => b.room_id);
            
            // 3. Filter rooms
            const totalGuests = searchData.num_adults + searchData.num_children;
            const filtered = (allRooms || []).filter(room => {
                const isBooked = bookedRoomIds.includes(room.id);
                const hasCapacity = (room.room_types?.max_occupancy || 2) >= totalGuests;
                return !isBooked && hasCapacity;
            }).map(room => ({
                ...room,
                base_price: room.room_types?.base_price ?? room.base_price
            }));

            setAvailableRooms(filtered);
            setStep(2);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const { subtotal, taxAmount, totalAmount } = useMemo(() => {
        const room = availableRooms.find(r => r.id === formData.room_id);
        if (!room) return { subtotal: 0, taxAmount: 0, totalAmount: 0 };

        const start = new Date(searchData.check_in);
        const end = new Date(searchData.check_out);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        
        const sub = Number(room.base_price) * nights;
        const tax = formData.gst_applied ? (sub * (taxPercentage / 100)) : 0;
        
        return {
            subtotal: sub,
            taxAmount: tax,
            totalAmount: sub + tax
        };
    }, [formData.room_id, searchData.check_in, searchData.check_out, formData.gst_applied, availableRooms, taxPercentage]);

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsLoading(true);

        // 1. Upsert Guest Info
        const { error: guestError } = await supabase
            .from('guests')
            .upsert({
                org_id: tenant.id,
                name: formData.guest_name,
                email: formData.guest_email,
                phone: formData.phone,
                aadhaar_number: formData.aadhaar_number,
                company_name: guestType === 'corporate' ? formData.company_name : null,
                company_gst: guestType === 'corporate' ? formData.company_gst : null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'org_id,phone' });

        if (guestError) {
            console.error("Guest Upsert Error:", guestError);
        }

        // 2. Insert Booking
        const { error } = await supabase
            .from('bookings')
            .insert([{
                guest_name: formData.guest_name,
                guest_email: formData.guest_email,
                phone: formData.phone,
                aadhaar_number: formData.aadhaar_number,
                room_id: formData.room_id,
                check_in: searchData.check_in,
                check_out: searchData.check_out,
                num_adults: searchData.num_adults,
                num_children: searchData.num_children,
                org_id: tenant.id,
                total_price: totalAmount,
                tax_amount: taxAmount,
                payment_method: formData.payment_method,
                advance_amount: formData.advance_amount,
                companion_details: searchData.num_adults > 1 ? formData.companions : null,
                guest_type: guestType,
                company_name: guestType === 'corporate' ? formData.company_name : null,
                company_gst: guestType === 'corporate' ? formData.company_gst : null,
                gst_applied: guestType === 'corporate' ? true : formData.gst_applied,
                status: 'confirmed'
            }]);

        if (!error) {
            // 3. Create Folio & Post Initial Charge
            const { data: newBooking } = await supabase
                .from('bookings')
                .select('id')
                .eq('org_id', tenant.id)
                .eq('phone', formData.phone)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (newBooking) {
                const { data: folio, error: folioError } = await supabase
                    .from('folios')
                    .insert([{
                        org_id: tenant.id,
                        booking_id: newBooking.id,
                        status: 'open',
                        total_amount: Number(totalAmount) || 0
                    }])
                    .select()
                    .single();

                if (folioError) console.error("Initial Folio Error:", folioError);

                if (folio) {
                    const roomInfo = availableRooms.find((r: any) => r.id === formData.room_id);
                    const roomDesc = roomInfo ? `Room Accommodation — Room ${roomInfo.room_number}` : 'Room Accommodation Charge';
                    
                    const { error: itemError } = await supabase
                        .from('folio_items')
                        .insert([{
                            org_id: tenant.id,
                            folio_id: folio.id,
                            description: roomDesc,
                            amount: Number(totalAmount) || 0,
                            type: 'accommodation'
                        }]);
                    
                    if (itemError) console.error("Initial Folio Item Error:", itemError);
                }
            }

            await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('id', formData.room_id);

            setIsOpen(false);
            if (onSuccess) onSuccess();
        } else {
            console.error("Booking Error:", error);
            alert("Failed to create booking.");
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="glass-premium border-white/10 bg-[#111114] backdrop-blur-3xl text-white rounded-[2rem] p-6 sm:max-w-[750px] w-[95vw] max-h-[95vh] overflow-y-auto shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                <DialogHeader className="mb-6">
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
                                <Landmark className="w-8 h-8 text-indigo-400" />
                                Executive <span className="text-indigo-400">Reservation</span>
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 font-bold uppercase tracking-[0.25em] text-[10px] mt-1">Multi-phase room allocation & guest identity sync.</DialogDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step === s ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : step > s ? 'bg-emerald-500 text-white' : 'bg-white/10 text-zinc-500'}`}>
                                        {step > s ? "✓" : s}
                                    </div>
                                    {s < 3 && <div className={`w-4 h-[2px] mx-1 ${step > s ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogHeader>

                {/* --- Step 1: Availability Search --- */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400">01. Temporal & Capacity Parameters</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Arrival Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={searchData.check_in}
                                    onChange={e => setSearchData({ ...searchData, check_in: e.target.value })}
                                    onClick={(e) => e.currentTarget.showPicker()}
                                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-medium text-sm transition-all focus:ring-indigo-500/20 cursor-pointer [color-scheme:dark] px-4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Departure Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={searchData.check_out}
                                    onChange={e => setSearchData({ ...searchData, check_out: e.target.value })}
                                    onClick={(e) => e.currentTarget.showPicker()}
                                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-medium text-sm transition-all focus:ring-indigo-500/20 cursor-pointer [color-scheme:dark] px-4"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Adult Occupants <span className="text-red-500">*</span></Label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input
                                        type="number"
                                        min="1"
                                        value={searchData.num_adults}
                                        onChange={e => setSearchData({ ...searchData, num_adults: parseInt(e.target.value) || 1 })}
                                        className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm text-center pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Children</Label>
                                <div className="relative group">
                                    <Baby className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input
                                        type="number"
                                        min="0"
                                        value={searchData.num_children}
                                        onChange={e => setSearchData({ ...searchData, num_children: parseInt(e.target.value) || 0 })}
                                        className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm text-center pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={handleSearchRooms}
                            disabled={isLoading}
                            className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-[1.2rem] font-black uppercase tracking-[0.4em] text-xs transition-all flex items-center gap-3 mt-4"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Scan for availability <CalendarIcon className="w-4 h-4" /></>}
                        </Button>
                    </div>
                )}

                {/* --- Step 2: Room Selection --- */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400">02. Suite Allocation</span>
                            </div>
                            <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white" onClick={() => setStep(1)}>
                                ← Modify Criteria
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableRooms.length === 0 ? (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                    <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No rooms found for these parameters</p>
                                </div>
                            ) : (
                                availableRooms.map((room) => (
                                    <div 
                                        key={room.id}
                                        onClick={() => {
                                            setFormData({ ...formData, room_id: room.id });
                                            setStep(3);
                                        }}
                                        className="group relative bg-white/[0.02] border border-white/10 rounded-3xl p-5 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all duration-500"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors">Room {room.room_number}</h3>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{room.type}</p>
                                            </div>
                                            <Badge className="bg-white/5 text-zinc-300 border-white/10 font-bold text-[9px] px-2 py-0.5 uppercase tracking-tighter">
                                                ID: {room.room_number.padStart(3, '0')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-tighter mb-6">
                                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max {room.room_types?.max_occupancy || 2}</span>
                                        </div>
                                        <div className="flex items-end justify-between pt-4 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Base Rate</span>
                                                <span className="text-xl font-black text-white">₹{room.base_price.toLocaleString()}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-all duration-500">
                                                <Plus className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* --- Step 3: Registration & Settlement --- */}
                {step === 3 && (
                    <form onSubmit={handleCreateBooking} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-400">03. Identity & Settlement</span>
                            </div>
                            <Button type="button" variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white" onClick={() => setStep(2)}>
                                ← Change Suite
                            </Button>
                        </div>

                        {/* --- Identity Intelligence --- */}
                        <div className="grid grid-cols-2 gap-6">
                             <div className="col-span-full flex justify-center mb-2">
                                <Tabs value={guestType} onValueChange={(v: any) => setGuestType(v)} className="w-full max-w-[300px]">
                                    <TabsList className="bg-[#0a0a0c] border border-white/5 p-1 h-12 rounded-xl w-full shadow-2xl">
                                        <TabsTrigger 
                                            value="individual" 
                                            className="rounded-lg font-black uppercase tracking-widest text-[9px] text-zinc-500 data-[state=active]:!bg-white/[0.05] data-[state=active]:!text-blue-400 data-[state=active]:!border-blue-500/50 data-[state=active]:!shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-300 flex-1 h-full gap-2 border border-transparent"
                                        >
                                            Individual
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="corporate" 
                                            className="rounded-lg font-black uppercase tracking-widest text-[9px] text-zinc-500 data-[state=active]:!bg-white/[0.05] data-[state=active]:!text-blue-400 data-[state=active]:!border-blue-500/50 data-[state=active]:!shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-300 flex-1 h-full gap-2 border border-transparent"
                                        >
                                            Corporate
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Secure Phone <span className="text-red-500">*</span></Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                    <Input
                                        placeholder="+91..."
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                        required
                                    />
                                    {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Legal Name <span className="text-red-500">*</span></Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                    <Input
                                        placeholder="Full Name"
                                        value={formData.guest_name}
                                        onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                                        className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Government ID <span className="text-red-500">*</span></Label>
                                <div className="relative group">
                                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                    <Input
                                        placeholder="ID Number"
                                        value={formData.aadhaar_number}
                                        onChange={e => setFormData({ ...formData, aadhaar_number: e.target.value })}
                                        className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="Optional Email"
                                        value={formData.guest_email}
                                        onChange={e => setFormData({ ...formData, guest_email: e.target.value })}
                                        className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {guestType === 'corporate' && (
                            <div className="grid grid-cols-2 gap-4 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Company Entity</Label>
                                    <Input
                                        required
                                        placeholder="Name..."
                                        value={formData.company_name}
                                        onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                        className="h-9 bg-[#0d0d0f] border-white/10 text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-indigo-400">GSTIN</Label>
                                    <Input
                                        required
                                        placeholder="GSTIN..."
                                        value={formData.company_gst}
                                        onChange={e => setFormData({ ...formData, company_gst: e.target.value })}
                                        className="h-9 bg-[#0d0d0f] border-white/10 text-xs"
                                    />
                                </div>
                            </div>
                        )}

                        {searchData.num_adults > 1 && (
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Companion Manifest</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    {formData.companions.map((companion, idx) => (
                                        <div key={idx} className="flex gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                                            <Input
                                                placeholder={`Companion ${idx + 1} Name`}
                                                value={companion.name}
                                                onChange={e => {
                                                    const newComps = [...formData.companions];
                                                    newComps[idx].name = e.target.value;
                                                    setFormData({ ...formData, companions: newComps });
                                                }}
                                                className="h-9 bg-transparent border-white/10 text-xs flex-1"
                                                required
                                            />
                                            <Input
                                                placeholder="ID (Opt)"
                                                value={companion.aadhaar}
                                                onChange={e => {
                                                    const newComps = [...formData.companions];
                                                    newComps[idx].aadhaar = e.target.value;
                                                    setFormData({ ...formData, companions: newComps });
                                                }}
                                                className="h-9 bg-transparent border-white/10 text-xs w-28"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- Settlement Summary --- */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/10 rounded-3xl p-5 space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ReceiptText className="w-3.5 h-3.5" /> GST Allocation
                                    </span>
                                    <Switch 
                                        checked={formData.gst_applied} 
                                        onCheckedChange={(val) => setFormData({ ...formData, gst_applied: val })}
                                    />
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Base Tarif x {(new Date(searchData.check_out).getTime() - new Date(searchData.check_in).getTime()) / 86400000} Nights</span>
                                    <p className="text-xl font-black text-white">₹{subtotal.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-end border-t border-white/5 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Wallet className="w-3.5 h-3.5" /> Advance Received
                                    </Label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-500">₹</span>
                                        <Input
                                            type="number"
                                            value={formData.advance_amount || ""}
                                            onChange={e => setFormData({ ...formData, advance_amount: parseFloat(e.target.value) || 0 })}
                                            className="pl-7 h-10 bg-white/5 border-white/10 rounded-xl text-sm font-black text-right"
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Grand Total Due</span>
                                    <p className="text-3xl font-black text-white tracking-tighter">₹{totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-indigo-500 text-white hover:bg-indigo-600 rounded-[1.2rem] font-black uppercase tracking-[0.4em] text-xs transition-all shadow-xl shadow-indigo-500/10 active:scale-[0.98] flex items-center gap-3"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Finalize Allocation <CheckCircle2 className="w-4 h-4" /></>}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};
