// components/leaves/HRReviewModal.tsx
"use client"

import { LeaveApplication } from "@/types/leaves"
import { formatDate, LEAVE_TYPE_LABELS } from "@/utils/leave-utils"
import { useState } from "react"
import { LeaveStatusBadge } from "./leave-status-badge"


interface HRReviewModalProps {
  application: LeaveApplication
  hrUserId: string
  onClose: () => void
  onSuccess: () => void
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #D1D5DB",
  borderRadius: 7,
  fontSize: 13,
  color: "#111827",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#374151",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#111827", fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  )
}

export function HRReviewModal({
  application,
  hrUserId,
  onClose,
  onSuccess,
}: HRReviewModalProps) {
  const [mode, setMode] = useState<"review" | "reject">("review")
  const [annualDays, setAnnualDays]       = useState(24)
  const [deductedDays, setDeductedDays]   = useState(application.days)
  const [hrSignature, setHrSignature]     = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState("")

  const remaining = annualDays - deductedDays
  const empName =
    application.employee?.users?.[0]?.name ?? application.user?.name ?? "Unknown Employee"
  const empNum = application.employee?.employee_number ?? "—"
  const section = application.employee?.section?.section_name ?? "—"

  async function handleReview() {
    setError("")
    if (!hrSignature.trim()) {
      setError("Please add your signature to proceed.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/leaves/${application.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annual_leave_days: annualDays,
          deducted_days: deductedDays,
          remaining_leave_days: remaining,
          hr_signature: hrSignature,
          filled_by_id: hrUserId,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    setError("")
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/leaves/${application.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejected_by_id: hrUserId,
          rejection_reason: rejectionReason,
          filled_by_id: hrUserId,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
              HR Review — Part B
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
              Application #{application.id}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 20, padding: "2px 4px" }}
          >
            ✕
          </button>
        </div>

        {/* Application Summary */}
        <div style={{ padding: "16px 24px 0" }}>
          <div
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: 16,
              marginBottom: 20,
            }}
          >
            {/* Employee info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#EEF2FF",
                  border: "1px solid #C7D2FE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#4338CA",
                  flexShrink: 0,
                }}
              >
                {empName.split(" ").slice(0, 2).map((n) => n[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{empName}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{empNum} · {section}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <LeaveStatusBadge status={application.status} size="sm" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px 16px", borderTop: "1px solid #E5E7EB", paddingTop: 12 }}>
              <InfoPair label="Type"  value={LEAVE_TYPE_LABELS[application.leave_type]} />
              <InfoPair label="Days"  value={`${application.days} days`} />
              <InfoPair label="From"  value={formatDate(application.start_date)} />
              <InfoPair label="To"    value={formatDate(application.end_date)} />
            </div>
            {application.reason && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E5E7EB", fontSize: 12, color: "#374151" }}>
                <span style={{ fontWeight: 600, color: "#6B7280" }}>Reason: </span>
                {application.reason}
              </div>
            )}
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{ padding: "0 24px", display: "flex", gap: 4, marginBottom: 16 }}>
          {(["review", "reject"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: mode === m ? (m === "reject" ? "#FEF2F2" : "#EEF2FF") : "transparent",
                color: mode === m ? (m === "reject" ? "#B91C1C" : "#4338CA") : "#9CA3AF",
                transition: "all 0.15s",
              }}
            >
              {m === "review" ? "✓ Approve & Forward" : "✗ Reject"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#B91C1C", fontSize: 13 }}>
              {error}
            </div>
          )}

          {mode === "review" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Annual Days (total)">
                  <input
                    type="number"
                    value={annualDays}
                    min={0}
                    onChange={(e) => setAnnualDays(parseInt(e.target.value) || 0)}
                    style={INPUT_STYLE}
                  />
                </Field>
                <Field label="Days to Deduct">
                  <input
                    type="number"
                    value={deductedDays}
                    min={0}
                    max={annualDays}
                    onChange={(e) => setDeductedDays(parseInt(e.target.value) || 0)}
                    style={INPUT_STYLE}
                  />
                </Field>
                <Field label="Remaining">
                  <div
                    style={{
                      ...INPUT_STYLE,
                      background: remaining < 0 ? "#FEF2F2" : "#F0FDF4",
                      color: remaining < 0 ? "#B91C1C" : "#15803D",
                      fontWeight: 700,
                      border: `1px solid ${remaining < 0 ? "#FECACA" : "#BBF7D0"}`,
                    }}
                  >
                    {remaining} days
                  </div>
                </Field>
              </div>
              {remaining < 0 && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#B91C1C" }}>
                  ⚠ Deduction exceeds available balance. Please verify before proceeding.
                </div>
              )}
              <Field label="HR Signature">
                <input
                  type="text"
                  placeholder="Type your full name as signature"
                  value={hrSignature}
                  onChange={(e) => setHrSignature(e.target.value)}
                  style={INPUT_STYLE}
                />
              </Field>
            </>
          ) : (
            <Field label="Rejection Reason">
              <textarea
                rows={4}
                placeholder="Explain the reason for rejecting this application…"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 100 }}
              />
            </Field>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #F3F4F6",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            background: "#FAFAFA",
            borderRadius: "0 0 14px 14px",
          }}
        >
          <button
            onClick={onClose}
            style={{ padding: "9px 18px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}
          >
            Cancel
          </button>
          {mode === "review" ? (
            <button
              onClick={handleReview}
              disabled={loading}
              style={{ padding: "9px 22px", background: loading ? "#6B7280" : "#1D4ED8", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", color: "#fff" }}
            >
              {loading ? "Forwarding…" : "Forward to Supervisor →"}
            </button>
          ) : (
            <button
              onClick={handleReject}
              disabled={loading}
              style={{ padding: "9px 22px", background: loading ? "#6B7280" : "#DC2626", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", color: "#fff" }}
            >
              {loading ? "Rejecting…" : "Confirm Rejection"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}