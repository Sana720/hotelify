"use client";

import { Table as BaseTable, TableHeader as BaseTableHeader, TableRow as BaseTableRow, TableHead as BaseTableHead, TableBody as BaseTableBody, TableCell as BaseTableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockStaff = [
    { id: "1", name: "John Doe", email: "john@hotel.com", role: "Manager", status: "Active" },
    { id: "2", name: "Jane Smith", email: "jane@hotel.com", role: "Receptionist", status: "Active" },
    { id: "3", name: "Mike Ross", email: "mike@hotel.com", role: "Cleaner", status: "Inactive" },
];

export function StaffList() {
    return (
        <Card className="glass-premium border-white/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <div>
                    <CardTitle className="text-2xl text-gradient-premium">Staff Directory</CardTitle>
                    <p className="text-sm text-white/40 mt-1.5">Manage your team and their roles.</p>
                </div>
                <Button className="rounded-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:scale-105 border border-indigo-500/50">
                    <UserPlus className="w-4 h-4" />
                    Add Staff
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <BaseTable>
                    <BaseTableHeader className="bg-white/[0.02]">
                        <BaseTableRow className="hover:bg-transparent border-white/5">
                            <BaseTableHead className="text-white/60 font-semibold pl-6">Name</BaseTableHead>
                            <BaseTableHead className="text-white/60 font-semibold">Role</BaseTableHead>
                            <BaseTableHead className="text-white/60 font-semibold">Status</BaseTableHead>
                            <BaseTableHead className="text-right text-white/60 font-semibold pr-6">Actions</BaseTableHead>
                        </BaseTableRow>
                    </BaseTableHeader>
                    <BaseTableBody>
                        {mockStaff.map((person) => (
                            <BaseTableRow key={person.id} className="group hover:bg-white/[0.04] border-white/5 transition-colors duration-300">
                                <BaseTableCell className="pl-6 py-4">
                                    <div className="font-semibold text-white/90 group-hover:text-indigo-300 transition-colors">{person.name}</div>
                                    <div className="text-xs text-white/40 mt-1">{person.email}</div>
                                </BaseTableCell>
                                <BaseTableCell className="text-white/70 py-4">{person.role}</BaseTableCell>
                                <BaseTableCell className="py-4">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${person.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${person.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                        {person.status}
                                    </div>
                                </BaseTableCell>
                                <BaseTableCell className="text-right pr-6 py-4">
                                    <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/10 transition-colors rounded-full">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </BaseTableCell>
                            </BaseTableRow>
                        ))}
                    </BaseTableBody>
                </BaseTable>
            </CardContent>
        </Card>
    );
}
