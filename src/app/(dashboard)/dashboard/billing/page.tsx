"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, CheckCircle2, Zap, ArrowUpRight, ShieldCheck, Receipt } from "lucide-react";

export default function BillingPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & subscription</h1>
                    <p className="text-muted-foreground mt-1">Manage your enterprise plan and view resource usage.</p>
                </div>
                <Button className="rounded-full gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <Zap className="w-4 h-4 fill-white" />
                    Upgrade Plan
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass border-blue-500/20 col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">Professional Plan</CardTitle>
                                <CardDescription>Your current subscription tier.</CardDescription>
                            </div>
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">Active</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex items-center gap-8">
                            <div className="text-4xl font-bold tracking-tight">$299<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Resource Usage (Rooms)</span>
                                    <span>42 / 50</span>
                                </div>
                                <Progress value={84} className="h-2 bg-white/5 border border-white/5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FeatureItem label="Unlimited Staff" />
                            <FeatureItem label="Secure QR Attendance" />
                            <FeatureItem label="Advanced PMS Grid" />
                            <FeatureItem label="Hybrid Laundry Tracking" />
                            <FeatureItem label="Custom Subdomain" />
                            <FeatureItem label="Priority Support" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-6 bg-blue-500/20 rounded-md border border-blue-500/30 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="text-sm font-mono tracking-tighter">•••• 4242</div>
                            </div>
                            <Badge variant="ghost" className="text-[10px]">Primary</Badge>
                        </div>
                        <Button variant="ghost" className="w-full text-xs text-blue-400 hover:bg-blue-500/10">Manage Cards</Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass border-white/5">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-muted-foreground" />
                        Recent Invoices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <InvoiceItem date="Mar 01, 2026" amount="$299.00" status="Paid" />
                        <InvoiceItem date="Feb 01, 2026" amount="$299.00" status="Paid" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function FeatureItem({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {label}
        </div>
    );
}

function InvoiceItem({ date, amount, status }: { date: string, amount: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.01] transition-colors border border-transparent hover:border-white/5">
            <div className="flex items-center gap-4">
                <div className="text-sm font-medium">{date}</div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-400 border-emerald-500/10">{status}</Badge>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-sm font-semibold">{amount}</div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </Button>
            </div>
        </div>
    );
}
