// app/leaves/analytics/page.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "@/lib/auth-client"
import { LeaveApplication, LeaveBalance, LeaveType, LeaveStatus } from "@/types/leaves"
import { LEAVE_TYPE_LABELS } from "@/utils/leave-utils"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
    RadialBarChart, RadialBar,
} from "recharts"

// ─── Constants ────────────────────────────────────────────────────────────────

const LEAVE_COLORS: Record<LeaveType, string> = {
    ANNUAL: "#3B82F6",
    SICK: "#8B5CF6",
    UNPAID: "#F59E0B",
    MATERNITY: "#EC4899",
}

const STATUS_COLORS: Record<LeaveStatus, string> = {
    PENDING: "#D97706",
    HR_REVIEW: "#3B82F6",
    SUPERVISOR_REVIEW: "#7C3AED",
    FINAL_REVIEW: "#0284C7",
    APPROVED: "#16A34A",
    REJECTED: "#DC2626",
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function Card({
    title,
    subtitle,
    children,
    span = 1,
}: {
    title: string
    subtitle?: string
    children: React.ReactNode
    span?: 1 | 2 | 3
}) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: "20px 22px",
                gridColumn: `span ${span}`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
                    {title}
                </div>
                {subtitle && (
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{subtitle}</div>
                )}
            </div>
            {children}
        </div>
    )
}

// ─── KPI tile ─────────────────────────────────────────────────────────────────

function KPI({
    label,
    value,
    sub,
    color = "#111827",
    bg = "#F9FAFB",
    border = "#E5E7EB",
    trend,
}: {
    label: string
    value: string | number
    sub?: string
    color?: string
    bg?: string
    border?: string
    trend?: { direction: "up" | "down" | "neutral"; text: string }
}) {
    const trendColor =
        trend?.direction === "up" ? "#16A34A" :
            trend?.direction === "down" ? "#DC2626" : "#6B7280"

    return (
        <div
            style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 10,
                padding: "16px 18px",
                flex: 1,
                minWidth: 120,
            }}
        >
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                {label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'DM Mono','Fira Code',monospace", color, lineHeight: 1, letterSpacing: "-0.04em" }}>
                {value}
            </div>
            {sub && <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{sub}</div>}
            {trend && (
                <div style={{ fontSize: 10, fontWeight: 600, color: trendColor, marginTop: 6, display: "flex", alignItems: "center", gap: 3 }}>
                    {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}
                    {trend.text}
                </div>
            )}
        </div>
    )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: "#111827", border: "none", borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
            {label && <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>{label}</div>}
            {payload.map((p: any) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#F9FAFB", marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill ?? p.color, flexShrink: 0 }} />
                    <span style={{ color: "#9CA3AF" }}>{p.name}:</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{p.value}</span>
                </div>
            ))}
        </div>
    )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton({ height = 200 }: { height?: number }) {
    return (
        <div style={{ height, background: "linear-gradient(90deg,#F9FAFB 25%,#F3F4F6 50%,#F9FAFB 75%)", backgroundSize: "400px 100%", borderRadius: 8, animation: "shimmer 1.4s ease infinite" }} />
    )
}

// ─── Top employees table ──────────────────────────────────────────────────────

