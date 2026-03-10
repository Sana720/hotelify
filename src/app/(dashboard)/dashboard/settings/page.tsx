"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Hotel, Bell, Shield, Palette, Globe, Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your property configurations and system preferences.</p>
            </div>

            <Tabs defaultValue="property" className="space-y-6">
                <TabsList className="bg-white/5 p-1 border border-white/10">
                    <TabsTrigger value="property" className="gap-2"><Hotel className="w-4 h-4" /> Property</TabsTrigger>
                    <TabsTrigger value="branding" className="gap-2"><Palette className="w-4 h-4" /> Branding</TabsTrigger>
                    <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" /> Security</TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="property">
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle>Property Information</CardTitle>
                            <CardDescription>Update your hotel's public profile and contact details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="hotel-name">Hotel Name</Label>
                                    <Input id="hotel-name" defaultValue="Grand Royal Hotel" className="glass" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subdomain">Subdomain</Label>
                                    <div className="flex gap-2">
                                        <Input id="subdomain" defaultValue="grandroyal" className="glass" />
                                        <div className="flex items-center px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground">
                                            .hotelify.com
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" defaultValue="123 Luxury Ave, Beverly Hills, CA" className="glass" />
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Custom Domain</p>
                                    <p className="text-xs text-muted-foreground">Connect your own root domain for a white-label experience.</p>
                                </div>
                                <Button variant="outline" size="sm" className="glass border-blue-500/20 text-blue-400">
                                    Connect Domain
                                </Button>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button className="rounded-full gap-2">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="branding">
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle>Visual Identity</CardTitle>
                            <CardDescription>Customize the look and feel of your guest portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex items-start gap-8">
                                <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border-2 border-dashed border-blue-500/30 flex flex-col items-center justify-center text-blue-400 hover:bg-blue-500/20 cursor-pointer transition-colors">
                                    <Globe className="w-8 h-8 mb-1" />
                                    <span className="text-[10px] font-bold uppercase">Logo</span>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="text-sm font-medium">Property Logo</h4>
                                    <p className="text-xs text-muted-foreground max-w-sm">Recommend size: 512x512px. PNG or SVG preferred for high-resolution displays.</p>
                                    <Button variant="secondary" size="sm" className="rounded-full h-8 text-xs">Upload New</Button>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Primary Theme Color</h4>
                                <div className="flex gap-3">
                                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                                        <div
                                            key={color}
                                            className="w-10 h-10 rounded-full border-2 border-white/10 cursor-pointer hover:scale-110 transition-transform ring-offset-background hover:ring-2 ring-blue-500"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
