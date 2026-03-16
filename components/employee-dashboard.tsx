"use client"

import { DashboardUser } from "@/types/dashboard"
import { useEffect, useState } from "react"
import { DashboardShell, StatCard, SectionHeader, TableShell, LeaveStatusBadge } from "./general"


const Icons = {
    Annual: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Sick: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    Status: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Used: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
}

interface EmployeeStats {
    annualRemaining: number
    annualTotal: number
    sickRemaining: number
    sickTotal: number
    pendingCount: number
    myLeaves: any[]
    balance: any
}

export default function EmployeeDashboard({ user }: { user: DashboardUser }) {
    const [data, setData] = useState<EmployeeStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const [myLeavesRes, balanceRes] = await Promise.all([
                    fetch("/api/leaves/my?limit=10"),
                    fetch("/api/leaves/balance"),
                ])
                const myLeaves = myLeavesRes.ok ? await myLeavesRes.json() : null
                const balance = balanceRes.ok ? await balanceRes.json() : null

                const bal = balance?.data
                const pending = myLeaves?.data?.filter((l: any) =>
                    ["PENDING", "HR_REVIEW", "SUPERVISOR_REVIEW", "FINAL_REVIEW"].includes(l.status)
                ) ?? []

                setData({
                    annualRemaining: bal?.annual_remaining ?? 0,
                    annualTotal: bal?.annual_total ?? 24,
                    sickRemaining: bal?.sick_remaining ?? 0,
                    sickTotal: bal?.sick_total ?? 12,
                    pendingCount: pending.length,
                    myLeaves: myLeaves?.data ?? [],
                    balance: bal,
                })
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const greeting = new Date().getHours() < 12 ? "Good morning," : new Date().getHours() < 17 ? "Good afternoon," : "Good evening,"

    const annualUsed = data ? data.annualTotal - data.annualRemaining : 0
    const annualPct = data ? Math.round((data.annualRemaining / data.annualTotal) * 100) : 0

    return (
        <DashboardShell greeting={greeting} name={user.name} badge="Employee" badgeColor="#10b981">
            {/* Leave balance cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                    label="Annual Leave Left"
                    value={loading ? "—" : `${data?.annualRemaining ?? 0} days`}
                    sub={`of ${data?.annualTotal ?? 24} total`}
                    icon={<Icons.Annual />}
                    accent="#10b981"
                    loading={loading}
                />
                <StatCard
                    label="Sick Leave Left"
                    value={loading ? "—" : `${data?.sickRemaining ?? 0} days`}
                    sub={`of ${data?.sickTotal ?? 12} total`}
                    icon={<Icons.Sick />}
                    accent="#3b82f6"
                    loading={loading}
                />
                <StatCard
                    label="Leave Used"
                    value={loading ? "—" : `${annualUsed} days`}
                    sub="annual leave taken this year"
                    icon={<Icons.Used />}
                    accent="#f59e0b"
                    loading={loading}
                />
                <StatCard
                    label="In Progress"
                    value={loading ? "—" : data?.pendingCount ?? 0}
                    sub="applications under review"
                    icon={<Icons.Status />}
                    accent="#8b5cf6"
                    loading={loading}
                />
            </div>

            {/* Visual leave balance bar */}
            {!loading && data && (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                    <SectionHeader title="Leave Balance Overview" subtitle={`${new Date().getFullYear()} leave year`} />
                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                                <span className="font-medium text-foreground">Annual Leave</span>
                                <span className="text-muted-foreground">{data.annualRemaining} / {data.annualTotal} days remaining</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                                    style={{ width: `${annualPct}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                                <span className="font-medium text-foreground">Sick Leave</span>
                                <span className="text-muted-foreground">{data.sickRemaining} / {data.sickTotal} days remaining</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                                    style={{ width: `${data.sickTotal > 0 ? Math.round((data.sickRemaining / data.sickTotal) * 100) : 0}%` }}
                                />
                            </div>
                        </div>
                        {(data.balance?.carried_over ?? 0) > 0 && (
                            <p className="text-xs text-muted-foreground pt-1">
                                + {data.balance.carried_over} days carried over from last year
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* My leave history */}
            <div className="space-y-4">
                <SectionHeader
                    title="My Leave Applications"
                    subtitle="All your leave requests for this year"
                    action={
                        <a href="/leave/apply" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            + Apply for Leave
                        </a>
                    }
                />
                <TableShell headers={["Type", "Period", "Days", "Applied On", "Status"]} loading={loading} empty="You haven't applied for leave yet">
                    {data?.myLeaves.map((l: any) => (
                        <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium capitalize text-foreground">{l.leave_type?.toLowerCase()}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                {new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{l.days}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(l.applied_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3"><LeaveStatusBadge status={l.status} /></td>
                        </tr>
                    ))}
                </TableShell>
            </div>
        </DashboardShell>
    )
}