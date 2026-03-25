"use client";

import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Clock,
    UserPlus,
    CalendarCheck,
    CalendarRange,
    History,
    Home,
    CheckSquare,
    Hotel,
    Plus,
    UserCheck,
    BarChart3,
    TrendingUp,
    Search,
    Bell,
    Mail,
    ChevronRight,
    CalendarDays,
    Loader2,
    CalendarPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewBookingDialog } from "@/modules/pms/NewBookingDialog";
import { RegisterGuestDialog } from "@/modules/pms/RegisterGuestDialog";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

export default function DashboardPage() {
    const { tenant, isLoading: isTenantLoading } = useTenant();
    const [stats, setStats] = useState({
        delayedCheckout: 0,
        pendingCheckIn: 0,
        upcomingCheckIn: 0,
        upcomingCheckout: 0,
        todayBooked: 0,
        todayAvailable: 0,
        activeBooking: 0,
        totalBookings: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [bookingChartData, setBookingChartData] = useState<any[]>([]);
    const [paymentChartData, setPaymentChartData] = useState<any[]>([]);

    useEffect(() => {
        async function fetchStats() {
            if (!tenant) return;
            setLoading(true);

            const today = new Date().toISOString().split('T')[0];
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
            const startDate = fourteenDaysAgo.toISOString().split('T')[0];

            try {
                // 1. Fetch Bookings and Rooms in parallel
                const [
                    { data: bookings, error: bookingsError },
                    { data: rooms, error: roomsError }
                ] = await Promise.all([
                    supabase.from('bookings').select('*').eq('org_id', tenant.id).gte('created_at', startDate),
                    supabase.from('rooms').select('*').eq('org_id', tenant.id)
                ]);

                if (bookingsError) throw bookingsError;
                if (roomsError) throw roomsError;

                const b = bookings || [];
                const r = rooms || [];

                // Standard Stats
                const delayedCheckout = b.filter(x => x.status === 'checked_in' && x.check_out < today).length;
                const pendingCheckIn = b.filter(x => x.status === 'confirmed' && x.check_in === today).length;
                const upcomingCheckIn = b.filter(x => x.status === 'confirmed' && x.check_in > today).length;
                const upcomingCheckout = b.filter(x => x.status === 'checked_in' && x.check_out > today).length;
                const todayBooked = b.filter(x => (x.status === 'confirmed' || x.status === 'checked_in') && x.check_in <= today && x.check_out >= today).length;
                const activeBooking = b.filter(x => x.status === 'checked_in').length;
                const totalBookings = b.length;
                const totalRooms = r.length;
                const todayAvailable = Math.max(0, totalRooms - todayBooked);

                setStats({
                    delayedCheckout, pendingCheckIn, upcomingCheckIn, upcomingCheckout,
                    todayBooked, todayAvailable, activeBooking, totalBookings
                });

                // Chart Data Aggregation
                const chartMap: Record<string, { name: string, bookings: number, amount: number }> = {};
                
                // Initialize last 7 days
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    chartMap[dateStr] = { name: label, bookings: 0, amount: 0 };
                }

                b.forEach(booking => {
                    const dateKey = new Date(booking.created_at).toISOString().split('T')[0];
                    if (chartMap[dateKey]) {
                        chartMap[dateKey].bookings += Number(booking.total_price);
                        chartMap[dateKey].amount += 1; 
                    }
                });

                const sortedChartData = Object.keys(chartMap)
                    .sort()
                    .map(key => chartMap[key]);

                setBookingChartData(sortedChartData);
                setPaymentChartData(sortedChartData);

            } catch (err) {
                console.error("Dashboard Stats Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        }

        if (!isTenantLoading) {
            fetchStats();
        }
    }, [tenant, isTenantLoading, refreshKey]);

    if (isTenantLoading || loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Synchronizing System Stats...
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
                System offline: Tenant resolution failed.
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Header / Search Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search here..."
                        className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all relative">
                        <Mail className="w-5 h-5" />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0c]" />
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black">
                            {tenant.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">{tenant.name} Overview</h1>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <Home className="w-3 h-3" />
                        <span>Command Center</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <NewBookingDialog 
                        onSuccess={() => setRefreshKey(prev => prev + 1)}
                        trigger={
                            <Button className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">
                                <CalendarPlus className="w-4 h-4" />
                                Book Room
                            </Button>
                        }
                    />
                    <RegisterGuestDialog 
                        onSuccess={() => setRefreshKey(prev => prev + 1)}
                        trigger={
                            <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                                <UserPlus className="w-4 h-4" />
                                Register New Guest
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                <StatCard
                    icon={<History className="w-6 h-6" />}
                    label="Delayed Checkout"
                    value={stats.delayedCheckout.toString()}
                    color="text-rose-500"
                    bgColor="bg-rose-500/10"
                    iconColor="text-rose-400"
                    url="/dashboard/bookings/delayed"
                />
                <StatCard
                    icon={<UserPlus className="w-6 h-6" />}
                    label="Pending Check-In"
                    value={stats.pendingCheckIn.toString()}
                    color="text-amber-500"
                    bgColor="bg-amber-500/10"
                    iconColor="text-amber-400"
                    url="/dashboard/bookings/checkin"
                />
                <StatCard
                    icon={<CalendarCheck className="w-6 h-6" />}
                    label="Upcoming Check-In"
                    value={stats.upcomingCheckIn.toString()}
                    color="text-blue-500"
                    bgColor="bg-blue-500/10"
                    iconColor="text-blue-400"
                    url="/dashboard/bookings/upcoming-in"
                />
                <StatCard
                    icon={<CalendarRange className="w-6 h-6" />}
                    label="Upcoming Checkout"
                    value={stats.upcomingCheckout.toString()}
                    color="text-purple-500"
                    bgColor="bg-purple-500/10"
                    iconColor="text-purple-400"
                    url="/dashboard/bookings/upcoming-out"
                />
                <StatCard
                    icon={<History className="w-6 h-6" />}
                    label="Today's Booked Rooms"
                    value={stats.todayBooked.toString()}
                    color="text-zinc-500"
                    bgColor="bg-zinc-500/10"
                    iconColor="text-zinc-400"
                    url="/dashboard/bookings/today"
                />
                <StatCard
                    icon={<Home className="w-6 h-6" />}
                    label="Today's Available Rooms"
                    value={stats.todayAvailable.toString()}
                    color="text-blue-500"
                    bgColor="bg-blue-500/10"
                    iconColor="text-blue-400"
                    url="/dashboard/rooms"
                />
                <StatCard
                    icon={<CheckSquare className="w-6 h-6" />}
                    label="Active Booking"
                    value={stats.activeBooking.toString()}
                    color="text-emerald-500"
                    bgColor="bg-emerald-500/10"
                    iconColor="text-emerald-400"
                    url="/dashboard/bookings"
                />
                <StatCard
                    icon={<Hotel className="w-6 h-6" />}
                    label="Total Bookings"
                    value={stats.totalBookings.toString()}
                    color="text-zinc-500"
                    bgColor="bg-zinc-500/10"
                    iconColor="text-zinc-400"
                    url="/dashboard/bookings"
                />
            </div>

            {/* Reports Section */}
            <div className="grid lg:grid-cols-2 gap-8 font-sans">
                {/* Booking Report */}
                <Card className="bg-white/[0.02] border-white/5 rounded-[2rem] overflow-hidden group hover:border-blue-500/20 transition-all duration-500">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-white italic">
                                    Booking <span className="text-blue-500">Report</span>
                                    <span className="ml-2 text-[10px] font-bold text-zinc-500 lowercase">(Excluding Tax)</span>
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 h-[300px]">
                        {stats.totalBookings > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bookingChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#52525b"
                                        fontSize={10}
                                        fontWeight="bold"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#52525b"
                                        fontSize={10}
                                        fontWeight="bold"
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `₹${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            borderRadius: '1rem',
                                            border: '1px solid #ffffff10',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar
                                        dataKey="bookings"
                                        fill="#3b82f6"
                                        radius={[6, 6, 0, 0]}
                                        barSize={30}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[10px] font-bold uppercase tracking-widest text-zinc-600 italic">
                                Insufficient data for booking trends
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Report */}
                <Card className="bg-white/[0.02] border-white/5 rounded-[2rem] overflow-hidden group hover:border-emerald-500/20 transition-all duration-500">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-white italic">
                                    Payment <span className="text-emerald-500">Report</span>
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 h-[300px]">
                        {stats.totalBookings > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={paymentChartData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#52525b"
                                        fontSize={10}
                                        fontWeight="bold"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#52525b"
                                        fontSize={10}
                                        fontWeight="bold"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            borderRadius: '1rem',
                                            border: '1px solid #ffffff10',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[10px] font-bold uppercase tracking-widest text-zinc-600 italic">
                                Insufficient data for payment analytics
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, bgColor, iconColor, url }: {
    icon: React.ReactNode,
    label: string,
    value: string,
    color: string,
    bgColor: string,
    iconColor: string,
    url: string
}) {
    const router = useRouter();
    return (
        <Card 
            onClick={() => router.push(url)}
            className="bg-white/[0.02] border-white/5 rounded-[2.5rem] hover:bg-white/[0.04] transition-all duration-500 group cursor-pointer relative overflow-hidden active:scale-95"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[100px] -mr-12 -mt-12 opacity-0 group-hover:opacity-20 transition-opacity ${bgColor}`} />
            <CardContent className="p-8 flex items-center gap-7">
                <div className={`w-16 h-16 min-w-[64px] min-h-[64px] rounded-2xl ${bgColor} flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-105 duration-500`}>
                    <div className={`${iconColor} transition-transform duration-500 group-hover:scale-110`}>{icon}</div>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="text-3xl font-black text-white/90 group-hover:text-white transition-colors tracking-tight">{value}</div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400 transition-colors truncate">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}


