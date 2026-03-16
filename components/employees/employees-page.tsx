"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Calendar, FileText, Clock, TrendingUp,
    Download, ChevronRight, AlertCircle, CheckCircle2,
    XCircle, Hourglass,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "@/lib/auth-client"
import { format } from "date-fns"

interface LeaveBalance {
    annual_total: number
    annual_remaining: number
    sick_total: number
    sick_remaining: number
    unpaid_used: number
    maternity_used: number
    carried_over: number
    year: number
}

interface LeaveApplication {
    id: number
    leave_type: string
    start_date: string
    end_date: string
    days_requested: number
    status: string
    applied_at: string
    reason: string
}

interface EmployeeSelfData {
    employee: any
    leaveBalance: LeaveBalance | null
    recentApplications: LeaveApplication[]
    upcomingLeave: LeaveApplication[]
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    PENDING: { label: "Pending", icon: Hourglass, className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400" },
    APPROVED: { label: "Approved", icon: CheckCircle2, className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400" },
    REJECTED: { label: "Rejected", icon: XCircle, className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400" },
    CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400" },
}

export default function EmployeePortalPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [data, setData] = React.useState<EmployeeSelfData | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/me")
                const json = await res.json()
                if (!json.success) throw new Error(json.error)
                setData(json.data)
            } catch (err: any) {
                setError(err.message ?? "Failed to load your profile")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const user = session?.user as any
    const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "ME"

    if (loading) return <EmployeePortalSkeleton />

    if (error) return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    )

    const lb = data?.leaveBalance
    const annualUsed = lb ? lb.annual_total - lb.annual_remaining : 0
    const sickUsed = lb ? lb.sick_total - lb.sick_remaining : 0

    return (
        <div className="flex flex-col gap-6 p-6">

            {/* ── Welcome Header ── */}
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Good {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(), "EEEE, MMMM d, yyyy")} · Employee Portal
                    </p>
                </div>
            </div>

            {/* ── Leave Balance Cards ── */}
            {lb && (
                <section>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Leave Balance · {lb.year}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <LeaveBalanceCard
                            label="Annual Leave"
                            used={annualUsed}
                            total={lb.annual_total}
                            remaining={lb.annual_remaining}
                            color="bg-blue-500"
                        />
                        <LeaveBalanceCard
                            label="Sick Leave"
                            used={sickUsed}
                            total={lb.sick_total}
                            remaining={lb.sick_remaining}
                            color="bg-orange-500"
                        />
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Carried Over</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{lb.carried_over}</div>
                                <p className="text-xs text-muted-foreground mt-1">days from {lb.year - 1}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid Used</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{lb.unpaid_used}</div>
                                <p className="text-xs text-muted-foreground mt-1">days this year</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {/* ── Quick Actions ── */}
            <section>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickActionCard
                        icon={Calendar}
                        label="Apply for Leave"
                        description="Submit a new leave request"
                        onClick={() => router.push("/portal/leave/new")}
                        accent="blue"
                    />
                    <QuickActionCard
                        icon={FileText}
                        label="My Applications"
                        description="View all leave requests"
                        onClick={() => router.push("/portal/leave")}
                        accent="violet"
                    />
                    <QuickActionCard
                        icon={TrendingUp}
                        label="My Profile"
                        description="View and update your details"
                        onClick={() => router.push("/portal/profile")}
                        accent="emerald"
                    />
                    <QuickActionCard
                        icon={Download}
                        label="Payslips"
                        description="Download your payslips"
                        onClick={() => router.push("/portal/payslips")}
                        accent="amber"
                    />
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* ── Recent Applications ── */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base">Recent Leave Applications</CardTitle>
                            <CardDescription>Your last 5 requests</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/portal/leave")}>
                            View all <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data?.recentApplications.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No applications yet.</p>
                        ) : (
                            data?.recentApplications.map((app) => {
                                const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.PENDING
                                const Icon = cfg.icon
                                return (
                                    <div
                                        key={app.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/portal/leave/${app.id}`)}
                                    >
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium">{formatLeaveType(app.leave_type)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(app.start_date), "MMM d")} – {format(new Date(app.end_date), "MMM d, yyyy")}
                                                {" · "}{app.days_requested} day{app.days_requested !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
                                            <Icon className="h-3 w-3" />
                                            {cfg.label}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>

                {/* ── Upcoming Approved Leave ── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Upcoming Leave</CardTitle>
                        <CardDescription>Approved leave scheduled ahead</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data?.upcomingLeave.length === 0 ? (
                            <div className="flex flex-col items-center py-8 gap-2 text-center">
                                <Clock className="h-8 w-8 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">No upcoming leave scheduled.</p>
                                <Button size="sm" variant="outline" onClick={() => router.push("/portal/leave/new")}>
                                    Apply for leave
                                </Button>
                            </div>
                        ) : (
                            data?.upcomingLeave.map((app) => {
                                const daysUntil = Math.ceil((new Date(app.start_date).getTime() - Date.now()) / 86_400_000)
                                return (
                                    <div key={app.id} className="rounded-lg border p-3 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{formatLeaveType(app.leave_type)}</p>
                                            <Badge variant="outline" className="text-xs">
                                                {daysUntil === 0 ? "Today" : `In ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(app.start_date), "MMMM d")} – {format(new Date(app.end_date), "MMMM d, yyyy")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{app.days_requested} days · {app.reason}</p>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// ── Sub-components ────────────────────────────────────────────────

function LeaveBalanceCard({
    label, used, total, remaining, color,
}: { label: string; used: number; total: number; remaining: number; color: string }) {
    const pct = total > 0 ? (used / total) * 100 : 0
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">{remaining}</span>
                    <span className="text-sm text-muted-foreground mb-0.5">/ {total} days</span>
                </div>
                <Progress value={pct} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{used} used · {remaining} remaining</p>
            </CardContent>
        </Card>
    )
}

function QuickActionCard({
    icon: Icon, label, description, onClick, accent,
}: { icon: React.ElementType; label: string; description: string; onClick: () => void; accent: string }) {
    const accentClasses: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        violet: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    }
    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
            onClick={onClick}
        >
            <CardContent className="pt-5 pb-4">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${accentClasses[accent]} mb-3`}>
                    <Icon className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </CardContent>
        </Card>
    )
}

function EmployeePortalSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-36" />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
        </div>
    )
}

// ── Helpers ───────────────────────────────────────────────────────

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "morning"
    if (h < 17) return "afternoon"
    return "evening"
}

function formatLeaveType(type: string) {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}