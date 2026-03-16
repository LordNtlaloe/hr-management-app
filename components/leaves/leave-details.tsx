// components/leaves/LeaveDetailDrawer.tsx
"use client"

import { LeaveApplication, Role } from "@/types/leaves"
import { formatDate, LEAVE_TYPE_LABELS } from "@/utils/leave-utils"
import { useState } from "react"
import { LeaveStatusBadge } from "./leave-status-badge"


interface LeaveDetailDrawerProps {
    application: LeaveApplication
    role: Role
    userId: string
    onClose: () => void
    onRefresh: () => void
}

function InfoPair({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {label}
            </div>
            <div style={{ fontSize: 13, color: "#111827", fontWeight: 500, marginTop: 2 }}>{value}</div>
        </div>
    )
}

interface PartStepProps {
    letter: string
    title: string
    subtitle?: string
    done: boolean
    active?: boolean
    isLast?: boolean
    decisionColor?: string
}

function PartStep({ letter, title, subtitle, done, active, isLast, decisionColor }: PartStepProps) {
    return (
        <div style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: done ? 14 : 12,
                        fontWeight: 700,
                        flexShrink: 0,
                        background: done ? "#111827" : active ? "#F3F4F6" : "#F9FAFB",
                        color: done ? "#fff" : active ? "#374151" : "#D1D5DB",
                        border: active && !done ? "2px dashed #9CA3AF" : "none",
                        transition: "all 0.2s",
                    }}
                >
                    {done ? "✓" : letter}
                </div>
                {!isLast && (
                    <div
                        style={{
                            width: 1,
                            flex: 1,
                            minHeight: 20,
                            background: done ? "#111827" : "#E5E7EB",
                            margin: "4px 0",
                        }}
                    />
                )}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: done ? 600 : 400,
                        color: done ? "#111827" : active ? "#6B7280" : "#9CA3AF",
                        marginTop: 7,
                    }}
                >
                    {title}
                </div>
                {subtitle && (
                    <div style={{ fontSize: 11, color: decisionColor ?? "#6B7280", marginTop: 3 }}>
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    )
}

