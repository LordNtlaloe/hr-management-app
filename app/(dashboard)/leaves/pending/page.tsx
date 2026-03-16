// app/leaves/pending/page.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "@/lib/auth-client"
import { LeaveApplication, LeaveStatus, LeaveType } from "@/types/leaves"
import { EmptyState, FilterBar, PageHeader, Pagination, SkeletonRows, StatChip, TableShell } from "@/components/leaves/shared-page-shell"
import { formatDate, formatDateShort, getInitials, LEAVE_TYPE_LABELS } from "@/utils/leave-utils"
import { LeaveStatusBadge } from "@/components/leaves/leave-status-badge"
import { LeaveDetailDrawer } from "@/components/leaves/leave-details"



const PENDING_STATUSES: LeaveStatus[] = ["PENDING", "HR_REVIEW", "SUPERVISOR_REVIEW", "FINAL_REVIEW"]

const STATUS_PRIORITY: Record<LeaveStatus, number> = {
    FINAL_REVIEW: 0,
    HR_REVIEW: 1,
    SUPERVISOR_REVIEW: 2,
    PENDING: 3,
    APPROVED: 4,
    REJECTED: 5,
}

const TD: React.CSSProperties = {
    padding: "12px 16px",
    verticalAlign: "middle",
    borderBottom: "1px solid #F9FAFB",
    fontSize: 13,
    color: "#111827",
}

