import { LeaveStatus } from "@/types/leaves"
import { STATUS_META } from "@/utils/leave-utils"


interface LeaveStatusBadgeProps {
  status: LeaveStatus
  size?: "sm" | "md"
}

export function LeaveStatusBadge({ status, size = "md" }: LeaveStatusBadgeProps) {
  const meta = STATUS_META[status]
  const isSm = size === "sm"

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? 4 : 5,
        padding: isSm ? "2px 7px" : "3px 10px",
        borderRadius: 5,
        fontSize: isSm ? 10 : 11,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: isSm ? 5 : 6,
          height: isSm ? 5 : 6,
          borderRadius: "50%",
          background: meta.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {meta.label}
    </span>
  )
}