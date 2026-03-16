// components/leaves/shared/PagePrimitives.tsx
"use client"

import { LeaveStatus, LeaveType } from "@/types/leaves"
import { LEAVE_TYPE_LABELS, STATUS_META } from "@/utils/leave-utils"



// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
    icon: string
    heading: string
    body: string
    action?: React.ReactNode
}

export function EmptyState({ icon, heading, body, action }: EmptyStateProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "72px 24px",
                textAlign: "center",
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    marginBottom: 16,
                }}
            >
                {icon}
            </div>
            <div
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                    marginBottom: 6,
                }}
            >
                {heading}
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", maxWidth: 320, lineHeight: 1.6, margin: "0 0 18px" }}>
                {body}
            </p>
            {action}
        </div>
    )
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

export function SkeletonRows({ cols, rows = 6 }: { cols: number; rows?: number }) {
    return (
        <>
            <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skel {
          background: linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 4px;
          height: 11px;
        }
      `}</style>
            {Array.from({ length: rows }).map((_, r) => (
                <tr key={r}>
                    {Array.from({ length: cols }).map((_, c) => (
                        <td
                            key={c}
                            style={{ padding: "14px 16px", borderBottom: "1px solid #F9FAFB" }}
                        >
                            <div className="skel" style={{ width: `${30 + ((r * 3 + c * 7) % 5) * 12}%` }} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    )
}

// ─── Table shell ──────────────────────────────────────────────────────────────

export function TableShell({
    headers,
    children,
}: {
    headers: string[]
    children: React.ReactNode
}) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                overflow: "hidden",
            }}
        >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                        {headers.map((h) => (
                            <th
                                key={h}
                                style={{
                                    padding: "10px 16px",
                                    textAlign: "left",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "#9CA3AF",
                                    letterSpacing: "0.07em",
                                    textTransform: "uppercase",
                                    borderBottom: "1px solid #E5E7EB",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

const SEL: React.CSSProperties = {
    padding: "7px 11px",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    fontSize: 12,
    background: "#fff",
    color: "#374151",
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
}

interface FilterBarProps {
    search: string
    onSearchChange: (v: string) => void
    statusFilter?: LeaveStatus | ""
    onStatusChange?: (v: LeaveStatus | "") => void
    typeFilter?: LeaveType | ""
    onTypeChange?: (v: LeaveType | "") => void
    showStatusFilter?: boolean
    right?: React.ReactNode
}

export function FilterBar({
    search,
    onSearchChange,
    statusFilter = "",
    onStatusChange,
    typeFilter = "",
    onTypeChange,
    showStatusFilter = true,
    right,
}: FilterBarProps) {
    const hasFilters = search || statusFilter || typeFilter

    return (
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flexGrow: 1, maxWidth: 260 }}>
                <span
                    style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                        fontSize: 13,
                        pointerEvents: "none",
                    }}
                >
                    ⌕
                </span>
                <input
                    type="text"
                    placeholder="Search employee…"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ ...SEL, paddingLeft: 28, width: "100%" }}
                />
            </div>

            {showStatusFilter && onStatusChange && (
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value as LeaveStatus | "")}
                    style={SEL}
                >
                    <option value="">All Statuses</option>
                    {(Object.entries(STATUS_META) as [LeaveStatus, (typeof STATUS_META)[LeaveStatus]][]).map(
                        ([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        )
                    )}
                </select>
            )}

            {onTypeChange && (
                <select
                    value={typeFilter}
                    onChange={(e) => onTypeChange(e.target.value as LeaveType | "")}
                    style={SEL}
                >
                    <option value="">All Types</option>
                    {(Object.entries(LEAVE_TYPE_LABELS) as [LeaveType, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            )}

            {hasFilters && (
                <button
                    onClick={() => {
                        onSearchChange("")
                        onStatusChange?.("")
                        onTypeChange?.("")
                    }}
                    style={{ ...SEL, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}
                >
                    ✕ Clear
                </button>
            )}

            {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
        </div>
    )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({
    page,
    totalPages,
    total,
    limit,
    onChange,
}: {
    page: number
    totalPages: number
    total: number
    limit: number
    onChange: (p: number) => void
}) {
    if (totalPages <= 1) return null
    const from = (page - 1) * limit + 1
    const to = Math.min(page * limit, total)

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
            }}
        >
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                {from}–{to} of {total}
            </span>
            <div style={{ display: "flex", gap: 5 }}>
                {(
                    [
                        { label: "← Prev", disabled: page <= 1, delta: -1 },
                        { label: "Next →", disabled: page >= totalPages, delta: 1 },
                    ] as const
                ).map(({ label, disabled, delta }) => (
                    <button
                        key={label}
                        disabled={disabled}
                        onClick={() => onChange(page + delta)}
                        style={{
                            padding: "6px 13px",
                            border: "1px solid #E5E7EB",
                            borderRadius: 6,
                            background: "#fff",
                            fontSize: 12,
                            fontFamily: "inherit",
                            color: "#374151",
                            cursor: disabled ? "not-allowed" : "pointer",
                            opacity: disabled ? 0.35 : 1,
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

export function StatChip({
    label,
    value,
    color = "#111827",
    bg = "#F3F4F6",
    border = "#E5E7EB",
}: {
    label: string
    value: string | number
    color?: string
    bg?: string
    border?: string
}) {
    return (
        <div
            style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 8,
                padding: "13px 16px",
                flex: 1,
                minWidth: 100,
            }}
        >
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "'DM Mono', 'Fira Code', monospace",
                    color,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9CA3AF",
                    marginTop: 5,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                }}
            >
                {label}
            </div>
        </div>
    )
}

// ─── Page header (title + subtitle + optional actions) ────────────────────────

export function PageHeader({
    title,
    subtitle,
    actions,
}: {
    title: string
    subtitle?: string
    actions?: React.ReactNode
}) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 24,
                gap: 12,
                flexWrap: "wrap",
            }}
        >
            <div>
                <h1
                    style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#111827",
                        margin: 0,
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                    }}
                >
                    {title}
                </h1>
                {subtitle && (
                    <p style={{ margin: "5px 0 0", fontSize: 13, color: "#6B7280", fontWeight: 400 }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    {actions}
                </div>
            )}
        </div>
    )
}