"use client";

import React, { useState, useEffect } from "react";
import { Save, Globe, Phone, Mail, MapPin, Hash, CreditCard, Clock, Loader2, CheckCircle2, AlertCircle, Star, Percent, FileText, Upload, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/components/providers/TenantProvider";
import { updatePropertySettings, fetchPropertySettings } from "@/app/(admin)/admin/hotels/actions";

export function PropertyIdentityForm({ onSuccess }: { onSuccess?: () => void }) {
    const { tenant } = useTenant();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Location data states
    const [countries, setCountries] = useState<string[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [loadingLocations, setLoadingLocations] = useState({ countries: false, states: false, cities: false });

    const [formData, setFormData] = useState({
        // Identity
        name: "",
        star_rating: "5",
        country: "",
        state: "",
        city: "",
        zip_code: "",
        address: "",
        latitude: "",
        longitude: "",
        phone: "",
        email: "",
        website: "",
        logo_url: "",
        // Taxation
        tax_name: "",
        tax_percent: "",
        registration_type: "GST",
        gst_number: "",
        // Policies
        check_in_time: "12:00",
        check_out_time: "11:00",
        cancellation_policy: "",
        upcoming_checkin_days: "7",
        upcoming_checkout_days: "7",
        description: ""
    });

    useEffect(() => {
        fetchInitialData();
        fetchCountries();
    }, [tenant]); // Added tenant to dependency array for fetchInitialData

    const fetchCountries = async () => {
        setLoadingLocations(prev => ({ ...prev, countries: true }));
        try {
            const response = await fetch("https://countriesnow.space/api/v0.1/countries/iso");
            const data = await response.json();
            if (!data.error) {
                setCountries(data.data.map((c: any) => c.name).sort());
            }
        } catch (error) {
            console.error("Error fetching countries:", error);
        } finally {
            setLoadingLocations(prev => ({ ...prev, countries: false }));
        }
    };

    const fetchStates = async (countryName: string) => {
        if (!countryName) {
            setStates([]);
            setCities([]);
            return;
        }
        setLoadingLocations(prev => ({ ...prev, states: true }));
        try {
            const response = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: countryName })
            });
            const data = await response.json();
            if (!data.error) {
                setStates(data.data.states.map((s: any) => s.name).sort());
            } else {
                setStates([]);
            }
        } catch (error) {
            console.error("Error fetching states:", error);
            setStates([]);
        } finally {
            setLoadingLocations(prev => ({ ...prev, states: false }));
        }
    };

    const fetchCities = async (countryName: string, stateName: string) => {
        if (!countryName || !stateName) {
            setCities([]);
            return;
        }
        setLoadingLocations(prev => ({ ...prev, cities: true }));
        try {
            const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: countryName, state: stateName })
            });
            const data = await response.json();
            if (!data.error) {
                setCities(data.data.sort());
            } else {
                setCities([]);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
            setCities([]);
        } finally {
            setLoadingLocations(prev => ({ ...prev, cities: false }));
        }
    };

    useEffect(() => {
        if (formData.country) {
            fetchStates(formData.country);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [formData.country]);

    useEffect(() => {
        if (formData.country && formData.state) {
            fetchCities(formData.country, formData.state);
        } else {
            setCities([]);
        }
    }, [formData.country, formData.state]);

    async function fetchInitialData() {
        if (!tenant) return;
        setLoading(true);
        try {
            const result = await fetchPropertySettings(tenant.id);

            if (!result.success) {
                console.error("Failed to fetch settings from server action:", result.error);
                return;
            }

            const { identity: identityData, policy: policyData } = result;
            const newFormData = { ...formData };

            // Organization Name from Tenant Context (always accurate as it's the master name)
            newFormData.name = tenant.name || "";

            if (identityData) {
                // If legal_name exists in identity, use it (overrides tenant name if desired)
                if (identityData.legal_name) newFormData.name = identityData.legal_name;
                
                newFormData.country = identityData.country || "";
                newFormData.state = identityData.state || "";
                newFormData.city = identityData.city || "";
                newFormData.zip_code = identityData.zip || "";
                newFormData.address = identityData.address_line1 || "";
                newFormData.email = identityData.contact_email || "";
                newFormData.phone = identityData.contact_phone || "";
                newFormData.website = identityData.website || "";
                newFormData.star_rating = identityData.star_rating?.toString() || "5";
                newFormData.latitude = identityData.latitude?.toString() || "";
                newFormData.longitude = identityData.longitude?.toString() || "";
                newFormData.tax_name = identityData.tax_name || "";
                newFormData.tax_percent = identityData.tax_percent?.toString() || "";
                newFormData.registration_type = identityData.tax_registration_type || "GST";
                newFormData.gst_number = identityData.gst_number || "";
                newFormData.logo_url = identityData.logo_url || "";
                newFormData.description = identityData.description || "";
            }

            if (policyData) {
                newFormData.check_in_time = policyData.check_in_time || "12:00";
                newFormData.check_out_time = policyData.check_out_time || "11:00";
                newFormData.cancellation_policy = policyData.cancellation_policy || "";
                newFormData.upcoming_checkin_days = policyData.upcoming_checkin_days?.toString() || "7";
                newFormData.upcoming_checkout_days = policyData.upcoming_checkout_days?.toString() || "7";
            }

            setFormData(newFormData);
        } catch (err) {
            console.error("Critical error in fetchInitialData:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        console.log("DEBUG - Starting Save... Tenant ID:", tenant.id);

        try {
            // Check current user's staff record to see their org_id
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: staffData } = await supabase
                    .from('staff')
                    .select('org_id')
                    .eq('user_id', user.id)
                    .maybeSingle();
                console.log("DEBUG - Current User ID:", user.id);
                console.log("DEBUG - User's Staff Org ID:", staffData?.org_id || "None");
                
                // Also check if they are a platform admin
                const { data: adminData } = await supabase
                    .from('platform_admins')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();
                console.log("DEBUG - Is Platform Admin:", !!adminData);
            }

            // Split data between tables
            const identityFields = [
                'name', 'star_rating', 'country', 'state', 'city', 'zip_code', 'address',
                'latitude', 'longitude', 'phone', 'email', 'website', 'logo_url',
                'tax_name', 'tax_percent', 'registration_type', 'gst_number', 'description'
            ];

            const policyFields = [
                'check_in_time', 'check_out_time', 'cancellation_policy',
                'upcoming_checkin_days', 'upcoming_checkout_days'
            ];

            const identityUpdate: { [key: string]: any } = { org_id: tenant.id, updated_at: new Date().toISOString() };
            identityFields.forEach(f => {
                const val = (formData as any)[f];

                if (f === 'name') identityUpdate['legal_name'] = val;
                else if (f === 'zip_code') identityUpdate['zip'] = val;
                else if (f === 'address') identityUpdate['address_line1'] = val;
                else if (f === 'phone') identityUpdate['contact_phone'] = val;
                else if (f === 'email') identityUpdate['contact_email'] = val;
                else if (f === 'registration_type') identityUpdate['tax_registration_type'] = val;
                else if (['star_rating', 'upcoming_checkin_days', 'upcoming_checkout_days'].includes(f)) {
                    const parsed = parseInt(val);
                    identityUpdate[f] = isNaN(parsed) ? null : parsed;
                }
                else if (['tax_percent', 'latitude', 'longitude'].includes(f)) {
                    const parsed = parseFloat(val);
                    identityUpdate[f] = isNaN(parsed) ? null : parsed;
                }
                else if (f in formData) identityUpdate[f] = val;
            });

            const policyUpdate: { [key: string]: any } = { org_id: tenant.id, updated_at: new Date().toISOString() };
            policyFields.forEach(f => {
                const val = (formData as any)[f];
                if (['upcoming_checkin_days', 'upcoming_checkout_days'].includes(f)) {
                    const parsed = parseInt(val);
                    policyUpdate[f] = isNaN(parsed) ? null : parsed;
                }
                else if (f in formData) policyUpdate[f] = val;
            });

            // Use Server Action to bypass RLS
            const result = await updatePropertySettings(tenant.id, {
                name: formData.name,
                identityUpdate,
                policyUpdate
            });

            if (!result.success) throw new Error(result.error);

            setStatus({ type: 'success', message: 'Settings Synchronized' });
            onSuccess?.();
            setTimeout(() => setStatus(null), 3000);
        } catch (err: any) {
            console.error("Critical Error: Failed to synchronize property settings.", {
                message: err.message,
                details: err.details,
                hint: err.hint,
                error: err
            });
            setStatus({ type: 'error', message: err.message || 'Synchronization Failed' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Syncing Physical Data...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Left side: Image Upload */}
                <div className="w-full xl:w-[380px] space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Hotel Image</Label>
                    <div className="relative group cursor-pointer">
                        <div className="w-full aspect-[340/200] rounded-2xl bg-white/[0.02] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 group-hover:bg-white/[0.04] group-hover:border-blue-500/50 transition-all overflow-hidden bg-[url('https://via.placeholder.com/340x200?text=340x200')] bg-center bg-cover">
                            {formData.logo_url ? (
                                <img src={formData.logo_url} alt="Hotel Logo" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                        <Upload className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white italic">340 × 200</p>
                                    </div>
                                </>
                            )}
                            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                    <p className="text-[9px] font-bold text-zinc-500 leading-relaxed">Supported Files: <span className="text-zinc-300">.png, .jpg, .jpeg</span>. Image will be resized into <span className="text-zinc-300">340x200px</span></p>
                </div>

                {/* Right side: Main Fields Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Hotel Title <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="Enter property name"
                            className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Star Rating</Label>
                        <Select
                            value={formData.star_rating}
                            onValueChange={(val) => setFormData({ ...formData, star_rating: val })}
                        >
                            <SelectTrigger className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 focus:border-blue-500/50 transition-all">
                                <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                                <SelectItem value="1">1 Star</SelectItem>
                                <SelectItem value="2">2 Star</SelectItem>
                                <SelectItem value="3">3 Star</SelectItem>
                                <SelectItem value="4">4 Star</SelectItem>
                                <SelectItem value="5">5 Star</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Country <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.country}
                            onValueChange={(val) => setFormData({ ...formData, country: val, state: "", city: "" })}
                            disabled={loadingLocations.countries}
                        >
                            <SelectTrigger className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all">
                                <SelectValue placeholder={loadingLocations.countries ? "Loading..." : "Select country"} />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300 max-h-[200px]">
                                {countries.map(country => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">State <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.state}
                            onValueChange={(val) => setFormData({ ...formData, state: val, city: "" })}
                            disabled={!formData.country || loadingLocations.states || states.length === 0}
                        >
                            <SelectTrigger className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all">
                                <SelectValue placeholder={loadingLocations.states ? "Loading..." : "Select state"} />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300 max-h-[200px]">
                                {states.map(state => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">City <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.city}
                            onValueChange={(val) => setFormData({ ...formData, city: val })}
                            disabled={!formData.state || loadingLocations.cities || cities.length === 0}
                        >
                            <SelectTrigger className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all">
                                <SelectValue placeholder={loadingLocations.cities ? "Loading..." : "Select city"} />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300 max-h-[200px]">
                                {cities.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Zip Code <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="e.g. 10001"
                            className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                            value={formData.zip_code}
                            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Address <span className="text-red-500">*</span></Label>
                        <Input
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                            placeholder="Enter building, street, etc."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Latitude</Label>
                        <Input
                            value={formData.latitude}
                            onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                            className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                            placeholder="e.g. 19.0760"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Longitude</Label>
                        <Input
                            value={formData.longitude}
                            onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                            className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                            placeholder="e.g. 72.8777"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tax Name <span className="text-red-500">*</span></Label>
                        <Input
                            value={formData.tax_name}
                            onChange={e => setFormData({ ...formData, tax_name: e.target.value })}
                            className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                            placeholder="e.g. GST"
                        />
                    </div>
                    <div className="space-y-2 relative">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tax Percent Charge <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input
                                placeholder="e.g. 18"
                                value={formData.tax_percent}
                                onChange={e => setFormData({ ...formData, tax_percent: e.target.value })}
                                className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium pr-10"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-xs">%</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tax Registration Type</Label>
                        <Select
                            value={formData.registration_type}
                            onValueChange={v => setFormData({ ...formData, registration_type: v })}
                        >
                            <SelectTrigger className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                                <SelectItem value="GST">GST</SelectItem>
                                <SelectItem value="VAT">VAT</SelectItem>
                                <SelectItem value="Regular">Regular</SelectItem>
                                <SelectItem value="Composition Scheme">Composition Scheme</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">GST/Registration Number</Label>
                        <Input
                            value={formData.gst_number}
                            onChange={e => setFormData({ ...formData, gst_number: e.target.value })}
                            className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                            placeholder="Enter registration number"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Check In Time <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input
                                type="time"
                                value={formData.check_in_time}
                                onChange={e => setFormData({ ...formData, check_in_time: e.target.value })}
                                className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 focus:border-blue-500/50 transition-all block pr-10"
                            />
                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Checkout Time <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input
                                type="time"
                                value={formData.check_out_time}
                                onChange={e => setFormData({ ...formData, check_out_time: e.target.value })}
                                className="bg-zinc-900/50 border-white/5 h-12 text-zinc-100 focus:border-blue-500/50 transition-all block pr-10"
                            />
                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2 relative">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-1.5">
                        Upcoming Check-In List <span className="text-red-500">*</span>
                        <Info className="w-3 h-3 text-zinc-600" />
                    </Label>
                    <div className="flex h-12">
                        <Input
                            type="number"
                            value={formData.upcoming_checkin_days}
                            onChange={e => setFormData({ ...formData, upcoming_checkin_days: e.target.value })}
                            className="bg-zinc-900/50 border-white/5 h-full text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all rounded-r-none font-medium flex-1"
                        />
                        <div className="w-16 bg-white/5 border border-l-0 border-white/5 rounded-r-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Days</div>
                    </div>
                </div>
                <div className="space-y-2 relative">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-1.5">
                        Upcoming Checkout List <span className="text-red-500">*</span>
                        <Info className="w-3 h-3 text-zinc-600" />
                    </Label>
                    <div className="flex h-12">
                        <Input
                            type="number"
                            value={formData.upcoming_checkout_days}
                            onChange={e => setFormData({ ...formData, upcoming_checkout_days: e.target.value })}
                            className="bg-zinc-900/50 border-white/5 h-full text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all rounded-r-none font-medium flex-1"
                        />
                        <div className="w-16 bg-white/5 border border-l-0 border-white/5 rounded-r-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Days</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Description <span className="text-red-500">*</span></Label>
                    <Textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="min-h-[120px] bg-zinc-900/50 border-white/5 rounded-2xl p-4 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                        placeholder="Provide a brief description of the hotel..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cancellation Policy <span className="text-red-500">*</span></Label>
                    <Textarea
                        value={formData.cancellation_policy}
                        onChange={e => setFormData({ ...formData, cancellation_policy: e.target.value })}
                        className="min-h-[120px] bg-zinc-900/50 border-white/5 rounded-2xl p-4 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 transition-all font-medium"
                        placeholder="Outline the cancellation terms..."
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-8 border-t border-white/5 flex flex-col items-center sm:flex-row sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                    {status?.type === 'success' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{status.message}</span>
                        </div>
                    )}
                    {status?.type === 'error' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 animate-in zoom-in duration-300">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{status.message}</span>
                        </div>
                    )}
                </div>
                <Button
                    type="submit"
                    disabled={saving}
                    className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Updating State...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Save className="w-5 h-5" />
                            <span>Commit Hotel Settings</span>
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}
