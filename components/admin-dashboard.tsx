"use client"

import { DashboardUser } from "@/types/dashboard"
import { useEffect, useState } from "react"
import { DashboardShell, StatCard, SectionHeader, TableShell, LeaveStatusBadge } from "./general"


// Icons (inline SVG for zero-dep)
const Icons = {
    Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Active: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    Leave: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Sections: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
}

interface AdminStats {
    totalEmployees: number
    activeEmployees: number
    pendingLeaves: number
    totalSections: number
    recentLeaves: any[]
    recentEmployees: any[]
}

export default function AdminDashboard({ user }: { user: DashboardUser }) {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const [empRes, leaveRes] = await Promise.all([
                    fetch("/api/employees?limit=5&page=1"),
                    fetch("/api/leaves?limit=5&status=PENDING"),
                ])
                const empData = empRes.ok ? await empRes.json() : null
                const leaveData = leaveRes.ok ? await leaveRes.json() : null

                // Fetch active employees
                const activeRes = await fetch("/api/employees?isActive=true&limit=1")
                const activeData = activeRes.ok ? await activeRes.json() : null

                setStats({
                    totalEmployees: empData?.meta?.total ?? 0,
                    activeEmployees: activeData?.meta?.total ?? 0,
                    pendingLeaves: leaveData?.meta?.total ?? 0,
                    totalSections: 0, // would need a /api/sections endpoint
                    recentLeaves: leaveData?.data ?? [],
                    recentEmployees: empData?.data ?? [],
                })
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const greeting = new Date().getHours() < 12 ? "Good morning," : new Date().getHours() < 17 ? "Good afternoon," : "Good evening,"

    return (
        <DashboardShell greeting={greeting} name={user.name} badge="Administrator" badgeColor="#ef4444">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard label="Total Employees" value={loading ? "—" : stats?.totalEmployees ?? 0} icon={<Icons.Users />} accent="#6366f1" loading={loading} />
                <StatCard label="Active Staff" value={loading ? "—" : stats?.activeEmployees ?? 0} icon={<Icons.Active />} accent="#10b981" loading={loading} />
                <StatCard label="Pending Leaves" value={loading ? "—" : stats?.pendingLeaves ?? 0} icon={<Icons.Leave />} accent="#f59e0b" loading={loading} />
                <StatCard label="Sections" value={loading ? "—" : stats?.totalSections ?? "—"} icon={<Icons.Sections />} accent="#3b82f6" loading={loading} />
            </div>

            {/* Recent Leave Requests */}
            <div className="space-y-4">
                <SectionHeader
                    title="Pending Leave Requests"
                    subtitle="Awaiting action across the organisation"
                    action={
                        <a href="/leave" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                            View all →
                        </a>
                    }
                />
                <TableShell
                    headers={["Employee", "Type", "Dates", "Days", "Status"]}
                    loading={loading}
                    empty="No pending leave requests"
                >
                    {stats?.recentLeaves.map((l) => (
                        <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{l.user?.name ?? l.employee?.employee_number ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground capitalize">{l.leave_type?.toLowerCase()}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                {new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{l.days}</td>
                            <td className="px-4 py-3"><LeaveStatusBadge status={l.status} /></td>
                        </tr>
                    ))}
                </TableShell>
            </div>

            {/* Recent Employees */}
            <div className="space-y-4">
                <SectionHeader
                    title="Recently Added Employees"
                    subtitle="Latest registrations in the system"
                    action={
                        <a href="/employees" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                            All employees →
                        </a>
                    }
                />
                <TableShell
                    headers={["Employee #", "Name", "Section", "Position", "Status"]}
                    loading={loading}
                    empty="No employees found"
                >
                    {stats?.recentEmployees.map((e) => (
                        <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.employee_number}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{e.users?.[0]?.name ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{e.section?.section_name ?? "Unassigned"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{e.position ?? "—"}</td>
                            <td className="px-4 py-3">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                    {e.is_active ? "Active" : "Inactive"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </TableShell>
            </div>
        </DashboardShell>
    )
}