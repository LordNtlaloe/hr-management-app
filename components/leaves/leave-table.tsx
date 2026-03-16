// components/leaves/LeaveTable.tsx
"use client"

import { LeaveApplication, LeaveStatus, LeaveType, Role } from "@/types/leaves"
import { LeaveStatusBadge } from "./leave-status-badge"
import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS, formatDateShort, getInitials } from "@/utils/leave-utils"

interface LeaveTableProps {
    applications: LeaveApplication[]
    role: Role
    loading: boolean
    onView: (application: LeaveApplication) => void
    onReview: (application: LeaveApplication) => void
    onApply?: () => void
}

const TH_STYLE: React.CSSProperties = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    color: "#9CA3AF",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    borderBottom: "1px solid #F3F4F6",
    background: "#FAFAFA",
}

const TD_STYLE: React.CSSProperties = {
    padding: "12px 16px",
    verticalAlign: "middle",
    borderBottom: "1px solid #F9FAFB",
    fontSize: 13,
    color: "#111827",
}

function LeaveTypePill({ type }: { type: LeaveType }) {
    const colors = LEAVE_TYPE_COLORS[type]
    return (
        <span
            style={{
                display: "inline-block",
                padding: "2px 9px",
                borderRadius: 5,
                fontSize: 11,
                fontWeight: 600,
                background: colors.bg,
                color: colors.text,
                letterSpacing: "0.03em",
            }}
        >
            {LEAVE_TYPE_LABELS[type]}
        </span>
    )
}

function EmptyState({
    isHR,
    onApply,
}: {
    isHR: boolean
    onApply?: () => void
}) {
    return (
        <tr>
            <td
                colSpan={isHR ? 7 : 6}
                style={{ padding: "60px 20px", textAlign: "center" }}
            >
                <div
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        margin: "0 auto 14px",
                    }}
                >
                    📋
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    No leave applications found
                </div>
                <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>
                    {isHR
                        ? "No applications match the current filters."
                        : "You haven't submitted any leave requests yet."}
                </div>
                {!isHR && onApply && (
                    <button
                        onClick={onApply}
                        style={{
                            padding: "9px 20px",
                            background: "#111827",
                            border: "none",
                            borderRadius: 7,
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        + Apply for Leave
                    </button>
                )}
            </td>
        </tr>
    )
}

function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #F9FAFB" }}>
                    <div
                        style={{
                            height: 12,
                            borderRadius: 6,
                            background: "linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s infinite",
                            width: `${40 + Math.random() * 50}%`,
                        }}
                    />
                </td>
            ))}
        </tr>
    )
}

export function LeaveTable({
    applications,
    role,
    loading,
    onView,
    onReview,
    onApply,
}: LeaveTableProps) {
    const isHR = role === "HR_OFFICER" || role === "ADMIN"
    const colCount = isHR ? 7 : 6

    return (
        <>
            <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
            <div
                style={{
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    overflow: "hidden",
                }}
            >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {isHR && <th style={TH_STYLE}>Employee</th>}
                            <th style={TH_STYLE}>Leave Type</th>
                            <th style={TH_STYLE}>Duration</th>
                            <th style={TH_STYLE}>Days</th>
                            <th style={TH_STYLE}>Status</th>
                            <th style={TH_STYLE}>Applied</th>
                            <th style={{ ...TH_STYLE, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonRow key={i} cols={colCount} />
                            ))
                        ) : applications.length === 0 ? (
                            <EmptyState isHR={isHR} onApply={onApply} />
                        ) : (
                            applications.map((app) => {
                                const empName =
                                    app.employee?.users?.[0]?.name ?? app.user?.name ?? "—"
                                const empNum = app.employee?.employee_number ?? "—"
                                const section = app.employee?.section?.section_name

                                const canHRReview =
                                    isHR &&
                                    (app.status === "PENDING" || app.status === "HR_REVIEW")

                                return (
                                    <tr
                                        key={app.id}
                                        style={{ cursor: "pointer", transition: "background 0.1s" }}
                                        onMouseEnter={(e) =>
                                        ((e.currentTarget as HTMLTableRowElement).style.background =
                                            "#FAFAFA")
                                        }
                                        onMouseLeave={(e) =>
                                        ((e.currentTarget as HTMLTableRowElement).style.background =
                                            "transparent")
                                        }
                                        onClick={() => onView(app)}
                                    >
                                        {isHR && (
                                            <td style={TD_STYLE} onClick={(e) => e.stopPropagation()}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: "50%",
                                                            background: "#EEF2FF",
                                                            border: "1px solid #C7D2FE",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: "#4338CA",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {getInitials(empName)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{empName}</div>
                                                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                                                            {empNum}
                                                            {section ? ` · ${section}` : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td style={TD_STYLE}>
                                            <LeaveTypePill type={app.leave_type} />
                                        </td>
                                        <td style={TD_STYLE}>
                                            <div style={{ fontWeight: 500 }}>
                                                {formatDateShort(app.start_date)}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                                                → {formatDateShort(app.end_date)}
                                            </div>
                                        </td>
                                        <td style={TD_STYLE}>
                                            <span
                                                style={{
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {app.days}
                                            </span>
                                        </td>
                                        <td style={TD_STYLE}>
                                            <LeaveStatusBadge status={app.status} />
                                        </td>
                                        <td style={{ ...TD_STYLE, color: "#9CA3AF", fontSize: 12 }}>
                                            {formatDateShort(app.applied_at)}
                                        </td>
                                        <td
                                            style={{ ...TD_STYLE, textAlign: "right" }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                <button
                                                    onClick={() => onView(app)}
                                                    style={{
                                                        padding: "5px 12px",
                                                        background: "#fff",
                                                        border: "1px solid #E5E7EB",
                                                        borderRadius: 6,
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                        cursor: "pointer",
                                                        color: "#374151",
                                                    }}
                                                >
                                                    View
                                                </button>
                                                {canHRReview && (
                                                    <button
                                                        onClick={() => onReview(app)}
                                                        style={{
                                                            padding: "5px 12px",
                                                            background: "#1D4ED8",
                                                            border: "none",
                                                            borderRadius: 6,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            color: "#fff",
                                                        }}
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}