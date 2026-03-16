// app/leaves/balances/page.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "@/lib/auth-client"
import { LeaveBalance } from "@/types/leaves"

import { getInitials } from "@/utils/leave-utils"
import { PageHeader, StatChip, FilterBar, TableShell, SkeletonRows, EmptyState, Pagination } from "@/components/leaves/shared-page-shell"

interface EmployeeBalanceRow {
  employeeId:     number
  employeeNumber: string
  name:           string
  position?:      string
  section?:       string
  balance:        LeaveBalance
}

const TD: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
  borderBottom: "1px solid #F9FAFB",
  fontSize: 13,
  color: "#111827",
}

function MiniBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ flex: 1, height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden", minWidth: 60 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#6B7280", minWidth: 24, textAlign: "right" }}>
        {total - used}
      </span>
    </div>
  )
}

function BalanceCell({ used, total, color }: { used: number; total: number; color: string }) {
  const remaining = total - used
  const low = total > 0 && remaining <= Math.round(total * 0.2)
  return (
    <td style={TD}>
      <div style={{ minWidth: 110 }}>
        <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: low ? "#B91C1C" : "#111827", marginBottom: 4 }}>
          {remaining}
          <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 11 }}> / {total}</span>
          {low && (
            <span style={{ marginLeft: 6, fontSize: 9, background: "#FEE2E2", color: "#B91C1C", padding: "1px 5px", borderRadius: 3, fontFamily: "inherit", fontWeight: 700 }}>
              LOW
            </span>
          )}
        </div>
        <MiniBar used={used} total={total} color={color} />
      </div>
    </td>
  )
}

// Employee self-view: large summary cards
function PersonalBalanceSummary({ balance }: { balance: LeaveBalance }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
      {[
        { label: "Annual Leave",   used: balance.annual_used,   total: balance.annual_total,   remaining: balance.annual_remaining,  color: "#3B82F6", track: "#DBEAFE" },
        { label: "Sick Leave",     used: balance.sick_used,     total: balance.sick_total,     remaining: balance.sick_remaining,    color: "#8B5CF6", track: "#EDE9FE" },
        { label: "Unpaid Used",    used: balance.unpaid_used,   total: Math.max(balance.unpaid_used, 1),   remaining: 0, color: "#F59E0B", track: "#FEF3C7" },
        ...(balance.maternity_used > 0
          ? [{ label: "Maternity Used", used: balance.maternity_used, total: Math.max(balance.maternity_used, 1), remaining: 0, color: "#EC4899", track: "#FCE7F3" }]
          : []),
        ...(balance.carried_over > 0
          ? [{ label: `Carried Over from ${balance.year - 1}`, used: 0, total: balance.carried_over, remaining: balance.carried_over, color: "#F59E0B", track: "#FEF3C7" }]
          : []),
      ].map((item) => (
        <div
          key={item.label}
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
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: item.color, borderRadius: "10px 10px 0 0" }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, marginTop: 2 }}>
            {item.label}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "'DM Mono', monospace", color: "#111827", lineHeight: 1, letterSpacing: "-0.04em" }}>
              {item.remaining > 0 ? item.remaining : item.used}
            </span>
            {item.total > 1 && (
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>/ {item.total} days</span>
            )}
          </div>
          <div style={{ height: 5, background: item.track, borderRadius: 3, marginBottom: 4 }}>
            <div
              style={{
                width: `${item.total > 0 ? Math.round((item.used / item.total) * 100) : 0}%`,
                height: "100%",
                background: item.color,
                borderRadius: 3,
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{item.used} days used</div>
        </div>
      ))}
    </div>
  )
}