export function LeaveDetailDrawer({
    application,
    role,
    userId,
    onClose,
    onRefresh,
}: LeaveDetailDrawerProps) {
    const [approvingFinal, setApprovingFinal] = useState(false)
    const [finalLoading, setFinalLoading] = useState(false)
    const [finalError, setFinalError] = useState("")

    const isHR = role === "HR_OFFICER" || role === "ADMIN"
    const empName =
        application.employee?.users?.[0]?.name ?? application.user?.name ?? "—"
    const empNum = application.employee?.employee_number ?? "—"
    const section = application.employee?.section?.section_name

    const steps = [
        {
            letter: "A",
            title: "Employee Application",
            done: !!application.partA,
            subtitle: application.partA
                ? `Submitted ${formatDate(application.partA.filled_at)} · ${application.partA.employee_signature}`
                : undefined,
        },
        {
            letter: "B",
            title: "HR Verification",
            done: !!application.partB,
            subtitle: application.partB
                ? `${application.partB.deducted_days}d deducted · ${application.partB.remaining_leave_days}d remaining${application.partB.hr_signature ? ` · ${application.partB.hr_signature}` : ""}`
                : undefined,
        },
        {
            letter: "C",
            title: "Supervisor Review",
            done: !!application.partC,
            subtitle: application.partC
                ? `${application.partC.recommendation?.replace("_", " ")}${application.partC.supervisor_comments ? ` · "${application.partC.supervisor_comments}"` : ""}`
                : undefined,
        },
        {
            letter: "D",
            title: "Final Decision",
            done: !!application.partD,
            subtitle: application.partD
                ? application.partD.final_decision
                : undefined,
            decisionColor:
                application.partD?.final_decision === "APPROVED"
                    ? "#15803D"
                    : application.partD?.final_decision === "REJECTED"
                        ? "#B91C1C"
                        : undefined,
        },
    ]

    const currentStepIdx = steps.findIndex((s) => !s.done)

    async function handleFinalApprove() {
        setFinalError("")
        setFinalLoading(true)
        try {
            const res = await fetch(`/api/leaves/${application.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filled_by_id: userId }),
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error)
            onRefresh()
            onClose()
        } catch (e: any) {
            setFinalError(e.message)
        } finally {
            setFinalLoading(false)
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.3)",
                    zIndex: 40,
                }}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 420,
                    maxWidth: "95vw",
                    background: "#fff",
                    boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Drawer header */}
                <div
                    style={{
                        padding: "18px 22px 16px",
                        borderBottom: "1px solid #F3F4F6",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, marginBottom: 4 }}>
                                Application #{application.id}
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
                                {empName}
                            </div>
                            {section && (
                                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                                    {empNum} · {section}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 20, padding: "2px 4px", marginTop: -2 }}
                        >
                            ✕
                        </button>
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <LeaveStatusBadge status={application.status} />
                    </div>
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflow: "auto", padding: "18px 22px" }}>
                    {/* Summary card */}
                    <div
                        style={{
                            background: "#F9FAFB",
                            border: "1px solid #E5E7EB",
                            borderRadius: 10,
                            padding: 16,
                            marginBottom: 24,
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                            <InfoPair label="Leave Type" value={LEAVE_TYPE_LABELS[application.leave_type]} />
                            <InfoPair
                                label="Days"
                                value={
                                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                                        {application.days}
                                    </span>
                                }
                            />
                            <InfoPair label="From" value={formatDate(application.start_date)} />
                            <InfoPair label="To" value={formatDate(application.end_date)} />
                            <InfoPair label="Applied" value={formatDate(application.applied_at)} />
                            {application.partA?.phone_number && (
                                <InfoPair label="Phone" value={application.partA.phone_number} />
                            )}
                        </div>
                        {application.reason && (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E5E7EB", fontSize: 13, color: "#374151" }}>
                                <span style={{ fontWeight: 600, color: "#6B7280", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Reason </span>
                                {application.reason}
                            </div>
                        )}
                        {application.rejection_reason && (
                            <div
                                style={{
                                    marginTop: 10,
                                    padding: 10,
                                    background: "#FEF2F2",
                                    border: "1px solid #FECACA",
                                    borderRadius: 7,
                                    fontSize: 13,
                                    color: "#B91C1C",
                                }}
                            >
                                <span style={{ fontWeight: 600 }}>Rejection reason: </span>
                                {application.rejection_reason}
                            </div>
                        )}
                    </div>

                    {/* Part B balance info (HR or employee) */}
                    {application.partB && (
                        <div
                            style={{
                                background: "#EFF6FF",
                                border: "1px solid #BFDBFE",
                                borderRadius: 10,
                                padding: 14,
                                marginBottom: 24,
                                display: "flex",
                                gap: 20,
                            }}
                        >
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Annual</div>
                                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#1E40AF" }}>{application.partB.annual_leave_days}</div>
                            </div>
                            <div style={{ width: 1, background: "#BFDBFE" }} />
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deducted</div>
                                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#DC2626" }}>{application.partB.deducted_days}</div>
                            </div>
                            <div style={{ width: 1, background: "#BFDBFE" }} />
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining</div>
                                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#15803D" }}>{application.partB.remaining_leave_days}</div>
                            </div>
                        </div>
                    )}

                    {/* Steps timeline */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14 }}>
                        Process Steps
                    </div>
                    <div>
                        {steps.map((step, i) => (
                            <PartStep
                                key={step.letter}
                                letter={step.letter}
                                title={step.title}
                                subtitle={step.subtitle}
                                done={step.done}
                                active={i === currentStepIdx}
                                isLast={i === steps.length - 1}
                                decisionColor={step.decisionColor}
                            />
                        ))}
                    </div>

                    {/* HR Final Approval action */}
                    {isHR && application.status === "FINAL_REVIEW" && (
                        <div
                            style={{
                                marginTop: 20,
                                padding: 16,
                                background: "#F0FDF4",
                                border: "1px solid #BBF7D0",
                                borderRadius: 10,
                            }}
                        >
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#15803D", marginBottom: 4 }}>
                                Ready for final approval
                            </div>
                            <div style={{ fontSize: 12, color: "#166534", marginBottom: 12 }}>
                                The supervisor has reviewed and recommended this application.
                            </div>
                            {finalError && (
                                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, padding: "8px 12px", color: "#B91C1C", fontSize: 12, marginBottom: 10 }}>
                                    {finalError}
                                </div>
                            )}
                            <button
                                onClick={handleFinalApprove}
                                disabled={finalLoading}
                                style={{
                                    width: "100%",
                                    padding: "10px 0",
                                    background: finalLoading ? "#6B7280" : "#15803D",
                                    border: "none",
                                    borderRadius: 7,
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: finalLoading ? "not-allowed" : "pointer",
                                }}
                            >
                                {finalLoading ? "Processing…" : "✓ Grant Final Approval"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}