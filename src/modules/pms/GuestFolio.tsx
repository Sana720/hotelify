"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Plus, CreditCard, Printer, Loader2, X, Wallet, Tag, ArrowDownCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/components/providers/TenantProvider";
import { toast } from "sonner";
import { fetchPropertySettings } from "@/app/(admin)/admin/hotels/actions";

interface FolioItem {
    id: string;
    description: string;
    amount: number;
    type: 'accommodation' | 'service' | 'tax' | 'adjustment';
    created_at: string;
}

interface Folio {
    id: string;
    status: 'open' | 'closed' | 'void';
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    advance_amount: number;
    sgst: number;
    cgst: number;
    payment_method: string;
    invoice_number?: string;
    items: FolioItem[];
}

interface GuestFolioProps {
    bookingId: string;
    guestName: string;
    onClose: () => void;
}

export function GuestFolio({ bookingId, guestName, onClose }: GuestFolioProps) {
    const { tenant } = useTenant();
    const [folio, setFolio] = useState<Folio | null>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showPostCharge, setShowPostCharge] = useState(false);
    const [newCharge, setNewCharge] = useState({ description: '', amount: '', type: 'service' as const });
    const [taxPercent, setTaxPercent] = useState(0);
    const [propertyIdentity, setPropertyIdentity] = useState<any>(null);
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    
    // Settlement Form State
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [discount, setDiscount] = useState("0");
    const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');

    const fetchFolio = async () => {
        if (!tenant || !bookingId) return;
        setLoading(true);
        try {
            // 1. Fetch Property Tax & Identity Config
            const settings = await fetchPropertySettings(tenant.id);
            const rawTaxPercent = settings.success && settings.identity?.tax_percent ? parseFloat(settings.identity.tax_percent) : 12;
            setTaxPercent(rawTaxPercent);
            if (settings.success) setPropertyIdentity(settings.identity);

            // 2. Fetch Booking Data (for complete invoice details)
            const { data: bookingData, error: bookingErr } = await supabase
                .from('bookings')
                .select('*, rooms(room_number)')
                .eq('id', bookingId)
                .single();

            if (bookingErr) console.error("Booking Fetch Error:", bookingErr);
            if (bookingData) setBookingDetails(bookingData);

            const advanceAmount = Number(bookingData?.advance_amount || 0);
            const roomPrice = Number(bookingData?.total_price || 0);
            const isGstApplied = bookingData?.gst_applied ?? false;

            console.log("BILLING DIAGNOSTIC:", { bookingId, roomPrice, advanceAmount, rawTaxPercent, isGstApplied });

            // 3. Get or Create Folio
            let { data: folioItemsList, error: folioError } = await supabase
                .from('folios')
                .select('*')
                .eq('booking_id', bookingId);

            let folioData = folioItemsList && folioItemsList.length > 0 ? folioItemsList[0] : null;

            if (folioError) {
                console.error("Folio Lookup Error:", JSON.stringify(folioError));
            }

            if (!folioData) {
                console.log("FOLIO MISSING. TRYING TO INITIALIZE...");
                const { data: newFolio, error: createError } = await supabase
                    .from('folios')
                    .insert([{ 
                        org_id: tenant?.id, 
                        booking_id: bookingId, 
                        status: 'open',
                        payment_method: 'Cash'
                    }])
                    .select()
                    .single();
                
                if (createError) {
                    console.error("Folio Create Error Detailed:", JSON.stringify({
                        err: createError,
                        msg: createError.message,
                        tenant: tenant?.id,
                        booking: bookingId
                    }));
                    toast.error("Database denied billing record creation. Check permissions.");
                } else {
                    folioData = newFolio;
                }
            }

            if (folioData) {
                // 4. Fetch Folio Items
                let { data: itemsData, error: itemsErr } = await supabase
                    .from('folio_items')
                    .select('*')
                    .eq('folio_id', folioData.id)
                    .order('created_at', { ascending: true });

                if (itemsErr) console.error("Folio Items Fetch Error:", itemsErr);

                // 5. BOOTSTRAP: If no items, add Accommodation Charge automatically
                if ((!itemsData || itemsData.length === 0) && roomPrice > 0) {
                    console.log("BOOTSTRAPPING FOLIO WITH ROOM PRICE:", roomPrice);
                    const { data: bootstrapItem, error: bootstrapErr } = await supabase
                        .from('folio_items')
                        .insert([{
                            org_id: tenant?.id,
                            folio_id: folioData.id,
                            description: 'Room Tariff (Auto-posted)',
                            amount: roomPrice,
                            type: 'accommodation'
                        }])
                        .select()
                        .single();
                    
                    if (bootstrapErr) {
                        console.error("BOOTSTRAP FAILED:", bootstrapErr);
                    } else if (bootstrapItem) {
                        itemsData = [bootstrapItem];
                    }
                }

                const items = (itemsData || []).map(it => ({
                    ...it,
                    amount: Number(it.amount || 0)
                }));

                const subtotal = items.reduce((acc, it) => acc + Number(it.amount || 0), 0);
                
                // --- TAX CALCULATION LOGIC ---
                // Only calculate tax if it was applied at booking time
                const appliedTaxPercent = isGstApplied ? Number(rawTaxPercent) : 0;
                const taxMultiplier = appliedTaxPercent / 100;
                
                const sgst = Number((subtotal * taxMultiplier) / 2);
                const cgst = Number((subtotal * taxMultiplier) / 2);
                const taxAmount = sgst + cgst;

                const dbDiscount = Number(folioData.discount_amount || 0);

                setFolio({
                    ...folioData,
                    subtotal: Number(subtotal),
                    sgst: Number(sgst),
                    cgst: Number(cgst),
                    tax_amount: Number(taxAmount),
                    advance_amount: Number(advanceAmount),
                    discount_amount: Number(dbDiscount),
                    total_amount: Number((subtotal + taxAmount) - advanceAmount - dbDiscount),
                    items
                });
                
                console.log("FOLIO STATE FINALIZED:", { subtotal, sgst, cgst, taxAmount, advanceAmount, isGstApplied });
            }
        } catch (err) {
            console.error("Critical Folio fetch error:", err);
            toast.error("Failed to load financial records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFolio();
    }, [bookingId, tenant]);

    const handlePostCharge = async () => {
        if (!folio || !newCharge.description || !newCharge.amount) return;
        setIsActionLoading(true);
        const amount = parseFloat(newCharge.amount);

        const { error: itemError } = await supabase
            .from('folio_items')
            .insert([{
                org_id: tenant?.id,
                folio_id: folio.id,
                description: newCharge.description,
                amount: amount,
                type: newCharge.type
            }]);

        if (!itemError) {
            toast.success("Charge posted successfully.");
            setShowPostCharge(false);
            setNewCharge({ description: '', amount: '', type: 'service' });
            await fetchFolio();
        } else {
            toast.error("Process failed.");
        }
        setIsActionLoading(false);
    };

    const getAppliedDiscount = () => {
        if (!folio) return 0;
        const val = parseFloat(discount) || 0;
        if (discountType === 'percent') {
            return (folio.subtotal + folio.tax_amount) * (val / 100);
        }
        return val;
    };

    const handleSettle = async () => {
        if (!folio) return;
        setIsActionLoading(true);
        
        const discValue = getAppliedDiscount();
        const finalTotal = (folio.subtotal + folio.tax_amount) - folio.advance_amount - discValue;

        const { error } = await supabase
            .from('folios')
            .update({ 
                status: 'closed', 
                payment_method: paymentMethod,
                discount_amount: discValue,
                tax_amount: folio.tax_amount,
                sgst: folio.sgst,
                cgst: folio.cgst,
                total_amount: finalTotal,
                updated_at: new Date().toISOString() 
            })
            .eq('id', folio.id);

        if (!error) {
            toast.success("Bill settled successfully.");
            await fetchFolio();
        } else {
            toast.error("Settlement failed.");
        }
        setIsActionLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Calculating Financial Statement...
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="print-invoice-wrapper fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0 print:static"
            >
                <Card id="tax-invoice" className="w-[98vw] sm:w-full max-w-3xl glass-premium border-white/10 bg-[#0a0a0c]/90 backdrop-blur-3xl text-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl print:bg-white print:text-black print:shadow-none print:border-none print:rounded-none lg:h-auto max-h-[95vh] md:max-h-[90vh] flex flex-col">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.02] shrink-0 print:bg-white print:border-black/10">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <span className="p-2 bg-blue-600/10 rounded-xl print:hidden"><Receipt className="w-6 h-6 text-blue-400" /></span>
                                Tax <span className="text-blue-500 print:text-black">Invoice</span>
                            </CardTitle>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 print:text-zinc-600 truncate max-w-[200px] md:max-w-none">{tenant?.name} • Invoice #{bookingId.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 print:hidden">
                            <Badge className={`px-3 md:px-4 py-1.5 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest ${
                                folio?.status === 'closed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                                {folio?.status}
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5 w-8 h-8 md:w-10 md:h-10"><X className="w-4 h-4 md:w-5 md:h-5" /></Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 overflow-hidden flex flex-col flex-1">
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar print:overflow-visible">
                            {/* --- PROFESSIONAL INVOICE HEADER (Print Only) --- */}
                            <div className="hidden print:block space-y-10 mb-12 border-b-2 border-black/10 pb-12">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        {propertyIdentity?.logo_url ? (
                                            <img src={propertyIdentity.logo_url} alt="Logo" className="h-16 w-auto object-contain" />
                                        ) : (
                                            <div className="h-16 w-16 bg-black text-white flex items-center justify-center rounded-2xl font-black text-2xl">
                                                {tenant?.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">{propertyIdentity?.legal_name || tenant?.name}</h1>
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                                                {propertyIdentity?.address && `${propertyIdentity.address}, `}
                                                {propertyIdentity?.city && `${propertyIdentity.city}, `}
                                                {propertyIdentity?.state && `${propertyIdentity.state} - `}
                                                {propertyIdentity?.zip_code}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                GSTIN: <span className="text-black">{propertyIdentity?.gst_number || 'N/A'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-4">
                                        <h2 className="text-4xl font-black uppercase tracking-tighter text-zinc-200">Tax Invoice</h2>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Invoice No: <span className="text-black">#{bookingId.slice(0, 8).toUpperCase()}</span></p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Date: <span className="text-black">{new Date().toLocaleDateString()}</span></p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status: <span className="text-black uppercase">{folio?.status}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-12 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Billed To</h3>
                                        <div className="space-y-1">
                                            <p className="text-base font-black text-black leading-none">{bookingDetails?.guest_name}</p>
                                            {bookingDetails?.company_name && <p className="text-xs font-bold text-zinc-600 uppercase">{bookingDetails.company_name}</p>}
                                            {bookingDetails?.company_address && <p className="text-[10px] font-medium text-zinc-500 uppercase max-w-[250px] leading-tight mt-0.5">{bookingDetails.company_address}</p>}
                                            <p className="text-xs font-medium text-zinc-500">{bookingDetails?.phone}</p>
                                            <p className="text-xs font-medium text-zinc-500">{bookingDetails?.guest_email}</p>
                                            {bookingDetails?.company_gst && (
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">
                                                    Guest GSTIN: <span className="text-black">{bookingDetails.company_gst}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Stay Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-zinc-400">Check-In</p>
                                                <p className="text-xs font-bold">{bookingDetails ? new Date(bookingDetails.check_in).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] font-black uppercase text-zinc-400">Check-Out</p>
                                                <p className="text-xs font-bold">{bookingDetails ? new Date(bookingDetails.check_out).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-zinc-400">Room No</p>
                                                <p className="text-xs font-bold">{bookingDetails?.rooms?.room_number || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] font-black uppercase text-zinc-400">Nights</p>
                                                <p className="text-xs font-bold">
                                                    {bookingDetails ? Math.max(1, Math.ceil((new Date(bookingDetails.check_out).getTime() - new Date(bookingDetails.check_in).getTime()) / 86400000)) : 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* --- Action Bar (Add Charge Toggle) --- */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                                <div className="space-y-1">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Transaction Summary</h3>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Itemized list of services & taxes</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setShowPostCharge(!showPostCharge)}
                                    disabled={folio?.status === 'closed'}
                                    className="w-full sm:w-auto rounded-xl glass-premium border-white/10 font-bold uppercase tracking-widest text-[9px] gap-2 h-10 px-4"
                                >
                                    <Plus className="w-3 h-3" /> Post Charge
                                </Button>
                            </div>

                            {/* --- Post Charge Form --- */}
                            {showPostCharge && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="p-6 rounded-[2rem] bg-blue-600/5 border border-blue-500/20 space-y-4 print:hidden"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Service Particulars</Label>
                                            <Input placeholder="Laundry, F&B, Minibar..." value={newCharge.description} onChange={e => setNewCharge({...newCharge, description: e.target.value})} className="bg-white/5 border-white/10 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Pre-Tax Amount</Label>
                                            <Input type="number" placeholder="0.00" value={newCharge.amount} onChange={e => setNewCharge({...newCharge, amount: e.target.value})} className="bg-white/5 border-white/10 rounded-xl" />
                                        </div>
                                    </div>
                                    <Button onClick={handlePostCharge} disabled={isActionLoading || !newCharge.description || !newCharge.amount} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">
                                        {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Adjustment'}
                                    </Button>
                                </motion.div>
                            )}

                            {/* --- Line Items Table --- */}
                            <div className="space-y-2">
                                <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5 mb-2 print:border-black/10 print:text-black">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-7">Description</div>
                                    <div className="col-span-2 text-center">Type</div>
                                    <div className="col-span-2 text-right">Amount</div>
                                </div>
                                {folio?.items.map((item, idx) => (
                                    <div key={item.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 p-5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-blue-500/30 transition-all print:bg-white print:border-none print:px-4 print:py-2">
                                        <div className="flex items-center justify-between sm:contents">
                                            <div className="text-[10px] text-zinc-500 font-bold sm:col-span-1">#{idx + 1}</div>
                                            <div className="sm:hidden"><Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 print:border-black/20 text-zinc-500">{item.type}</Badge></div>
                                        </div>
                                        <div className="sm:col-span-7 text-sm font-bold text-white/90 print:text-black sm:truncate">{item.description}</div>
                                        <div className="hidden sm:block sm:col-span-2 text-center"><Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 print:border-black/20 text-zinc-500">{item.type}</Badge></div>
                                        <div className="flex items-center justify-end gap-2 sm:contents">
                                            <span className="text-[8px] font-black uppercase text-zinc-600 sm:hidden">Total</span>
                                            <div className="sm:col-span-2 text-right text-sm font-black text-white print:text-black">₹{item.amount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                                {folio?.items.length === 0 && <p className="text-center py-12 text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">No transactions recorded.</p>}
                            </div>

                            {/* --- Calculation Area --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10 print:border-black/10 print:grid-cols-2">
                                <div className="space-y-4 print:mt-12">
                                    <div className="space-y-4 print:hidden">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Settlement Options</h4>
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Mode of Payment</Label>
                                                <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={folio?.status === 'closed'}>
                                                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                        <SelectItem value="Card">Visa / Mastercard</SelectItem>
                                                        <SelectItem value="UPI">UPI / GPay</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Bill Adjustment / Discount</Label>
                                                    <div className="flex rounded-lg overflow-hidden border border-white/10 shrink-0 mb-1">
                                                        <button 
                                                            onClick={() => setDiscountType('flat')}
                                                            className={`px-2 py-1 text-[8px] font-black transition-colors ${discountType === 'flat' ? 'bg-orange-500 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                                                        >
                                                            ₹
                                                        </button>
                                                        <button 
                                                            onClick={() => setDiscountType('percent')}
                                                            className={`px-2 py-1 text-[8px] font-black transition-colors ${discountType === 'percent' ? 'bg-orange-500 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                                                        >
                                                            %
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500" />
                                                    <Input 
                                                        type="number" 
                                                        value={discount} 
                                                        onChange={e => setDiscount(e.target.value)} 
                                                        disabled={folio?.status === 'closed'} 
                                                        className="bg-white/5 border-white/10 rounded-xl h-11 pl-10" 
                                                        placeholder={discountType === 'flat' ? "0.00" : "0%"} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Print Disclaimer & Footer --- */}
                                    <div className="hidden print:block space-y-8">
                                        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 italic text-[10px] text-zinc-500 leading-relaxed">
                                            <p className="font-black uppercase tracking-widest mb-1 text-zinc-400 not-italic">Terms & Conditions</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Check-out time is {propertyIdentity?.check_out_time || '11:00 AM'}. Overstay will be charged as per tariff.</li>
                                                <li>All disputes are subject to the jurisdiction of the local courts.</li>
                                                <li>This is a computer-maintained record and hence no physical signature is required.</li>
                                            </ul>
                                        </div>
                                        <div className="pt-12 flex justify-between items-end border-t border-dashed border-zinc-200">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-zinc-400">Guest Signature</p>
                                                <div className="w-48 h-px bg-zinc-300 mt-8"></div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[10px] font-black uppercase text-zinc-400 text-right">Authorized Signatory</p>
                                                <p className="text-xs font-black uppercase tracking-tighter mt-8">{propertyIdentity?.legal_name || tenant?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-3 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 print:bg-white print:border-black/10">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 print:text-zinc-600">
                                            <span>Subtotal</span>
                                            <span className="text-sm">₹{folio?.subtotal.toLocaleString()}</span>
                                        </div>
                                        {(folio?.tax_amount || 0) > 0 && (
                                            <>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 print:text-zinc-600">
                                                    <span>SGST ({(taxPercent/2).toFixed(1)}%)</span>
                                                    <span className="text-sm">₹{folio?.sgst.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 print:text-zinc-600">
                                                    <span>CGST ({(taxPercent/2).toFixed(1)}%)</span>
                                                    <span className="text-sm">₹{folio?.cgst.toLocaleString()}</span>
                                                </div>
                                            </>
                                        )}
                                        { (folio?.advance_amount || 0) > 0 && (
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                <span className="flex items-center gap-1.5"><ArrowDownCircle className="w-3 h-3" /> Advance Received</span>
                                                <span className="text-sm">-₹{folio?.advance_amount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        { (parseFloat(discount) > 0 || (folio?.discount_amount || 0) > 0) && (
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-orange-500">
                                                <span>Total Adjustment {discountType === 'percent' && parseFloat(discount) > 0 && `(${discount}%)`}</span>
                                                <span className="text-sm">-₹{(getAppliedDiscount() || folio?.discount_amount || 0).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-white/10 print:border-black flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">Final Amount Due</p>
                                                <p className="text-3xl font-black tracking-tighter text-white print:text-black">₹{((folio?.subtotal || 0) + (folio?.tax_amount || 0) - (folio?.advance_amount || 0) - (getAppliedDiscount() || folio?.discount_amount || 0)).toLocaleString()}</p>
                                            </div>
                                            <div className="hidden print:block text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Payment Status</p>
                                                <p className="font-bold uppercase text-xs">{folio?.status === 'closed' ? (paymentMethod || folio?.payment_method) : 'Outstanding'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Footer Buttons --- */}
                        <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0 print:hidden">
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="h-14 rounded-2xl glass-premium border-white/10 font-bold uppercase tracking-widest text-[10px] gap-3 order-2 sm:order-1"
                            >
                                <Printer className="w-5 h-5 text-zinc-400" /> Print Tax Invoice
                            </Button>
                            <Button
                                onClick={handleSettle}
                                disabled={isActionLoading || folio?.status === 'closed'}
                                className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95 order-1 sm:order-2"
                            >
                                {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Wallet className="w-5 h-5" /> Settle & Close Statement</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <style jsx global>{`
                    @media print {
                        /* 1. Reset everything to invisible */
                        body *, html * {
                            visibility: hidden !important;
                            background: none !important;
                        }
                        
                        /* 2. ONLY show the tax-invoice container and its descendants */
                        .print-invoice-wrapper, .print-invoice-wrapper *, #tax-invoice, #tax-invoice * {
                            visibility: visible !important;
                        }

                        /* 3. Re-enable layout for the invoice only */
                        .print-invoice-wrapper {
                            position: static !important;
                            display: block !important;
                            background: white !important;
                            width: 100% !important;
                            height: auto !important;
                        }
                        
                        #tax-invoice {
                            display: block !important;
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            height: auto !important;
                            background: white !important;
                            color: black !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            border: none !important;
                            box-shadow: none !important;
                            transform: none !important;
                        }

                        /* 4. Fix scrolling area (important for long bills) */
                        .custom-scrollbar {
                            overflow: visible !important;
                            max-height: none !important;
                        }

                        /* 5. Force white background for the whole page */
                        body {
                            background: white !important;
                            color: black !important;
                            visibility: hidden !important;
                        }
                        
                        /* 6. Hide the fixed overlay and its background */
                        div[class*="fixed"] {
                            background: transparent !important;
                            backdrop-filter: none !important;
                        }
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
}
