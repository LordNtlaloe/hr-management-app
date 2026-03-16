// app/leaves/rejected/page.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "@/lib/auth-client"
import { LeaveApplication, LeaveType } from "@/types/leaves"

import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS, formatDate, formatDateShort, getInitials } from "@/utils/leave-utils"
import { LeaveDetailDrawer } from "@/components/leaves/leave-details"
import { PageHeader, StatChip, FilterBar, TableShell, SkeletonRows, EmptyState, Pagination } from "@/components/leaves/shared-page-shell"

const TD: React.CSSProperties = {
    padding: "12px 16px",
    verticalAlign: "middle",
    borderBottom: "1px solid #F9FAFB",
    fontSize: 13,
    color: "#111827",
}

export default function RejectedLeavesPage() {
    const { data: session } = useSession()

    const [applications, setApplications] = useState<LeaveApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<LeaveType | "">("")
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
                const params = new URLSearchParams({ status: "REJECTED", limit: "500" })
                if (!isHR) params.set("userId", userId!)
                const res = await fetch(`/api/leaves?${params}`)
                const data = await res.json()
                if (data.success) {
                    setApplications(
                        [...data.data].sort(
                            (a: LeaveApplication, b: LeaveApplication) =>
                                new Date(b.rejected_at ?? b.applied_at).getTime() -
                                new Date(a.rejected_at ?? a.applied_at).getTime()
                        )
                    )
                }
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
        return list
    }, [applications, search, typeFilter])

    const totalPages = Math.ceil(filtered.length / LIMIT)
    const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT)

    const typeBreakdown = useMemo(() => {
        const map: Partial<Record<LeaveType, number>> = {}
        filtered.forEach((a) => { map[a.leave_type] = (map[a.leave_type] ?? 0) + 1 })
        return map
    }, [filtered])

    const headers = isHR
        ? ["Employee", "Leave Type", "Duration", "Days", "Rejected On", "Reason", ""]
        : ["Leave Type", "Duration", "Days", "Rejected On", "Reason", ""]

    return (
        <div style={{ padding: "28px 32px", fontFamily: "inherit" }}>
            <PageHeader
                title="Rejected Leaves"
                subtitle={`${filtered.length} rejected application${filtered.length !== 1 ? "s" : ""}`}
            />

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
                <StatChip label="Total Rejected" value={filtered.length} color="#B91C1C" bg="#FEF2F2" border="#FECACA" />
                {(Object.entries(typeBreakdown) as [LeaveType, number][]).map(([type, count]) => {
                    const c = LEAVE_TYPE_COLORS[type]
                    return (
                        <StatChip
                            key={type}
                            label={LEAVE_TYPE_LABELS[type]}
                            value={count}
                            color={c.text}
                            bg={c.bg}
                        />
                    )
                })}
            </div>

            <FilterBar
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1) }}
                typeFilter={typeFilter}
                onTypeChange={(v) => { setTypeFilter(v); setPage(1) }}
                showStatusFilter={false}
            />

            <TableShell headers={headers}>
                {loading ? (
                    <SkeletonRows cols={headers.length} />
                ) : paginated.length === 0 ? (
                    <tr>
                        <td colSpan={headers.length}>
                            <EmptyState
                                icon="✓"
                                heading="No rejected applications"
                                body={
                                    search || typeFilter
                                        ? "No rejections match your filters."
                                        : isHR
                                            ? "No employee leave requests have been rejected."
                                            : "None of your leave requests have been rejected."
                                }
                            />
                        </td>
                    </tr>
                ) : (
                    paginated.map((app) => {
                        const empName = app.employee?.users?.[0]?.name ?? app.user?.name ?? "—"
                        const empNum = app.employee?.employee_number ?? "—"
                        const section = app.employee?.section?.section_name
                        const colors = LEAVE_TYPE_COLORS[app.leave_type]

                        return (
                            <tr
                                key={app.id}
                                onClick={() => setSelected(app)}
                                style={{ cursor: "pointer" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FEF8F8")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                            >
                                {isHR && (
                                    <td style={TD}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div
                                                style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: "#FEE2E2", border: "1px solid #FECACA",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 10, fontWeight: 800, color: "#B91C1C", flexShrink: 0,
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
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: colors.bg, color: colors.text }}>
                                        {LEAVE_TYPE_LABELS[app.leave_type]}
                                    </span>
                                </td>
                                <td style={TD}>
                                    <div style={{ fontWeight: 500 }}>{formatDateShort(app.start_date)}</div>
                                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>→ {formatDateShort(app.end_date)}</div>
                                </td>
                                <td style={TD}>
                                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14, color: "#B91C1C" }}>
                                        {app.days}
                                    </span>
                                </td>
                                <td style={{ ...TD, fontSize: 12, color: "#9CA3AF" }}>
                                    {app.rejected_at ? formatDate(app.rejected_at) : formatDate(app.applied_at)}
                                </td>
                                <td style={{ ...TD, maxWidth: 200 }}>
                                    {app.rejection_reason ? (
                                        <span
                                            style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                fontSize: 12,
                                                color: "#7F1D1D",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {app.rejection_reason}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: 11, color: "#D1D5DB", fontStyle: "italic" }}>No reason given</span>
                                    )}
                                </td>
                                <td style={{ ...TD, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setSelected(app)}
                                        style={{
                                            padding: "5px 12px", border: "1px solid #FECACA", borderRadius: 5,
                                            background: "#FEF2F2", fontSize: 11, fontWeight: 600,
                                            cursor: "pointer", color: "#B91C1C", fontFamily: "inherit",
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
                    onRefresh={() => setSelected(null)}
                />
            )}
        </div>
    )
}