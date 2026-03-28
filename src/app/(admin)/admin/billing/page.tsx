"use client";

import { useState, useEffect } from "react";
import { 
    CreditCard, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Search, 
    Filter,
    Loader2,
    Calendar,
    Building2,
    CheckCircle2,
    Clock,
    XCircle,
    Download
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BillingLedgerPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        revenue: 0,
        activeSubs: 0,
        activeTrials: 0,
        failedCount: 0
    });

    useEffect(() => {
        fetchBillingData();
    }, []);

    async function fetchBillingData() {
        setLoading(true);
        
        // 1. Fetch Transactions
        const { data: txns } = await supabase
            .from('platform_billing')
            .select(`
                *,
                organizations(name, subdomain),
                subscription_plans(name)
            `)
            .order('created_at', { ascending: false });

        // 2. Fetch Org Stats
        const { data: orgs } = await supabase
            .from('organizations')
            .select('subscription_status');

        const paidRevenue = txns?.filter((r: any) => r.status === 'paid').reduce((a, b) => a + b.amount, 0) || 0;
        const trials = orgs?.filter((o: any) => o.subscription_status === 'trialing').length || 0;
        const subs = orgs?.filter((o: any) => o.subscription_status === 'active').length || 0;
        const failed = txns?.filter((r: any) => r.status === 'failed').length || 0;

        setStats({
            revenue: paidRevenue,
            activeSubs: subs,
            activeTrials: trials,
            failedCount: failed
        });
        
        if (txns) setRecords(txns);
        setLoading(false);
    }

    const filteredRecords = records.filter((r: any) => 
        r.organizations?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 italic uppercase">
                        <CreditCard className="w-8 h-8 text-emerald-500" />
                        Billing <span className="text-emerald-500">Ledger</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Platform Revenue & Trial Monitoring</p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="glass-premium border-white/5 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px]">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <BillingStatCard 
                    title="Gross Revenue" 
                    value={`₹${stats.revenue.toLocaleString()}`} 
                    trend="+12.5%"
                />
                <BillingStatCard 
                    title="Active Trials" 
                    value={stats.activeTrials.toString()} 
                    trend="In Pipeline"
                />
                <BillingStatCard 
                    title="Paying Subs" 
                    value={stats.activeSubs.toString()} 
                    trend="Properties"
                />
                <BillingStatCard 
                    title="Failed Trans" 
                    value={stats.failedCount.toString()} 
                    trend="Action Required"
                    isAlert
                />
            </div>

            <div className="glass-premium rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-grow max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                        <Input 
                            placeholder="Search by hotel name or txn ID..." 
                            className="pl-12 h-12 bg-white/5 border-white/5 rounded-2xl text-sm font-medium focus:ring-emerald-500/20 focus:border-emerald-500/40 border-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Property</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Plan</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse"><td colSpan={6} className="p-8 h-20 bg-white/[0.01]" /></tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs italic">No financial records found in the ledger</td></tr>
                            ) : (
                                filteredRecords.map((r) => (
                                    <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                                                    {r.organizations?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight italic">{r.organizations?.name}</div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{r.organizations?.subdomain}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-300 font-black uppercase tracking-widest text-[8px]">
                                                {r.subscription_plans?.name}
                                            </Badge>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-black text-white italic">₹{r.amount.toLocaleString()}</div>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant="outline" className={`font-black uppercase tracking-widest text-[9px] px-3 py-1 ${getStatusStyle(r.status)}`}>
                                                {r.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                                {r.status === 'pending' && <Clock className="w-3 h-3 mr-1.5" />}
                                                {r.status === 'failed' && <XCircle className="w-3 h-3 mr-1.5" />}
                                                {r.status}
                                            </Badge>
                                        </td>
                                        <td className="p-6 font-medium text-zinc-400 text-xs">
                                            {format(new Date(r.created_at), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="p-6 text-right font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                                            {r.transaction_id || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function BillingStatCard({ title, value, trend, isAlert }: { title: string, value: string, trend: string, isAlert?: boolean }) {
    return (
        <div className="glass-premium p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
            <div className="flex items-baseline justify-between pt-2">
                <div className="text-3xl font-black italic tracking-tighter text-white">{value}</div>
                <div className={`text-[10px] font-black uppercase tracking-widest ${isAlert ? 'text-red-500' : 'text-emerald-500'}`}>{trend}</div>
            </div>
        </div>
    );
}
