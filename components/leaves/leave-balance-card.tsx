// components/leaves/LeaveBalanceCards.tsx
"use client"

import { LeaveBalance } from "@/types/leaves"

interface BalanceCardProps {
    label: string
    used: number
    total: number
    remaining: number
    accentColor: string
    trackColor: string
    unit?: string
}

function BalanceCard({
    label,
    used,
    total,
    remaining,
    accentColor,
    trackColor,
    unit = "days",
}: BalanceCardProps) {
    const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: "18px 20px",
                flex: 1,
                minWidth: 150,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Accent strip */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: accentColor,
                    borderRadius: "10px 10px 0 0",
                }}
            />
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9CA3AF",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                    marginTop: 4,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    marginBottom: 4,
                }}
            >
                <span
                    style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#111827",
                        fontFamily: "'DM Mono', 'Fira Code', monospace",
                        lineHeight: 1,
                    }}
                >
                    {remaining}
                </span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>/ {total} {unit}</span>
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>
                {used} {unit} used
            </div>
            {/* Progress bar */}
            <div
                style={{
                    height: 5,
                    background: trackColor,
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: accentColor,
                        borderRadius: 3,
                        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                />
            </div>
            <div
                style={{
                    marginTop: 6,
                    fontSize: 10,
                    color: "#9CA3AF",
                    textAlign: "right",
                    fontFamily: "'DM Mono', monospace",
                }}
            >
                {pct}% used
            </div>
        </div>
    )
}

interface LeaveBalanceCardsProps {
    balance: LeaveBalance
}

export function LeaveBalanceCards({ balance }: LeaveBalanceCardsProps) {
    return (
        <div>
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6B7280",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                }}
            >
                {balance.year} Leave Balance
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <BalanceCard
                    label="Annual Leave"
                    used={balance.annual_used}
                    total={balance.annual_total}
                    remaining={balance.annual_remaining}
                    accentColor="#3B82F6"
                    trackColor="#DBEAFE"
                />
                <BalanceCard
                    label="Sick Leave"
                    used={balance.sick_used}
                    total={balance.sick_total}
                    remaining={balance.sick_remaining}
                    accentColor="#8B5CF6"
                    trackColor="#EDE9FE"
                />
                <BalanceCard
                    label="Unpaid Used"
                    used={balance.unpaid_used}
                    total={Math.max(balance.unpaid_used, 1)}
                    remaining={0}
                    accentColor="#F59E0B"
                    trackColor="#FEF3C7"
                    unit="days"
                />
                {balance.carried_over > 0 && (
                    <div
                        style={{
                            background: "#FFFBEB",
                            border: "1px solid #FDE68A",
                            borderRadius: 10,
                            padding: "18px 20px",
                            flex: 1,
                            minWidth: 150,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                                background: "#F59E0B",
                                borderRadius: "10px 10px 0 0",
                            }}
                        />
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#92400E",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                marginBottom: 10,
                                marginTop: 4,
                            }}
                        >
                            Carried Over
                        </div>
                        <div
                            style={{
                                fontSize: 32,
                                fontWeight: 700,
                                color: "#92400E",
                                fontFamily: "'DM Mono', monospace",
                                lineHeight: 1,
                                marginBottom: 4,
                            }}
                        >
                            {balance.carried_over}
                        </div>
                        <div style={{ fontSize: 12, color: "#B45309" }}>
                            days from {balance.year - 1}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}