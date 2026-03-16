"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    UserPlus, Download, Upload, Mail, FileText,
    Settings, MoreVertical, RefreshCw, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

import { UserRole } from "@/types/role"
import { Employee } from "@/types/employee"
import { useSession } from "@/lib/auth-client"
import { EmployeeCharts } from "./employee-chart"
import { EmployeeDataTable } from "./employee-data-table"
import { EmployeeFilterValues, EmployeeFilters } from "./employee-filters"
import { EmployeeStatsCards } from "./employee-stat-cards"

interface EmployeeMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface StatsData {
    total: number
    active: number
    inactive: number
    bySectionData: { section: string; count: number }[]
    byGenderData: { gender: string; count: number }[]
}

export default function HRManagerPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const userRole = (session?.user as any)?.role ?? UserRole.HR_OFFICER

    const [employees, setEmployees] = React.useState<Employee[]>([])
    const [meta, setMeta] = React.useState<EmployeeMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 })
    const [stats, setStats] = React.useState<StatsData | null>(null)
    const [sections, setSections] = React.useState<{ id: number; section_name: string }[]>([])
    const [filters, setFilters] = React.useState<EmployeeFilterValues>({})
    const [loading, setLoading] = React.useState(true)
    const [statsLoading, setStatsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // ── Fetch employees ──────────────────────────────────
    const fetchEmployees = React.useCallback(async (page = 1) => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({ page: String(page), limit: "10" })
            if (filters.search) params.set("search", filters.search)
            if (filters.sectionId) params.set("sectionId", String(filters.sectionId))
            if (filters.gender) params.set("gender", filters.gender)
            if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive))

            const res = await fetch(`/api/employees?${params}`)
            const json = await res.json()
            if (!json.success) throw new Error(json.error)
            setEmployees(json.data)
            setMeta(json.meta)
        } catch (err: any) {
            setError(err.message ?? "Failed to load employees")
        } finally {
            setLoading(false)
        }
    }, [filters])

    // ── Fetch stats ──────────────────────────────────────
    const fetchStats = React.useCallback(async () => {
        setStatsLoading(true)
        try {
            const res = await fetch("/api/employees/stats")
            const json = await res.json()
            if (json.success) setStats(json.data)
        } finally {
            setStatsLoading(false)
        }
    }, [])

    // ── Fetch sections for filter dropdown ───────────────
    const fetchSections = React.useCallback(async () => {
        try {
            const res = await fetch("/api/sections")
            const json = await res.json()
            if (json.success) setSections(json.data)
        } catch { /* non-critical */ }
    }, [])

    React.useEffect(() => { fetchEmployees() }, [fetchEmployees])
    React.useEffect(() => { fetchStats(); fetchSections() }, [fetchStats, fetchSections])

    // ── Actions ──────────────────────────────────────────
    const handleExport = async () => {
        try {
            const res = await fetch("/api/employees/export")
            if (!res.ok) throw new Error("Export failed")
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `employees-${new Date().toISOString().split("T")[0]}.csv`
            a.click()
            URL.revokeObjectURL(url)
            toast.success("Export complete")
        } catch {
            toast.error("Failed to export employees")
        }
    }

    const handleDelete = async (employee: Employee) => {
        if (!confirm(`Delete employee ${employee.employee_number}? This cannot be undone.`)) return
        try {
            const res = await fetch(`/api/employees/${employee.id}`, { method: "DELETE" })
            const json = await res.json()
            if (!json.success) throw new Error(json.error)
            toast.success("Employee deleted")
            fetchEmployees()
            fetchStats()
        } catch (err: any) {
            toast.error(err.message ?? "Failed to delete employee")
        }
    }

    const handleBulkEmail = async () => {
        toast.info("Opening email composer…")
        router.push("/hr/email")
    }

    return (
        <div className="flex flex-col gap-6 p-6">

            {/* ── Page Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Employee Management</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage all employees, records, and workforce analytics.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => { fetchEmployees(); fetchStats() }} title="Refresh">
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    {["ADMIN", "HR_OFFICER"].includes(userRole) && (
                        <Button onClick={() => router.push("/hr/employees/new")}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />Export CSV
                            </DropdownMenuItem>
                            {["ADMIN", "HR_OFFICER"].includes(userRole) && (
                                <DropdownMenuItem onClick={() => router.push("/hr/employees/import")}>
                                    <Upload className="mr-2 h-4 w-4" />Import Data
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={handleBulkEmail}>
                                <Mail className="mr-2 h-4 w-4" />Send Bulk Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/hr/reports")}>
                                <FileText className="mr-2 h-4 w-4" />Generate Report
                            </DropdownMenuItem>
                            {userRole === "ADMIN" && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/settings/employee")}>
                                        <Settings className="mr-2 h-4 w-4" />Employee Settings
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── Error banner ── */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* ── Stats ── */}
            {statsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            ) : stats ? (
                <EmployeeStatsCards
                    total={stats.total}
                    active={stats.active}
                    inactive={stats.inactive}
                />
            ) : null}

            {/* ── Charts ── */}
            {stats && !statsLoading && (
                <EmployeeCharts
                    bySectionData={stats.bySectionData}
                    byGenderData={stats.byGenderData}
                />
            )}

            {/* ── Filters + Table ── */}
            <div className="space-y-4">
                <EmployeeFilters
                    sections={sections}
                    onFilterChange={(f) => { setFilters(f); fetchEmployees(1) }}
                    initialFilters={filters}
                />

                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <EmployeeDataTable
                        data={employees}
                        userRole={userRole}
                        onView={(e) => router.push(`/hr/employees/${e.id}`)}
                        onEdit={(e) => router.push(`/hr/employees/${e.id}/edit`)}
                        onDelete={handleDelete}
                        onExport={handleExport}
                    />
                )}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-muted-foreground">
                            Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} employees
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline" size="sm"
                                disabled={meta.page <= 1}
                                onClick={() => fetchEmployees(meta.page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline" size="sm"
                                disabled={meta.page >= meta.totalPages}
                                onClick={() => fetchEmployees(meta.page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}