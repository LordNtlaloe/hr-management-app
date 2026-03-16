"use client"

import { cn } from "@/lib/utils"

interface StatCardProps {
    label: string
    value: string | number
    sub?: string
    icon: React.ReactNode
    accent?: string
    trend?: { value: number; up: boolean; label: string }
    loading?: boolean
}

export function StatCard({ label, value, sub, icon, accent = "#6366f1", trend, loading }: StatCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
            {/* accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: accent }} />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
                    {loading ? (
                        <div className="mt-2 h-8 w-20 animate-pulse rounded-lg bg-muted" />
                    ) : (
                        <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-foreground">{value}</p>
                    )}
                    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
                    {trend && !loading && (
                        <p className={cn("mt-1 text-xs font-medium", trend.up ? "text-emerald-500" : "text-rose-500")}>
                            {trend.up ? "↑" : "↓"} {trend.value}% {trend.label}
                        </p>
                    )}
                </div>
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${accent}18`, color: accent }}
                >
                    {icon}
                </div>
            </div>
        </div>
    )
}

interface SectionHeaderProps {
    title: string
    subtitle?: string
    action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    )
}

interface DashboardShellProps {
    greeting: string
    name: string
    badge: string
    badgeColor: string
    children: React.ReactNode
}

export function DashboardShell({ greeting, name, badge, badgeColor, children }: DashboardShellProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card/60 px-6 py-6 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{greeting}</p>
                            <h1 className="font-display mt-0.5 text-2xl font-bold tracking-tight text-foreground">{name}</h1>
                        </div>
                        <span
                            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                            style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
                        >
                            {badge}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">{children}</div>
        </div>
    )
}

export function LoadingRow() {
    return <div className="h-12 animate-pulse rounded-lg bg-muted" />
}

interface TableShellProps {
    headers: string[]
    children: React.ReactNode
    empty?: string
    loading?: boolean
}

export function TableShell({ headers, children, empty, loading }: TableShellProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/40">
                        {headers.map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i} className="border-b border-border last:border-0">
                                {headers.map((h) => (
                                    <td key={h} className="px-4 py-3">
                                        <div className="h-4 animate-pulse rounded bg-muted" style={{ width: `${50 + Math.random() * 40}%` }} />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        children
                    )}
                </tbody>
            </table>
            {!loading && !children && empty && (
                <div className="py-12 text-center text-sm text-muted-foreground">{empty}</div>
            )}
        </div>
    )
}

export function LeaveStatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; color: string }> = {
        PENDING: { label: "Pending", color: "#f59e0b" },
        HR_REVIEW: { label: "HR Review", color: "#6366f1" },
        SUPERVISOR_REVIEW: { label: "Supervisor Review", color: "#8b5cf6" },
        FINAL_REVIEW: { label: "Final Review", color: "#3b82f6" },
        APPROVED: { label: "Approved", color: "#10b981" },
        REJECTED: { label: "Rejected", color: "#ef4444" },
    }
    const cfg = map[status] ?? { label: status, color: "#6b7280" }
    return (
        <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: `${cfg.color}18`, color: cfg.color }}
        >
            {cfg.label}
        </span>
    )
}