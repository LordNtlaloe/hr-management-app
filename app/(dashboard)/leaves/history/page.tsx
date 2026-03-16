// app/leaves/history/page.tsx
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

const TYPE_COLORS: Record<LeaveType, string> = {
    ANNUAL: "#3B82F6",
    SICK: "#8B5CF6",
    UNPAID: "#F59E0B",
    MATERNITY: "#EC4899",
}

function YearBadge({ dateStr }: { dateStr: string }) {
    const year = new Date(dateStr).getFullYear()
    const isCurrent = year === new Date().getFullYear()
    return (
        <span
            style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 3,
                background: isCurrent ? "#F0FDF4" : "#F3F4F6",
                color: isCurrent ? "#15803D" : "#6B7280",
                border: `1px solid ${isCurrent ? "#BBF7D0" : "#E5E7EB"}`,
                fontFamily: "'DM Mono', monospace",
            }}
        >
            {year}
        </span>
    )
}

export default function LeaveHistoryPage() {
    const { data: session } = useSession()

    const [applications, setApplications] = useState<LeaveApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<LeaveType | "">("")
    const [yearFilter, setYearFilter] = useState<number | "">("")
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState<LeaveApplication | null>(null)
    const LIMIT = 20

    const role = (session?.user as any)?.role ?? "EMPLOYEE"
    const isHR = role === "HR_OFFICER" || role === "ADMIN"
    const userId = session?.user?.id

    useEffect(() => {
        if (!userId) return
        async function load() {
            setLoading(true)
            try {
                const params = new URLSearchParams({ status: "APPROVED", limit: "1000" })
                if (!isHR) params.set("userId", userId!)
                const res = await fetch(`/api/leaves?${params}`)
                const data = await res.json()
                if (data.success) {
                    setApplications(
                        [...data.data].sort(
                            (a: LeaveApplication, b: LeaveApplication) =>
                                new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
                        )
                    )
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userId, isHR])

    const availableYears = useMemo(() => {
        const years = new Set(applications.map((a) => new Date(a.start_date).getFullYear()))
        return Array.from(years).sort((a, b) => b - a)
    }, [applications])

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
        if (yearFilter) list = list.filter((a) => new Date(a.start_date).getFullYear() === yearFilter)
        return list
    }, [applications, search, typeFilter, yearFilter])

    const totalPages = Math.ceil(filtered.length / LIMIT)
    const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT)

    const stats = useMemo(() => ({
        count: filtered.length,
        totalDays: filtered.reduce((s, a) => s + a.days, 0),
        annualDays: filtered.filter((a) => a.leave_type === "ANNUAL").reduce((s, a) => s + a.days, 0),
        sickDays: filtered.filter((a) => a.leave_type === "SICK").reduce((s, a) => s + a.days, 0),
        uniqueEmps: new Set(filtered.map((a) => a.employee?.id ?? a.user?.id)).size,
    }), [filtered])

    const headers = isHR
        ? ["Employee", "Leave Type", "Period", "Days Taken", "Approved By", "Year", ""]
        : ["Leave Type", "Period", "Days Taken", "Approved By", "Year", ""]

    return (
        <div style={{ padding: "28px 32px", fontFamily: "inherit" }}>
            <PageHeader
                title="Leave History"
                subtitle="Complete record of all approved leave taken"
                actions={
                    availableYears.length > 0 ? (
                        <select
                            value={yearFilter}
                            onChange={(e) => { setYearFilter(e.target.value ? parseInt(e.target.value) : ""); setPage(1) }}
                            style={{
                                padding: "6px 11px",
                                border: "1px solid #E5E7EB",
                                borderRadius: 6,
                                fontSize: 12,
                                background: "#fff",
                                fontFamily: "inherit",
                                cursor: "pointer",
                                color: yearFilter ? "#111827" : "#6B7280",
                            }}
                        >
                            <option value="">All Years</option>
                            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    ) : undefined
                }
            />

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
                <StatChip label="Total Records" value={stats.count} />
                <StatChip label="Total Days" value={stats.totalDays} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" />
                <StatChip label="Annual Days" value={stats.annualDays} color="#15803D" bg="#F0FDF4" border="#BBF7D0" />
                <StatChip label="Sick Days" value={stats.sickDays} color="#5B21B6" bg="#F5F3FF" border="#DDD6FE" />
                {isHR && <StatChip label="Employees" value={stats.uniqueEmps} color="#374151" bg="#F9FAFB" border="#E5E7EB" />}
            </div>

            {/* Breakdown bar */}
            {stats.totalDays > 0 && (
                <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7 }}>
                        Leave type breakdown
                    </div>
                    <div style={{ height: 7, borderRadius: 4, overflow: "hidden", background: "#F3F4F6", display: "flex" }}>
                        {(Object.keys(TYPE_COLORS) as LeaveType[]).map((t) => {
                            const days = filtered.filter((a) => a.leave_type === t).reduce((s, a) => s + a.days, 0)
                            const pct = stats.totalDays > 0 ? (days / stats.totalDays) * 100 : 0
                            if (pct === 0) return null
                            return (
                                <div
                                    key={t}
                                    title={`${LEAVE_TYPE_LABELS[t]}: ${days} days`}
                                    style={{ width: `${pct}%`, height: "100%", background: TYPE_COLORS[t] }}
                                />
                            )
                        })}
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                        {(Object.keys(TYPE_COLORS) as LeaveType[]).map((t) => {
                            const days = filtered.filter((a) => a.leave_type === t).reduce((s, a) => s + a.days, 0)
                            if (days === 0) return null
                            return (
                                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: TYPE_COLORS[t], flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: "#6B7280" }}>{LEAVE_TYPE_LABELS[t]}</span>
                                    <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#111827" }}>{days}d</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

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
                                icon="◈"
                                heading="No leave history"
                                body={
                                    search || typeFilter || yearFilter
                                        ? "No approved leaves match your current filters."
                                        : isHR
                                            ? "No approved leave has been recorded yet."
                                            : "You have no approved leave history yet."
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
                        const approvedBy = app.partD?.filled_by?.name ?? app.partD?.approver_signature ?? "—"

                        return (
                            <tr
                                key={app.id}
                                onClick={() => setSelected(app)}
                                style={{ cursor: "pointer" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F8FFF9")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                            >
                                {isHR && (
                                    <td style={TD}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div
                                                style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: "#F0FDF4", border: "1px solid #BBF7D0",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 10, fontWeight: 800, color: "#15803D", flexShrink: 0,
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
                                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14, color: "#15803D" }}>
                                        {app.days}
                                    </span>
                                    <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4 }}>days</span>
                                </td>
                                <td style={{ ...TD, fontSize: 12, color: "#6B7280" }}>{approvedBy}</td>
                                <td style={TD}><YearBadge dateStr={app.start_date} /></td>
                                <td style={{ ...TD, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setSelected(app)}
                                        style={{
                                            padding: "5px 12px", border: "1px solid #BBF7D0", borderRadius: 5,
                                            background: "#F0FDF4", fontSize: 11, fontWeight: 600,
                                            cursor: "pointer", color: "#15803D", fontFamily: "inherit",
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