export default function LeaveBalancesPage() {
  const { data: session } = useSession()

  const [rows, setRows]       = useState<EmployeeBalanceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [page, setPage]       = useState(1)
  const [year, setYear]       = useState(new Date().getFullYear())
  const LIMIT = 20

  const role       = (session?.user as any)?.role ?? "EMPLOYEE"
  const isHR       = role === "HR_OFFICER" || role === "ADMIN"
  const userId     = session?.user?.id
  const employeeId = (session?.user as any)?.employeeId as number | undefined

  useEffect(() => {
    if (!userId) return
    async function load() {
      setLoading(true)
      try {
        if (isHR) {
          const empRes  = await fetch("/api/employees?limit=500")
          const empData = await empRes.json()
          if (!empData.success) return

          const employees = empData.data as Array<{
            id: number
            employee_number: string
            position?: string
            users: { name: string }[]
            section?: { section_name: string }
          }>

          const balResults = await Promise.all(
            employees.map((e) =>
              fetch(`/api/leave-balance?employeeId=${e.id}&year=${year}`).then((r) => r.json())
            )
          )

          setRows(
            employees
              .map((e, i) => ({
                employeeId:     e.id,
                employeeNumber: e.employee_number,
                name:           e.users?.[0]?.name ?? "—",
                position:       e.position,
                section:        e.section?.section_name,
                balance:        balResults[i]?.data ?? null,
              }))
              .filter((r) => r.balance !== null) as EmployeeBalanceRow[]
          )
        } else {
          if (!employeeId) return
          const res  = await fetch(`/api/leave-balance?employeeId=${employeeId}&year=${year}`)
          const data = await res.json()
          if (data.success) {
            setRows([{
              employeeId,
              employeeNumber: "",
              name:    session?.user?.name ?? "",
              balance: data.data,
            }])
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId, isHR, year, employeeId])

  const filtered = useMemo(() => {
    if (!search || !isHR) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.employeeNumber.toLowerCase().includes(q) ||
        (r.section?.toLowerCase().includes(q) ?? false)
    )
  }, [rows, search, isHR])

  const totalPages = Math.ceil(filtered.length / LIMIT)
  const paginated  = filtered.slice((page - 1) * LIMIT, page * LIMIT)

  const stats = useMemo(() => ({
    totalRemaining: rows.reduce((s, r) => s + r.balance.annual_remaining, 0),
    totalUsed:      rows.reduce((s, r) => s + r.balance.annual_used, 0),
    lowCount:       rows.filter((r) => r.balance.annual_remaining <= Math.round(r.balance.annual_total * 0.2)).length,
  }), [rows])

  const currentYear = new Date().getFullYear()

  const headers = isHR
    ? ["Employee", "Annual Leave", "Sick Leave", "Unpaid Used", "Maternity Used", "Carried Over"]
    : ["Annual Leave", "Sick Leave", "Unpaid Used", "Maternity Used", "Carried Over"]

  return (
    <div style={{ padding: "28px 32px", fontFamily: "inherit" }}>
      <PageHeader
        title="Leave Balances"
        subtitle={`${year} entitlements · ${rows.length} employee${rows.length !== 1 ? "s" : ""}`}
        actions={
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Year:</span>
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <button
                key={y}
                onClick={() => { setYear(y); setPage(1) }}
                style={{
                  padding: "5px 12px",
                  border: `1px solid ${year === y ? "#111827" : "#E5E7EB"}`,
                  borderRadius: 5,
                  background: year === y ? "#111827" : "#fff",
                  color: year === y ? "#fff" : "#374151",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {y}
              </button>
            ))}
          </div>
        }
      />

      {/* HR stats */}
      {isHR && (
        <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          <StatChip label="Employees"              value={rows.length} />
          <StatChip label="Annual Days Remaining"  value={stats.totalRemaining} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" />
          <StatChip label="Annual Days Used"       value={stats.totalUsed}      color="#374151" bg="#F9FAFB" border="#E5E7EB" />
          <StatChip label="Low Balance Alerts"     value={stats.lowCount}       color="#B91C1C" bg="#FEF2F2" border="#FECACA" />
        </div>
      )}

      {/* Employee personal summary */}
      {!isHR && rows[0] && <PersonalBalanceSummary balance={rows[0].balance} />}

      {/* HR filter */}
      {isHR && (
        <FilterBar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          showStatusFilter={false}
        />
      )}

      {/* HR table */}
      {isHR && (
        <>
          <TableShell headers={headers}>
            {loading ? (
              <SkeletonRows cols={headers.length} />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={headers.length}>
                  <EmptyState
                    icon="◎"
                    heading="No balance records"
                    body="Balance records will appear here once employees are added to the system."
                  />
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={row.employeeId}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFAFA")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: "#F3F4F6", border: "1px solid #E5E7EB",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 800, color: "#374151", flexShrink: 0,
                        }}
                      >
                        {getInitials(row.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{row.name}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {row.employeeNumber}{row.section ? ` · ${row.section}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <BalanceCell used={row.balance.annual_used}   total={row.balance.annual_total}   color="#3B82F6" />
                  <BalanceCell used={row.balance.sick_used}     total={row.balance.sick_total}     color="#8B5CF6" />
                  <td style={TD}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{row.balance.unpaid_used}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4 }}>days</span>
                  </td>
                  <td style={TD}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{row.balance.maternity_used}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4 }}>days</span>
                  </td>
                  <td style={TD}>
                    {row.balance.carried_over > 0 ? (
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#B45309", background: "#FFFBEB", padding: "2px 7px", borderRadius: 4, border: "1px solid #FDE68A", fontSize: 12 }}>
                        +{row.balance.carried_over}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "#D1D5DB" }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </TableShell>
          <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={LIMIT} onChange={setPage} />
        </>
      )}
    </div>
  )
}