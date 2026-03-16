// app/leaves/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "@/lib/auth-client"
import { LeaveApplication, LeaveBalance, LeaveStatus, LeaveType, Role } from "@/types/leaves"
import { LEAVE_TYPE_LABELS, STATUS_META } from "@/utils/leave-utils"
import { LeaveBalanceCards } from "@/components/leaves/leave-balance-card"
import { LeaveTable } from "@/components/leaves/leave-table"
import { HRReviewModal } from "@/components/leaves/hr-review-modal"
import { ApplyLeaveModal } from "@/components/leaves/apply-modal"
import { LeaveDetailDrawer } from "@/components/leaves/leave-details"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingScreen() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F9FAFB",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    border: "3px solid #E5E7EB",
                    borderTopColor: "#111827",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Loading your session…</p>
        </div>
    )
}

function AccessDenied() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F9FAFB",
                flexDirection: "column",
                gap: 10,
            }}
        >
            <div style={{ fontSize: 40 }}>🔒</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>Access Denied</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>
                You don't have permission to view this page.
            </div>
        </div>
    )
}

function HRStatStrip({ applications }: { applications: LeaveApplication[] }) {
    const counts = Object.fromEntries(
        (Object.keys(STATUS_META) as LeaveStatus[]).map((s) => [
            s,
            applications.filter((a) => a.status === s).length,
        ])
    ) as Record<LeaveStatus, number>

    return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(Object.entries(counts) as [LeaveStatus, number][]).map(([status, count]) => {
                const meta = STATUS_META[status]
                return (
                    <div
                        key={status}
                        style={{
                            background: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: 10,
                            padding: "14px 18px",
                            flex: 1,
                            minWidth: 100,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                                background: meta.dot,
                                opacity: 0.6,
                            }}
                        />
                        <div
                            style={{
                                fontSize: 26,
                                fontWeight: 700,
                                fontFamily: "'DM Mono', monospace",
                                color: meta.color,
                                lineHeight: 1,
                            }}
                        >
                            {count}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", marginTop: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            {meta.label}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeavesPage() {
    const { data: session, isPending } = useSession()

    // Applications state
    const [applications, setApplications] = useState<LeaveApplication[]>([])
    const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: 15, total: 0, totalPages: 1 })
    const [balance, setBalance] = useState<LeaveBalance | null>(null)
    const [loadingApps, setLoadingApps] = useState(false)

    // Filter state
    const [filterStatus, setFilterStatus] = useState<LeaveStatus | "">("")
    const [filterType, setFilterType] = useState<LeaveType | "">("")
    const [page, setPage] = useState(1)

    // Modal / drawer state
    const [showApply, setShowApply] = useState(false)
    const [reviewTarget, setReviewTarget] = useState<LeaveApplication | null>(null)
    const [drawerApp, setDrawerApp] = useState<LeaveApplication | null>(null)

    // ── Derived from session ──────────────────────────────────────────────────

    const user = session?.user
    const role = (user?.role ?? "EMPLOYEE") as Role
    const isHR = role === "HR_OFFICER" || role === "ADMIN"
    const isEmployee = role === "EMPLOYEE"
    const isAllowed = isHR || isEmployee

    // Employee record attached to the user (if any)
    // In your schema, User has an optional employeeId field
    const employeeId = (user as any)?.employeeId as number | undefined

    // ── Data fetching ─────────────────────────────────────────────────────────

    const fetchApplications = useCallback(async () => {
        if (!user) return
        setLoadingApps(true)
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(meta.limit),
            })
            if (filterStatus) params.set("status", filterStatus)
            if (filterType) params.set("leave_type", filterType)

            // Employees only see their own; HR sees all
            if (isEmployee) params.set("userId", user.id)

            const res = await fetch(`/api/leaves?${params}`)
            const data = await res.json()
            if (data.success) {
                setApplications(data.data)
                setMeta(data.meta)
            }
        } finally {
            setLoadingApps(false)
        }
    }, [user, page, filterStatus, filterType, isEmployee, meta.limit])

    const fetchBalance = useCallback(async () => {
        if (!employeeId) return
        const res = await fetch(`/api/leave-balance?employeeId=${employeeId}`)
        const data = await res.json()
        if (data.success) setBalance(data.data)
    }, [employeeId])

    useEffect(() => {
        if (isAllowed && user) {
            fetchApplications()
            if (isEmployee) fetchBalance()
        }
    }, [isAllowed, user, fetchApplications, fetchBalance, isEmployee])

    // Re-fetch when filters or page change
    useEffect(() => {
        if (isAllowed && user) fetchApplications()
    }, [filterStatus, filterType, page])

    // ── Guards ────────────────────────────────────────────────────────────────

    if (isPending) return <LoadingScreen />
    if (!user || !isAllowed) return <AccessDenied />

    // ── Handlers ──────────────────────────────────────────────────────────────

    function handleApplySuccess(newApp: LeaveApplication) {
        setApplications((prev) => [newApp, ...prev])
        fetchBalance()
    }

    function handleReviewSuccess() {
        fetchApplications()
        setReviewTarget(null)
    }

    function handleRefresh() {
        fetchApplications()
        if (isEmployee) fetchBalance()
    }

    // ── Render ────────────────────────────────────────────────────────────────

    const pendingCount = applications.filter(
        (a) => a.status === "PENDING" || a.status === "HR_REVIEW"
    ).length

    return (
        <>
            <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Geist', 'DM Sans', sans-serif; }
        select:focus, input:focus { outline: 2px solid #3B82F6; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }
      `}</style>

            <div style={{ background: "#F9FAFB", minHeight: "100vh" }}>
                {/* ── Top nav bar ── */}
                <header
                    style={{
                        background: "#111827",
                        color: "#fff",
                        padding: "0 28px",
                        height: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "sticky",
                        top: 0,
                        zIndex: 30,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 30,
                                height: 30,
                                background: "#F59E0B",
                                borderRadius: 7,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 15,
                                color: "#111827",
                                letterSpacing: "-0.04em",
                            }}
                        >
                            L
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>
                            LeaveTrack
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {pendingCount > 0 && isHR && (
                            <span
                                style={{
                                    background: "#F59E0B",
                                    color: "#111827",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "3px 10px",
                                    borderRadius: 10,
                                }}
                            >
                                {pendingCount} pending
                            </span>
                        )}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 9,
                                background: "#1F2937",
                                border: "1px solid #374151",
                                borderRadius: 8,
                                padding: "5px 12px",
                            }}
                        >
                            <div
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: "50%",
                                    background: "#374151",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "#E5E7EB",
                                }}
                            >
                                {user.name
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#F9FAFB", lineHeight: 1.2 }}>
                                    {user.name}
                                </div>
                                <div style={{ fontSize: 10, color: "#9CA3AF" }}>
                                    {isHR ? "HR Officer" : "Employee"}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Main content ── */}
                <main style={{ maxWidth: 1120, margin: "0 auto", padding: "30px 28px" }}>

                    {/* Page title row */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            marginBottom: 28,
                            gap: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    fontSize: 26,
                                    fontWeight: 800,
                                    color: "#111827",
                                    margin: 0,
                                    letterSpacing: "-0.03em",
                                }}
                            >
                                {isHR ? "Leave Applications" : "My Leave"}
                            </h1>
                            <p style={{ margin: "5px 0 0", fontSize: 13, color: "#6B7280" }}>
                                {isHR
                                    ? `Managing ${meta.total} application${meta.total !== 1 ? "s" : ""} across all employees`
                                    : "Manage and track your leave requests"}
                            </p>
                        </div>
                        {isEmployee && (
                            <button
                                onClick={() => setShowApply(true)}
                                style={{
                                    padding: "10px 22px",
                                    background: "#111827",
                                    border: "none",
                                    borderRadius: 8,
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                                Apply for Leave
                            </button>
                        )}
                    </div>

                    {/* Balance cards — employees only */}
                    {isEmployee && balance && (
                        <div style={{ marginBottom: 28 }}>
                            <LeaveBalanceCards balance={balance} />
                        </div>
                    )}

                    {/* HR stat strip */}
                    {isHR && applications.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <HRStatStrip applications={applications} />
                        </div>
                    )}

                    {/* Filter bar */}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginBottom: 16,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        {isHR && (
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value as LeaveStatus | "")
                                    setPage(1)
                                }}
                                style={{
                                    padding: "8px 12px",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: 7,
                                    fontSize: 12,
                                    color: filterStatus ? "#111827" : "#6B7280",
                                    background: "#fff",
                                    fontFamily: "inherit",
                                    minWidth: 160,
                                    cursor: "pointer",
                                }}
                            >
                                <option value="">All Statuses</option>
                                {(Object.entries(STATUS_META) as [LeaveStatus, typeof STATUS_META[LeaveStatus]][]).map(
                                    ([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    )
                                )}
                            </select>
                        )}
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value as LeaveType | "")
                                setPage(1)
                            }}
                            style={{
                                padding: "8px 12px",
                                border: "1px solid #E5E7EB",
                                borderRadius: 7,
                                fontSize: 12,
                                color: filterType ? "#111827" : "#6B7280",
                                background: "#fff",
                                fontFamily: "inherit",
                                minWidth: 150,
                                cursor: "pointer",
                            }}
                        >
                            <option value="">All Leave Types</option>
                            {(Object.entries(LEAVE_TYPE_LABELS) as [LeaveType, string][]).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        {(filterStatus || filterType) && (
                            <button
                                onClick={() => {
                                    setFilterStatus("")
                                    setFilterType("")
                                    setPage(1)
                                }}
                                style={{
                                    padding: "8px 12px",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: 7,
                                    background: "#fff",
                                    fontSize: 12,
                                    cursor: "pointer",
                                    color: "#6B7280",
                                    fontFamily: "inherit",
                                }}
                            >
                                ✕ Clear filters
                            </button>
                        )}
                        <button
                            onClick={handleRefresh}
                            style={{
                                padding: "8px 14px",
                                border: "1px solid #E5E7EB",
                                borderRadius: 7,
                                background: "#fff",
                                fontSize: 12,
                                cursor: "pointer",
                                color: "#6B7280",
                                fontFamily: "inherit",
                                marginLeft: "auto",
                            }}
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    {/* Table */}
                    <LeaveTable
                        applications={applications}
                        role={role}
                        loading={loadingApps}
                        onView={(app) => setDrawerApp(app)}
                        onReview={(app) => setReviewTarget(app)}
                        onApply={isEmployee ? () => setShowApply(true) : undefined}
                    />

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: 16,
                            }}
                        >
                            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                                Showing {(page - 1) * meta.limit + 1}–
                                {Math.min(page * meta.limit, meta.total)} of {meta.total} applications
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    style={{
                                        padding: "6px 14px",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: 7,
                                        background: "#fff",
                                        fontSize: 12,
                                        cursor: page <= 1 ? "not-allowed" : "pointer",
                                        opacity: page <= 1 ? 0.4 : 1,
                                        fontFamily: "inherit",
                                    }}
                                >
                                    ← Prev
                                </button>
                                <button
                                    disabled={page >= meta.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    style={{
                                        padding: "6px 14px",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: 7,
                                        background: "#fff",
                                        fontSize: 12,
                                        cursor: page >= meta.totalPages ? "not-allowed" : "pointer",
                                        opacity: page >= meta.totalPages ? 0.4 : 1,
                                        fontFamily: "inherit",
                                    }}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Modals & Drawer ── */}

            {showApply && user && (
                <ApplyLeaveModal
                    userId={user.id}
                    employeeId={employeeId}
                    userName={user.name}
                    userEmail={user.email}
                    onClose={() => setShowApply(false)}
                    onSuccess={handleApplySuccess}
                />
            )}

            {reviewTarget && user && (
                <HRReviewModal
                    application={reviewTarget}
                    hrUserId={user.id}
                    onClose={() => setReviewTarget(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}

            {drawerApp && user && (
                <LeaveDetailDrawer
                    application={drawerApp}
                    role={role}
                    userId={user.id}
                    onClose={() => setDrawerApp(null)}
                    onRefresh={handleRefresh}
                />
            )}
        </>
    )
}