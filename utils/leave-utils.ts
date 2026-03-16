// lib/leave-utils.ts

import { LeaveStatus, LeaveType } from "@/types/leaves";

export const STATUS_META: Record<
    LeaveStatus,
    { label: string; color: string; bg: string; dot: string; border: string }
> = {
    PENDING: {
        label: "Pending",
        color: "#92400E",
        bg: "#FEF3C7",
        dot: "#D97706",
        border: "#FDE68A",
    },
    HR_REVIEW: {
        label: "HR Review",
        color: "#1E40AF",
        bg: "#DBEAFE",
        dot: "#3B82F6",
        border: "#BFDBFE",
    },
    SUPERVISOR_REVIEW: {
        label: "Supervisor Review",
        color: "#5B21B6",
        bg: "#EDE9FE",
        dot: "#7C3AED",
        border: "#DDD6FE",
    },
    FINAL_REVIEW: {
        label: "Final Review",
        color: "#075985",
        bg: "#E0F2FE",
        dot: "#0284C7",
        border: "#BAE6FD",
    },
    APPROVED: {
        label: "Approved",
        color: "#14532D",
        bg: "#DCFCE7",
        dot: "#16A34A",
        border: "#BBF7D0",
    },
    REJECTED: {
        label: "Rejected",
        color: "#7F1D1D",
        bg: "#FEE2E2",
        dot: "#DC2626",
        border: "#FECACA",
    },
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    ANNUAL: "Annual Leave",
    SICK: "Sick Leave",
    UNPAID: "Unpaid Leave",
    MATERNITY: "Maternity Leave",
}

export const LEAVE_TYPE_COLORS: Record<LeaveType, { bg: string; text: string }> = {
    ANNUAL: { bg: "#EFF6FF", text: "#1D4ED8" },
    SICK: { bg: "#FDF4FF", text: "#7E22CE" },
    UNPAID: { bg: "#FFF7ED", text: "#C2410C" },
    MATERNITY: { bg: "#FFF1F2", text: "#BE123C" },
}

export function calcWorkingDays(start: string, end: string): number {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    if (e < s) return 0
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, diff)
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export function formatDateShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
    })
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
}