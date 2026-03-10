import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Hotel, Users, DollarSign, TrendingUp } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground mt-1">Welcome back. Here is what is happening at your hotel today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value="$12,450"
                    description="+15% from yesterday"
                    icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
                />
                <StatCard
                    title="Occupancy"
                    value="84%"
                    description="42/50 rooms occupied"
                    icon={<Hotel className="w-4 h-4 text-blue-400" />}
                />
                <StatCard
                    title="Check-ins"
                    value="12"
                    description="8 guests to arrive"
                    icon={<Users className="w-4 h-4 text-purple-400" />}
                />
                <StatCard
                    title="Cleaning Status"
                    value="8"
                    description="Rooms dirty"
                    icon={<TrendingUp className="w-4 h-4 text-amber-400" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            No recent activity to display.
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader>
                        <CardTitle>Pending Laundry</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            All laundry cycles are up to date.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, description, icon }: { title: string, value: string, description: string, icon: React.ReactNode }) {
    return (
        <Card className="glass hover:border-blue-500/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}
