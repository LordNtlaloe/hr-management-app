// components/leaves/ApplyLeaveModal.tsx
"use client"

import { useState } from "react"
import { LeaveApplication, LeaveType } from "@/types/leaves"
import { LEAVE_TYPE_LABELS, calcWorkingDays } from "@/utils/leave-utils"

interface ApplyLeaveModalProps {
    userId: string
    employeeId?: number
    userName: string
    userEmail: string
    employeeNumber?: string
    position?: string
    currentAddress?: string
    onClose: () => void
    onSuccess: (application: LeaveApplication) => void
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
    transition: "border-color 0.15s",
}

function Field({
    label,
    required,
    children,
}: {
    label: string
    required?: boolean
    children: React.ReactNode
}) {
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
                {required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
            </label>
            {children}
        </div>
    )
}

export function ApplyLeaveModal({
    userId,
    employeeId,
    userName,
    userEmail,
    employeeNumber = "",
    position = "",
    currentAddress = "",
    onClose,
    onSuccess,
}: ApplyLeaveModalProps) {
    const [form, setForm] = useState({
        leave_type: "ANNUAL" as LeaveType,
        start_date: "",
        end_date: "",
        reason: "",
        location_during_leave: "",
        phone_number: "",
        email: userEmail,
        current_address: currentAddress,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const days = calcWorkingDays(form.start_date, form.end_date)

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }))

    async function handleSubmit() {
        setError("")
        if (!form.start_date || !form.end_date || !form.phone_number || !form.current_address) {
            setError("Please fill in all required fields.")
            return
        }
        if (new Date(form.end_date) < new Date(form.start_date)) {
            setError("End date cannot be before start date.")
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/leaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    days,
                    userId,
                    employeeId,
                    employee_name: userName,
                    employment_number: employeeNumber,
                    employee_position: position,
                    employee_signature: userName,
                }),
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error || "Failed to submit application")
            onSuccess(data.data)
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
                    maxWidth: 560,
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
                            Apply for Leave
                        </div>
                        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
                            Part A — Employee Application · {userName}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9CA3AF",
                            fontSize: 20,
                            lineHeight: 1,
                            padding: "2px 4px",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {error && (
                        <div
                            style={{
                                background: "#FEF2F2",
                                border: "1px solid #FECACA",
                                borderRadius: 8,
                                padding: "10px 14px",
                                color: "#B91C1C",
                                fontSize: 13,
                                display: "flex",
                                gap: 8,
                                alignItems: "flex-start",
                            }}
                        >
                            <span style={{ flexShrink: 0 }}>⚠</span>
                            {error}
                        </div>
                    )}

                    <Field label="Leave Type" required>
                        <select value={form.leave_type} onChange={set("leave_type")} style={INPUT_STYLE}>
                            {(Object.entries(LEAVE_TYPE_LABELS) as [LeaveType, string][]).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Start Date" required>
                            <input
                                type="date"
                                value={form.start_date}
                                onChange={set("start_date")}
                                style={INPUT_STYLE}
                            />
                        </Field>
                        <Field label="End Date" required>
                            <input
                                type="date"
                                value={form.end_date}
                                min={form.start_date}
                                onChange={set("end_date")}
                                style={INPUT_STYLE}
                            />
                        </Field>
                    </div>

                    {days > 0 && (
                        <div
                            style={{
                                background: "#F0FDF4",
                                border: "1px solid #BBF7D0",
                                borderRadius: 8,
                                padding: "10px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 13,
                                color: "#15803D",
                            }}
                        >
                            <span style={{ fontSize: 16 }}>📅</span>
                            <span>
                                <strong>{days}</strong> day{days !== 1 ? "s" : ""} of{" "}
                                {LEAVE_TYPE_LABELS[form.leave_type]} requested
                            </span>
                        </div>
                    )}

                    <Field label="Location During Leave">
                        <input
                            type="text"
                            placeholder="e.g. Home, Gaborone"
                            value={form.location_during_leave}
                            onChange={set("location_during_leave")}
                            style={INPUT_STYLE}
                        />
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Phone Number" required>
                            <input
                                type="tel"
                                placeholder="+267 7X XXX XXX"
                                value={form.phone_number}
                                onChange={set("phone_number")}
                                style={INPUT_STYLE}
                            />
                        </Field>
                        <Field label="Email">
                            <input
                                type="email"
                                value={form.email}
                                onChange={set("email")}
                                style={INPUT_STYLE}
                            />
                        </Field>
                    </div>

                    <Field label="Current Address" required>
                        <input
                            type="text"
                            placeholder="Plot 123, Village, District"
                            value={form.current_address}
                            onChange={set("current_address")}
                            style={INPUT_STYLE}
                        />
                    </Field>

                    <Field label="Reason (optional)">
                        <textarea
                            rows={3}
                            placeholder="Brief reason for leave request..."
                            value={form.reason}
                            onChange={set("reason")}
                            style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 76 }}
                        />
                    </Field>
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
                        style={{
                            padding: "9px 18px",
                            background: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: 7,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            color: "#374151",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: "9px 22px",
                            background: loading ? "#6B7280" : "#111827",
                            border: "none",
                            borderRadius: 7,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer",
                            color: "#fff",
                            transition: "background 0.15s",
                        }}
                    >
                        {loading ? "Submitting…" : "Submit Application"}
                    </button>
                </div>
            </div>
        </div>
    )
}