export default function PendingLeavesPage() {
    const { data: session } = useSession()

    const [applications, setApplications] = useState<LeaveApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<LeaveType | "">("")
    const [statusFilter, setStatusFilter] = useState<LeaveStatus | "">("")
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState<LeaveApplication | null>(null)
    const LIMIT = 15

    const role = (session?.user as any)?.role ?? "EMPLOYEE"
    const isHR = role === "HR_OFFICER" || role === "ADMIN"
    const userId = session?.user?.id

    useEffect(() => {
        if (!userId) return
        async function load() {
            setLoading(true)
            try {
                const fetches = PENDING_STATUSES.map((s) => {
                    const p = new URLSearchParams({ status: s, limit: "200" })
                    if (!isHR) p.set("userId", userId!)
                    return fetch(`/api/leaves?${p}`).then((r) => r.json())
                })
                const results = await Promise.all(fetches)
                const merged: LeaveApplication[] = results
                    .filter((r) => r.success)
                    .flatMap((r) => r.data)
                merged.sort((a, b) => {
                    const pd = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
                    return pd !== 0 ? pd : new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
                })
                setApplications(merged)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userId, isHR])

    const filtered = useMemo(() => {
        let list = applications
        if (search) {
            const q = search.toLowerCase()
            list = list.filter((a) => {
                const name = a.employee?.users?.[0]?.name ?? a.user?.name ?? ""
                const num = a.employee?.employee_number ?? ""
                return name.toLowerCase().includes(q) || num.toLowerCase().includes(q)
            })
        }
        if (typeFilter) list = list.filter((a) => a.leave_type === typeFilter)
        if (statusFilter) list = list.filter((a) => a.status === statusFilter)
        return list
    }, [applications, search, typeFilter, statusFilter])

    const totalPages = Math.ceil(filtered.length / LIMIT)
    const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT)

    const counts = useMemo(() => ({
        total: filtered.length,
        finalReview: filtered.filter((a) => a.status === "FINAL_REVIEW").length,
        supervisorReview: filtered.filter((a) => a.status === "SUPERVISOR_REVIEW").length,
        hrReview: filtered.filter((a) => a.status === "HR_REVIEW").length,
        pending: filtered.filter((a) => a.status === "PENDING").length,
    }), [filtered])

    const headers = isHR
        ? ["Employee", "Leave Type", "Duration", "Days", "Status", "Applied", ""]
        : ["Leave Type", "Duration", "Days", "Status", "Applied", ""]

    return (
        <div style={{ padding: "28px 32px", fontFamily: "inherit" }}>
            <PageHeader
                title="Pending Leaves"
                subtitle={
                    counts.total > 0
                        ? `${counts.total} application${counts.total !== 1 ? "s" : ""} awaiting action`
                        : "No pending applications"
                }
            />

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
                <StatChip label="Total Pending" value={counts.total} color="#B45309" bg="#FFFBEB" border="#FDE68A" />
                <StatChip label="Final Review" value={counts.finalReview} color="#0369A1" bg="#F0F9FF" border="#BAE6FD" />
                <StatChip label="Supervisor Review" value={counts.supervisorReview} color="#5B21B6" bg="#F5F3FF" border="#DDD6FE" />
                <StatChip label="HR Review" value={counts.hrReview} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" />
                <StatChip label="New" value={counts.pending} color="#374151" bg="#F9FAFB" border="#E5E7EB" />
            </div>

            <FilterBar
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1) }}
                statusFilter={statusFilter}
                onStatusChange={(v) => { setStatusFilter(v); setPage(1) }}
                typeFilter={typeFilter}
                onTypeChange={(v) => { setTypeFilter(v); setPage(1) }}
                showStatusFilter
            />

            <TableShell headers={headers}>
                {loading ? (
                    <SkeletonRows cols={headers.length} />
                ) : paginated.length === 0 ? (
                    <tr>
                        <td colSpan={headers.length}>
                            <EmptyState
                                icon="⏳"
                                heading="No pending applications"
                                body={
                                    search || typeFilter || statusFilter
                                        ? "No results match your current filters."
                                        : isHR
                                            ? "All leave requests have been processed."
                                            : "You have no leave requests awaiting approval."
                                }
                            />
                        </td>
                    </tr>
                ) : (
                    paginated.map((app) => {
                        const empName = app.employee?.users?.[0]?.name ?? app.user?.name ?? "—"
                        const empNum = app.employee?.employee_number ?? "—"
                        const section = app.employee?.section?.section_name

                        return (
                            <tr
                                key={app.id}
                                onClick={() => setSelected(app)}
                                style={{ cursor: "pointer" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFAFA")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                            >
                                {isHR && (
                                    <td style={TD}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div
                                                style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: "#EEF2FF", border: "1px solid #C7D2FE",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 10, fontWeight: 800, color: "#4338CA", flexShrink: 0,
                                                }}
                                            >
                                                {getInitials(empName)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{empName}</div>
                                                <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                                                    {empNum}{section ? ` · ${section}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                )}
                                <td style={TD}>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#F3F4F6", color: "#374151" }}>
                                        {LEAVE_TYPE_LABELS[app.leave_type]}
                                    </span>
                                </td>
                                <td style={TD}>
                                    <div style={{ fontWeight: 500 }}>{formatDateShort(app.start_date)}</div>
                                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>→ {formatDateShort(app.end_date)}</div>
                                </td>
                                <td style={TD}>
                                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14 }}>
                                        {app.days}
                                    </span>
                                </td>
                                <td style={TD}><LeaveStatusBadge status={app.status} size="sm" /></td>
                                <td style={{ ...TD, fontSize: 12, color: "#9CA3AF" }}>{formatDate(app.applied_at)}</td>
                                <td style={{ ...TD, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setSelected(app)}
                                        style={{
                                            padding: "5px 12px", border: "1px solid #E5E7EB", borderRadius: 5,
                                            background: "#fff", fontSize: 11, fontWeight: 600,
                                            cursor: "pointer", color: "#374151", fontFamily: "inherit",
                                        }}
                                    >
                                        View →
                                    </button>
                                </td>
                            </tr>
                        )
                    })
                )}
            </TableShell>

            <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={LIMIT} onChange={setPage} />

            {selected && session?.user && (
                <LeaveDetailDrawer
                    application={selected}
                    role={role}
                    userId={session.user.id}
                    onClose={() => setSelected(null)}
                    onRefresh={() => { setSelected(null); setLoading(true) }}
                />
            )}
        </div>
    )
}