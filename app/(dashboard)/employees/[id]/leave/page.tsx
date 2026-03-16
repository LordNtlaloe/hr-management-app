"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { UserRole } from "@/types/role"
import { Employee } from "@/types/employee"
import {
    UserPlus, Download, RefreshCw,
    AlertCircle, MoreVertical, Settings, Upload, Mail, FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { EmployeeCharts } from "@/components/employees/employee-chart"
import { EmployeeDataTable } from "@/components/employees/employee-data-table"
import { EmployeeFilterValues, EmployeeFilters } from "@/components/employees/employee-filters"
import { EmployeeStatsCards } from "@/components/employees/employee-stat-cards"

interface Meta { page: number; limit: number; total: number; totalPages: number }
interface Stats { total: number; active: number; inactive: number; bySectionData: any[]; byGenderData: any[] }

const HR_ROLES = [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.HEAD_OF_DEPARTMENT, UserRole.SECTION_HEAD]

export default function EmployeesPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const userRole = (session?.user as any)?.role as UserRole ?? UserRole.EMPLOYEE
    const isHR = HR_ROLES.includes(userRole)

    const [employees, setEmployees] = React.useState<Employee[]>([])
    const [meta, setMeta] = React.useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 0 })
    const [stats, setStats] = React.useState<Stats | null>(null)
    const [sections, setSections] = React.useState<{ id: number; section_name: string }[]>([])
    const [filters, setFilters] = React.useState<EmployeeFilterValues>({})
    const [loading, setLoading] = React.useState(true)
    const [statsLoading, setStatsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // ── Fetch ─────────────────────────────────────────────────────
    const fetchEmployees = React.useCallback(async (page = 1) => {
        setLoading(true)
        setError(null)
        try {
            // Employees only see themselves
            if (!isHR) {
                const res = await fetch("/api/me")
                const json = await res.json()
                if (!json.success) throw new Error(json.error)
                setEmployees(json.data.employee ? [json.data.employee] : [])
                setMeta({ page: 1, limit: 1, total: 1, totalPages: 1 })
                return
            }

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
    }, [filters, isHR])

    const fetchStats = React.useCallback(async () => {
        if (!isHR) return
        setStatsLoading(true)
        try {
            const res = await fetch("/api/employees/stats")
            const json = await res.json()
            if (json.success) setStats(json.data)
        } finally {
            setStatsLoading(false)
        }
    }, [isHR])

    const fetchSections = React.useCallback(async () => {
        if (!isHR) return
        try {
            const res = await fetch("/api/sections")
            const json = await res.json()
            if (json.success) setSections(json.data)
        } catch { /* non-critical */ }
    }, [isHR])

    React.useEffect(() => { fetchEmployees() }, [fetchEmployees])
    React.useEffect(() => { fetchStats(); fetchSections() }, [fetchStats, fetchSections])

    // ── Actions ───────────────────────────────────────────────────
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
            toast.success("Export downloaded")
        } catch {
            toast.error("Failed to export")
        }
    }

    const handleDelete = async (employee: Employee) => {
        if (!confirm(`Delete ${employee.employee_number}? This cannot be undone.`)) return
        try {
            const res = await fetch(`/api/employees/${employee.id}`, { method: "DELETE" })
            const json = await res.json()
            if (!json.success) throw new Error(json.error)
            toast.success("Employee deleted")
            fetchEmployees()
            fetchStats()
        } catch (err: any) {
            toast.error(err.message ?? "Failed to delete")
        }
    }

    const handleFilterChange = (f: EmployeeFilterValues) => {
        setFilters(f)
    }

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6 p-6">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isHR ? "Employees" : "My Profile"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {isHR
                            ? "Manage workforce records, view analytics, and track leave."
                            : "View your employment record and leave history."}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline" size="icon"
                        onClick={() => { fetchEmployees(); fetchStats() }}
                        title="Refresh"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    {[UserRole.ADMIN, UserRole.HR_OFFICER].includes(userRole) && (
                        <Button onClick={() => router.push("/employees/new")}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Button>
                    )}

                    {isHR && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleExport}>
                                    <Download className="mr-2 h-4 w-4" />Export CSV
                                </DropdownMenuItem>
                                {[UserRole.ADMIN, UserRole.HR_OFFICER].includes(userRole) && (
                                    <DropdownMenuItem onClick={() => router.push("/employees/import")}>
                                        <Upload className="mr-2 h-4 w-4" />Import Data
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => router.push("/reports")}>
                                    <FileText className="mr-2 h-4 w-4" />Reports
                                </DropdownMenuItem>
                                {userRole === UserRole.ADMIN && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push("/settings/employees")}>
                                            <Settings className="mr-2 h-4 w-4" />Settings
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats — HR only */}
            {isHR && (
                statsLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-xl" />
                        ))}
                    </div>
                ) : stats ? (
                    <>
                        <EmployeeStatsCards
                            total={stats.total}
                            active={stats.active}
                            inactive={stats.inactive}
                        />
                        <EmployeeCharts
                            bySectionData={stats.bySectionData}
                            byGenderData={stats.byGenderData}
                        />
                    </>
                ) : null
            )}

            {/* Filters — HR only */}
            {isHR && (
                <EmployeeFilters
                    sections={sections}
                    onFilterChange={handleFilterChange}
                    initialFilters={filters}
                />
            )}

            {/* Table */}
            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                </div>
            ) : (
                <EmployeeDataTable
                    data={employees}
                    userRole={userRole}
                    onView={(e) => router.push(`/employees/${e.id}`)}
                    onEdit={(e) => router.push(`/employees/${e.id}/edit`)}
                    onDelete={handleDelete}
                    onExport={isHR ? handleExport : undefined}
                />
            )}

            {/* Pagination — HR only */}
            {isHR && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                        Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                            disabled={meta.page <= 1}
                            onClick={() => fetchEmployees(meta.page - 1)}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm"
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => fetchEmployees(meta.page + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}