function TopEmployeesTable({ data }: { data: { name: string; section: string; days: number; count: number }[] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {data.slice(0, 6).map((row, i) => (
                <div
                    key={row.name}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom: i < data.slice(0, 6).length - 1 ? "1px solid #F3F4F6" : "none",
                    }}
                >
                    <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: i === 0 ? "#FEF3C7" : i === 1 ? "#F3F4F6" : "#F9FAFB",
                        border: `1px solid ${i === 0 ? "#FDE68A" : "#E5E7EB"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800,
                        color: i === 0 ? "#B45309" : "#6B7280",
                        flexShrink: 0,
                    }}>
                        {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</div>
                        <div style={{ fontSize: 10, color: "#9CA3AF" }}>{row.section}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#111827" }}>{row.days}d</div>
                        <div style={{ fontSize: 10, color: "#9CA3AF" }}>{row.count} req</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Section breakdown rows ───────────────────────────────────────────────────

function SectionRow({ name, days, total, color }: { name: string; days: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((days / total) * 100) : 0
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{name}</span>
                <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: "#111827" }}>{days}d <span style={{ color: "#9CA3AF", fontWeight: 400 }}>({pct}%)</span></span>
            </div>
            <div style={{ height: 5, background: "#F3F4F6", borderRadius: 3 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeaveAnalyticsPage() {
    const { data: session } = useSession()

    const [allApps, setAllApps] = useState<LeaveApplication[]>([])
    const [balances, setBalances] = useState<(LeaveBalance & { name: string; section: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [year, setYear] = useState(new Date().getFullYear())

    const role = (session?.user as any)?.role ?? "EMPLOYEE"
    const isHR = role === "HR_OFFICER" || role === "ADMIN"
    const userId = session?.user?.id
    const employeeId = (session?.user as any)?.employeeId as number | undefined

    useEffect(() => {
        if (!userId) return
        async function load() {
            setLoading(true)
            try {
                // Fetch all statuses in parallel
                const statuses: LeaveStatus[] = ["APPROVED", "REJECTED", "PENDING", "HR_REVIEW", "SUPERVISOR_REVIEW", "FINAL_REVIEW"]
                const fetches = statuses.map((s) => {
                    const p = new URLSearchParams({ status: s, limit: "1000" })
                    if (!isHR) p.set("userId", userId!)
                    return fetch(`/api/leaves?${p}`).then((r) => r.json())
                })
                const results = await Promise.all(fetches)
                const merged: LeaveApplication[] = results.filter((r) => r.success).flatMap((r) => r.data)
                setAllApps(merged)

                // Fetch balances
                if (isHR) {
                    const empRes = await fetch("/api/employees?limit=500")
                    const empData = await empRes.json()
                    if (empData.success) {
                        const balFetches = empData.data.map((e: any) =>
                            fetch(`/api/leave-balance?employeeId=${e.id}&year=${year}`)
                                .then((r) => r.json())
                                .then((d) => d.success ? { ...d.data, name: e.users?.[0]?.name ?? "—", section: e.section?.section_name ?? "—" } : null)
                        )
                        const bals = (await Promise.all(balFetches)).filter(Boolean)
                        setBalances(bals)
                    }
                } else if (employeeId) {
                    const res = await fetch(`/api/leave-balance?employeeId=${employeeId}&year=${year}`)
                    const data = await res.json()
                    if (data.success) setBalances([{ ...data.data, name: session?.user?.name ?? "", section: "" }])
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userId, isHR, year, employeeId])

    // ── Derived analytics ─────────────────────────────────────────────────────

    const yearApps = useMemo(
        () => allApps.filter((a) => new Date(a.start_date).getFullYear() === year),
        [allApps, year]
    )

    const approved = useMemo(() => yearApps.filter((a) => a.status === "APPROVED"), [yearApps])
    const rejected = useMemo(() => yearApps.filter((a) => a.status === "REJECTED"), [yearApps])
    const pending = useMemo(() => yearApps.filter((a) => ["PENDING", "HR_REVIEW", "SUPERVISOR_REVIEW", "FINAL_REVIEW"].includes(a.status)), [yearApps])

    // Monthly applications (line chart)
    const monthlyData = useMemo(() => {
        return MONTHS.map((month, i) => {
            const monthApps = yearApps.filter((a) => new Date(a.applied_at).getMonth() === i)
            return {
                month,
                Applied: monthApps.length,
                Approved: monthApps.filter((a) => a.status === "APPROVED").length,
                Rejected: monthApps.filter((a) => a.status === "REJECTED").length,
            }
        })
    }, [yearApps])

    // Monthly days taken (area chart — approved only)
    const monthlyDays = useMemo(() => {
        return MONTHS.map((month, i) => {
            const monthApps = approved.filter((a) => new Date(a.start_date).getMonth() === i)
            return {
                month,
                Annual: monthApps.filter((a) => a.leave_type === "ANNUAL").reduce((s, a) => s + a.days, 0),
                Sick: monthApps.filter((a) => a.leave_type === "SICK").reduce((s, a) => s + a.days, 0),
                Unpaid: monthApps.filter((a) => a.leave_type === "UNPAID").reduce((s, a) => s + a.days, 0),
                Maternity: monthApps.filter((a) => a.leave_type === "MATERNITY").reduce((s, a) => s + a.days, 0),
            }
        })
    }, [approved])

    // Leave type pie
    const leaveTypePie = useMemo(() => {
        return (Object.keys(LEAVE_COLORS) as LeaveType[]).map((t) => ({
            name: LEAVE_TYPE_LABELS[t],
            value: approved.filter((a) => a.leave_type === t).reduce((s, a) => s + a.days, 0),
            color: LEAVE_COLORS[t],
        })).filter((d) => d.value > 0)
    }, [approved])

    // Status distribution (radial)
    const statusDist = useMemo(() => {
        const statuses: LeaveStatus[] = ["APPROVED", "REJECTED", "PENDING", "HR_REVIEW", "SUPERVISOR_REVIEW", "FINAL_REVIEW"]
        return statuses
            .map((s) => ({
                name: s.replace(/_/g, " "),
                value: yearApps.filter((a) => a.status === s).length,
                fill: STATUS_COLORS[s],
            }))
            .filter((d) => d.value > 0)
    }, [yearApps])

    // Top employees by days taken
    const topEmployees = useMemo(() => {
        const map = new Map<string, { name: string; section: string; days: number; count: number }>()
        approved.forEach((a) => {
            const name = a.employee?.users?.[0]?.name ?? a.user?.name ?? "—"
            const section = a.employee?.section?.section_name ?? "—"
            const key = name
            const existing = map.get(key)
            if (existing) {
                existing.days += a.days
                existing.count += 1
            } else {
                map.set(key, { name, section, days: a.days, count: 1 })
            }
        })
        return Array.from(map.values()).sort((a, b) => b.days - a.days)
    }, [approved])

    // Section breakdown
    const sectionBreakdown = useMemo(() => {
        const map = new Map<string, number>()
        approved.forEach((a) => {
            const sec = a.employee?.section?.section_name ?? "No Section"
            map.set(sec, (map.get(sec) ?? 0) + a.days)
        })
        const total = Array.from(map.values()).reduce((s, v) => s + v, 0)
        const palette = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#10B981", "#F97316", "#6366F1"]
        return Array.from(map.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([name, days], i) => ({ name, days, total, color: palette[i % palette.length] }))
    }, [approved])

    // Weekly pattern (day-of-week bar)
    const dowData = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        const counts = new Array(7).fill(0)
        approved.forEach((a) => {
            const dow = (new Date(a.start_date).getDay() + 6) % 7 // Mon=0
            counts[dow]++
        })
        return days.map((d, i) => ({ day: d, Starts: counts[i] }))
    }, [approved])

    // Balance overview (radial for employee, aggregates for HR)
    const balanceSummary = useMemo(() => {
        if (!balances.length) return null
        return {
            avgAnnualUsed: Math.round(balances.reduce((s, b) => s + b.annual_used, 0) / balances.length),
            avgAnnualRemaining: Math.round(balances.reduce((s, b) => s + b.annual_remaining, 0) / balances.length),
            totalUnpaid: balances.reduce((s, b) => s + b.unpaid_used, 0),
            totalMaternity: balances.reduce((s, b) => s + b.maternity_used, 0),
            lowBalanceCount: balances.filter((b) => b.annual_remaining <= Math.round(b.annual_total * 0.2)).length,
        }
    }, [balances])

    // KPIs
    const totalDays = approved.reduce((s, a) => s + a.days, 0)
    const approvalRate = yearApps.length > 0 ? Math.round((approved.length / (approved.length + rejected.length || 1)) * 100) : 0
    const avgDuration = approved.length > 0 ? (totalDays / approved.length).toFixed(1) : "0"
    const currentYear = new Date().getFullYear()

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <style>{`
                @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
                .analytics-page { animation: fadeUp 0.3s ease both }
            `}</style>

            <div className="analytics-page" style={{ padding: "28px 32px", fontFamily: "inherit", background: "#F9FAFB", minHeight: "100vh" }}>

                {/* ── Page header ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>
                            Leave Analytics
                        </h1>
                        <p style={{ margin: "5px 0 0", fontSize: 13, color: "#6B7280" }}>
                            {isHR ? "Organisation-wide leave intelligence" : "Your personal leave overview"} · {year}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#6B7280" }}>Year:</span>
                        {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                            <button
                                key={y}
                                onClick={() => setYear(y)}
                                style={{
                                    padding: "5px 12px",
                                    border: `1px solid ${year === y ? "#111827" : "#E5E7EB"}`,
                                    borderRadius: 5,
                                    background: year === y ? "#111827" : "#fff",
                                    color: year === y ? "#fff" : "#374151",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                }}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── KPI strip ── */}
                <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                    <KPI label="Total Applications" value={yearApps.length} sub={`in ${year}`} />
                    <KPI label="Approved" value={approved.length} color="#15803D" bg="#F0FDF4" border="#BBF7D0" sub={`${approvalRate}% approval rate`} />
                    <KPI label="Rejected" value={rejected.length} color="#B91C1C" bg="#FEF2F2" border="#FECACA" />
                    <KPI label="Pending" value={pending.length} color="#B45309" bg="#FFFBEB" border="#FDE68A" sub="awaiting action" />
                    <KPI label="Total Days Off" value={totalDays} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" sub="approved days" />
                    <KPI label="Avg Duration" value={`${avgDuration}d`} color="#374151" bg="#F9FAFB" border="#E5E7EB" sub="per application" />
                    {balanceSummary && isHR && (
                        <KPI label="Low Balance" value={balanceSummary.lowBalanceCount} color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" sub="employees ≤ 20% remaining" />
                    )}
                </div>

                {/* ── Charts grid ── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 16,
                    }}
                >

                    {/* 1. Monthly applications line chart — full width */}
                    <Card title="Monthly Applications" subtitle="Applications submitted, approved and rejected by month" span={3}>
                        {loading ? <ChartSkeleton height={240} /> : (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={monthlyData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: "#6B7280", paddingTop: 8 }} />
                                    <Line type="monotone" dataKey="Applied" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: "#6366F1" }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="Approved" stroke="#16A34A" strokeWidth={2} dot={{ r: 3, fill: "#16A34A" }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="Rejected" stroke="#DC2626" strokeWidth={2} dot={{ r: 3, fill: "#DC2626" }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    {/* 2. Monthly days taken — stacked area — 2 cols */}
                    <Card title="Days Taken by Month" subtitle="Approved leave days stacked by type" span={2}>
                        {loading ? <ChartSkeleton height={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={monthlyDays} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                                    <defs>
                                        {(Object.entries(LEAVE_COLORS) as [LeaveType, string][]).map(([t, c]) => (
                                            <linearGradient key={t} id={`grad-${t}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                                                <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: "#6B7280", paddingTop: 8 }} />
                                    {(Object.keys(LEAVE_COLORS) as LeaveType[]).map((t) => (
                                        <Area
                                            key={t}
                                            type="monotone"
                                            dataKey={t.charAt(0) + t.slice(1).toLowerCase()}
                                            stackId="1"
                                            stroke={LEAVE_COLORS[t]}
                                            fill={`url(#grad-${t})`}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    {/* 3. Leave type donut — 1 col */}
                    <Card title="Leave Type Split" subtitle="Total approved days by type">
                        {loading ? <ChartSkeleton height={220} /> : leaveTypePie.length === 0 ? (
                            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 13 }}>No approved data</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={leaveTypePie}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={78}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {leaveTypePie.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {leaveTypePie.map((d) => (
                                        <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: 12, color: "#374151" }}>{d.name}</span>
                                            </div>
                                            <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: "#111827" }}>{d.value}d</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>

                    {/* 4. Status distribution — bar chart — 1 col */}
                    <Card title="Status Distribution" subtitle="All applications by current status">
                        {loading ? <ChartSkeleton height={240} /> : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart
                                    data={statusDist}
                                    layout="vertical"
                                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                                    barSize={14}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={110} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                                        {statusDist.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    {/* 5. Day-of-week pattern — 1 col */}
                    <Card title="Leave Start Day Pattern" subtitle="Which day of the week leave most commonly starts">
                        {loading ? <ChartSkeleton height={240} /> : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={dowData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="Starts" fill="#6366F1" radius={[4, 4, 0, 0]}>
                                        {dowData.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={entry.Starts === Math.max(...dowData.map((d) => d.Starts)) ? "#4F46E5" : "#C7D2FE"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    {/* 6. Top employees — 1 col (HR only) / Balance card (employee) */}
                    {isHR ? (
                        <Card title="Top Leave Takers" subtitle={`Employees with most approved days in ${year}`}>
                            {loading ? <ChartSkeleton height={240} /> : topEmployees.length === 0 ? (
                                <div style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No data</div>
                            ) : (
                                <TopEmployeesTable data={topEmployees} />
                            )}
                        </Card>
                    ) : (
                        /* Employee own balance radial */
                        <Card title="Your Leave Balance" subtitle={`${year} entitlements`}>
                            {loading || !balances[0] ? <ChartSkeleton height={240} /> : (
                                <>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <RadialBarChart
                                            cx="50%" cy="50%"
                                            innerRadius={30} outerRadius={75}
                                            data={[
                                                { name: "Annual", value: Math.round((balances[0].annual_used / balances[0].annual_total) * 100), fill: "#3B82F6" },
                                                { name: "Sick", value: Math.round((balances[0].sick_used / balances[0].sick_total) * 100), fill: "#8B5CF6" },
                                            ]}
                                            startAngle={180} endAngle={-180}
                                        >
                                            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#F3F4F6" }} />
                                            <Tooltip content={<ChartTooltip />} formatter={(v: any) => [`${v}%`, "Used"]} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                        {[
                                            { label: "Annual Remaining", value: balances[0].annual_remaining, total: balances[0].annual_total, color: "#3B82F6" },
                                            { label: "Sick Remaining", value: balances[0].sick_remaining, total: balances[0].sick_total, color: "#8B5CF6" },
                                        ].map((item) => (
                                            <div key={item.label} style={{ background: "#F9FAFB", borderRadius: 7, padding: "10px 12px", border: "1px solid #E5E7EB" }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{item.label}</div>
                                                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'DM Mono',monospace", color: item.color }}>{item.value}</div>
                                                <div style={{ fontSize: 10, color: "#9CA3AF" }}>of {item.total}</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </Card>
                    )}

                    {/* 7. Section breakdown — 2 cols (HR only) */}
                    {isHR && sectionBreakdown.length > 0 && (
                        <Card title="Days Taken by Section" subtitle="Total approved days per department/section" span={2}>
                            {loading ? <ChartSkeleton height={200} /> : (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                                    {sectionBreakdown.map((s) => (
                                        <SectionRow key={s.name} name={s.name} days={s.days} total={s.total} color={s.color} />
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    {/* 8. Balance overview — 1 col (HR) */}
                    {isHR && balanceSummary && (
                        <Card title="Balance Overview" subtitle={`Avg entitlement usage across all employees · ${year}`}>
                            {loading ? <ChartSkeleton height={200} /> : (
                                <>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <RadialBarChart
                                            cx="50%" cy="50%"
                                            innerRadius={28} outerRadius={72}
                                            data={[
                                                { name: "Annual Used", value: balanceSummary.avgAnnualUsed, fill: "#3B82F6" },
                                                { name: "Annual Left", value: balanceSummary.avgAnnualRemaining, fill: "#BBF7D0" },
                                            ]}
                                            startAngle={180} endAngle={-180}
                                        >
                                            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#F3F4F6" }} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 10 }} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {[
                                            { label: "Avg Annual Used", value: `${balanceSummary.avgAnnualUsed}d`, color: "#1D4ED8" },
                                            { label: "Avg Annual Remaining", value: `${balanceSummary.avgAnnualRemaining}d`, color: "#15803D" },
                                            { label: "Total Unpaid Days", value: `${balanceSummary.totalUnpaid}d`, color: "#B45309" },
                                            { label: "Total Maternity Days", value: `${balanceSummary.totalMaternity}d`, color: "#BE185D" },
                                        ].map((item) => (
                                            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                                                <span style={{ fontSize: 12, color: "#374151" }}>{item.label}</span>
                                                <span style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: item.color }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </Card>
                    )}

                    {/* 9. Approval rate over months — 1 col */}
                    <Card title="Monthly Approval Rate" subtitle="% of submitted applications approved per month">
                        {loading ? <ChartSkeleton height={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={monthlyData.map((m) => ({
                                        month: m.month,
                                        "Rate %": m.Applied > 0 ? Math.round((m.Approved / m.Applied) * 100) : 0,
                                    }))}
                                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                                    barSize={18}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} unit="%" />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="Rate %" fill="#10B981" radius={[4, 4, 0, 0]}>
                                        {monthlyData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    monthlyData[i].Applied === 0 ? "#E5E7EB" :
                                                        monthlyData[i].Approved / monthlyData[i].Applied >= 0.8 ? "#10B981" :
                                                            monthlyData[i].Approved / monthlyData[i].Applied >= 0.5 ? "#F59E0B" : "#EF4444"
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    {/* 10. Leave duration distribution — 1 col */}
                    <Card title="Duration Distribution" subtitle="How many days most applications span">
                        {loading ? <ChartSkeleton height={220} /> : (() => {
                            const buckets = [
                                { label: "1d", min: 1, max: 1 },
                                { label: "2–3d", min: 2, max: 3 },
                                { label: "4–5d", min: 4, max: 5 },
                                { label: "1–2w", min: 6, max: 14 },
                                { label: "2w+", min: 15, max: Infinity },
                            ]
                            const data = buckets.map((b) => ({
                                label: b.label,
                                Count: approved.filter((a) => a.days >= b.min && a.days <= b.max).length,
                            }))
                            return (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={28}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="Count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        })()}
                    </Card>

                    {/* 11. Quarter comparison — 1 col */}
                    <Card title="Quarterly Breakdown" subtitle="Applications and days taken per quarter">
                        {loading ? <ChartSkeleton height={220} /> : (() => {
                            const quarters = [
                                { label: "Q1", months: [0, 1, 2] },
                                { label: "Q2", months: [3, 4, 5] },
                                { label: "Q3", months: [6, 7, 8] },
                                { label: "Q4", months: [9, 10, 11] },
                            ]
                            const data = quarters.map((q) => {
                                const qApps = approved.filter((a) => q.months.includes(new Date(a.start_date).getMonth()))
                                return {
                                    label: q.label,
                                    Applications: qApps.length,
                                    "Days Off": qApps.reduce((s, a) => s + a.days, 0),
                                }
                            })
                            return (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={18} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11, color: "#6B7280", paddingTop: 8 }} />
                                        <Bar dataKey="Applications" fill="#6366F1" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="Days Off" fill="#A5B4FC" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        })()}
                    </Card>

                </div>
            </div>
        </>
    )
}