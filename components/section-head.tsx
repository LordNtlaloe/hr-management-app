"use client"

import { DashboardUser } from "@/types/dashboard"
import { useEffect, useState } from "react"
import { DashboardShell, StatCard, SectionHeader, TableShell, LeaveStatusBadge } from "./general"

const Icons = {
    Team: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Awaiting: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Approved: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    OnLeave: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
}

export default function SectionHeadDashboard({ user }: { user: DashboardUser }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const [supervisorRes, approvedRes, empRes] = await Promise.all([
                    fetch("/api/leaves?status=SUPERVISOR_REVIEW&limit=10"),
                    fetch("/api/leaves?status=APPROVED&limit=5"),
                    fetch("/api/employees?isActive=true&limit=1"),
                ])
                const supervisor = supervisorRes.ok ? await supervisorRes.json() : null
                const approved = approvedRes.ok ? await approvedRes.json() : null
                const emp = empRes.ok ? await empRes.json() : null

                setData({
                    awaitingReview: supervisor?.meta?.total ?? 0,
                    approvedCount: approved?.meta?.total ?? 0,
                    teamSize: emp?.meta?.total ?? 0,
                    supervisorLeaves: supervisor?.data ?? [],
                    recentApproved: approved?.data ?? [],
                })
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const isHOD = user.role === "HEAD_OF_DEPARTMENT"
    const roleLabel = isHOD ? "Head of Department" : "Section Head"
    const greeting = new Date().getHours() < 12 ? "Good morning," : new Date().getHours() < 17 ? "Good afternoon," : "Good evening,"

    return (
        <DashboardShell greeting={greeting} name={user.name} badge={roleLabel} badgeColor="#8b5cf6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <StatCard label="Awaiting Your Review" value={loading ? "—" : data?.awaitingReview ?? 0} icon={<Icons.Awaiting />} accent="#8b5cf6" loading={loading} />
                <StatCard label="Approved Leaves" value={loading ? "—" : data?.approvedCount ?? 0} icon={<Icons.Approved />} accent="#10b981" loading={loading} />
                <StatCard label="Active Team Members" value={loading ? "—" : data?.teamSize ?? 0} icon={<Icons.Team />} accent="#3b82f6" loading={loading} />
            </div>

            {/* Review queue */}
            <div className="space-y-4">
                <SectionHeader
                    title="Awaiting Your Recommendation"
                    subtitle="Leave applications that require your supervisor sign-off"
                    action={<a href="/leave" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Review all →</a>}
                />
                <TableShell headers={["Employee", "Leave Type", "Period", "Days", "Applied", "Status"]} loading={loading} empty="No applications awaiting review">
                    {data?.supervisorLeaves.map((l: any) => (
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

            {/* Recently approved */}
            <div className="space-y-4">
                <SectionHeader title="Recently Approved" subtitle="Latest approved leave in your area" />
                <TableShell headers={["Employee", "Leave Type", "Period", "Days"]} loading={loading} empty="No recent approvals">
                    {data?.recentApproved.map((l: any) => (
                        <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{l.user?.name ?? "—"}</td>
                            <td className="px-4 py-3 capitalize text-muted-foreground">{l.leave_type?.toLowerCase()}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                {new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{l.days}</td>
                        </tr>
                    ))}
                </TableShell>
            </div>
        </DashboardShell>
    )
}