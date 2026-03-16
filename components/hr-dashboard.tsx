"use client"

import { DashboardUser } from "@/types/dashboard"
import { useEffect, useState } from "react"
import { DashboardShell, StatCard, SectionHeader, TableShell, LeaveStatusBadge } from "./general"


const Icons = {
    Pending: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Review: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Approved: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
}

export default function HRDashboard({ user }: { user: DashboardUser }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const [pendingRes, hrReviewRes, approvedRes, empRes] = await Promise.all([
                    fetch("/api/leaves?status=PENDING&limit=5"),
                    fetch("/api/leaves?status=HR_REVIEW&limit=5"),
                    fetch("/api/leaves?status=APPROVED&limit=1"),
                    fetch("/api/employees?limit=1"),
                ])
                const pending = pendingRes.ok ? await pendingRes.json() : null
                const hrReview = hrReviewRes.ok ? await hrReviewRes.json() : null
                const approved = approvedRes.ok ? await approvedRes.json() : null
                const emp = empRes.ok ? await empRes.json() : null

                setData({
                    pendingCount: pending?.meta?.total ?? 0,
                    hrReviewCount: hrReview?.meta?.total ?? 0,
                    approvedCount: approved?.meta?.total ?? 0,
                    totalEmployees: emp?.meta?.total ?? 0,
                    pendingLeaves: pending?.data ?? [],
                    hrReviewLeaves: hrReview?.data ?? [],
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

    return (
        <DashboardShell greeting={greeting} name={user.name} badge="HR Officer" badgeColor="#6366f1">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard label="Awaiting HR Review" value={loading ? "—" : data?.hrReviewCount ?? 0} icon={<Icons.Review />} accent="#6366f1" loading={loading} />
                <StatCard label="New Submissions" value={loading ? "—" : data?.pendingCount ?? 0} icon={<Icons.Pending />} accent="#f59e0b" loading={loading} />
                <StatCard label="Approved This Year" value={loading ? "—" : data?.approvedCount ?? 0} icon={<Icons.Approved />} accent="#10b981" loading={loading} />
                <StatCard label="Total Employees" value={loading ? "—" : data?.totalEmployees ?? 0} icon={<Icons.Users />} accent="#3b82f6" loading={loading} />
            </div>

            {/* HR Review Queue */}
            <div className="space-y-4">
                <SectionHeader
                    title="Your Review Queue"
                    subtitle="Leave applications assigned to HR"
                    action={<a href="/leave" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Manage →</a>}
                />
                <TableShell headers={["Employee", "Leave Type", "Period", "Days", "Applied", "Status"]} loading={loading} empty="Queue is clear">
                    {data?.hrReviewLeaves.map((l: any) => (
                        <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{l.user?.name ?? "—"}</td>
                            <td className="px-4 py-3 capitalize text-muted-foreground">{l.leave_type?.toLowerCase()}</td>
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

            {/* New submissions */}
            <div className="space-y-4">
                <SectionHeader title="New Submissions" subtitle="Freshly submitted, not yet in review" />
                <TableShell headers={["Employee", "Leave Type", "Period", "Days", "Status"]} loading={loading} empty="No new submissions">
                    {data?.pendingLeaves.map((l: any) => (
                        <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{l.user?.name ?? "—"}</td>
                            <td className="px-4 py-3 capitalize text-muted-foreground">{l.leave_type?.toLowerCase()}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                {new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{l.days}</td>
                            <td className="px-4 py-3"><LeaveStatusBadge status={l.status} /></td>
                        </tr>
                    ))}
                </TableShell>
            </div>
        </DashboardShell>
    )
}