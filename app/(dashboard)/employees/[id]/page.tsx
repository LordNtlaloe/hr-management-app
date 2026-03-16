// app/employees/[id]/page.tsx (or wherever your detail page is)
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { UserRole } from "@/types/role"
import { Employee } from "@/types/employee"
import {
    ArrowLeft, Edit, AlertCircle,
    Mail, MapPin, Calendar, Briefcase,
    GraduationCap, Heart, FileText, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

const CAN_EDIT = [UserRole.ADMIN, UserRole.HR_OFFICER]

export default function EmployeeDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { data: session } = useSession()
    const userRole = (session?.user as any)?.role as UserRole ?? UserRole.EMPLOYEE
    const canEdit = CAN_EDIT.includes(userRole)

    const [employee, setEmployee] = React.useState<Employee | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!id) return
        async function load() {
            try {
                const res = await fetch(`/api/employees/${id}`)
                const json = await res.json()
                if (!json.success) throw new Error(json.error)
                setEmployee(json.data)
                console.log('Employee data:', json.data) // Debug log
            } catch (err: any) {
                setError(err.message ?? "Failed to load employee")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    if (loading) return <DetailSkeleton />

    if (error || !employee) return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error ?? "Employee not found"}</AlertDescription>
            </Alert>
        </div>
    )

    const user = employee.users?.[0]
    const initials = user?.name
        ?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        ?? employee.employee_number.slice(0, 2).toUpperCase()

    const education = employee.education_history
    const employment = employee.employment_history

    return (
        <div className="flex flex-col gap-6 p-6">

            {/* Back + actions */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Employees
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline" size="sm"
                        onClick={() => router.push(`/employees/${id}/leave`)}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Leave History
                        <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                    {canEdit && (
                        <Button size="sm" onClick={() => router.push(`/employees/${id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Hero card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <Avatar className="h-20 w-20 text-lg">
                            <AvatarImage src={employee.picture ?? undefined} />
                            <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold">{user?.name ?? "—"}</h1>
                                <Badge variant={employee.is_active ? "default" : "secondary"}>
                                    {employee.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{employee.employee_number}</Badge>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                {user?.email && (
                                    <span className="flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5" />{user.email}
                                    </span>
                                )}
                                {employee.current_address && (
                                    <span className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5" />{employee.current_address}
                                    </span>
                                )}
                                {employee.date_of_birth && (
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Born {format(new Date(employee.date_of_birth), "MMM d, yyyy")}
                                    </span>
                                )}
                                {employee.created_at && (
                                    <span className="flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        Joined {format(new Date(employee.created_at), "MMM d, yyyy")}
                                    </span>
                                )}
                            </div>
                            {employee.section && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Section: </span>
                                    <span className="font-medium">{employee.section.section_name}</span>
                                    {employee.section.employee_position && (
                                        <span className="text-muted-foreground"> · {employee.section.employee_position}</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detail grid */}
            <div className="grid gap-6 lg:grid-cols-2">

                {/* Personal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Heart className="h-4 w-4" />Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <DetailRow label="Gender" value={employee.gender} />
                            <DetailRow label="Citizen" value={employee.is_citizen ? "Yes" : "No"} />
                            <DetailRow label="Place of Birth" value={employee.place_of_birth} />
                            {employee.is_citizen ? (
                                <>
                                    <DetailRow label="District" value={employee.district} />
                                    <DetailRow label="Chief" value={employee.chief_name} span />
                                </>
                            ) : (
                                <DetailRow label="Nationality" value={employee.nationality} />
                            )}
                        </dl>

                        {employee.legal_info && (
                            <>
                                <Separator className="my-4" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Legal</p>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    <DetailRow label="Father's Name" value={employee.legal_info.father_name} span />
                                    <DetailRow label="Marital Status" value={employee.legal_info.marital_status} />
                                    <DetailRow label="Father Deceased" value={employee.legal_info.is_father_deceased ? "Yes" : "No"} />
                                    {employee.legal_info.has_criminal_record && (
                                        <DetailRow label="Criminal Record" value={employee.legal_info.criminal_record_info} span />
                                    )}
                                    {employee.legal_info.has_been_dismissed && (
                                        <DetailRow label="Prev. Dismissal" value={employee.legal_info.dismissal_reason} span />
                                    )}
                                </dl>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Employment & Education */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <GraduationCap className="h-4 w-4" />Employment & Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {/* Education Section */}
                        {education ? (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Education</p>
                                <div className="space-y-1">
                                    <p className="font-medium">{education.school_name || "—"}</p>
                                    <p className="text-muted-foreground">{education.qualification || "—"}</p>
                                    {education.date_of_entry && education.date_of_leave && (
                                        <p className="text-muted-foreground text-xs">
                                            {format(new Date(education.date_of_entry), "MMM yyyy")}
                                            {" – "}
                                            {format(new Date(education.date_of_leave), "MMM yyyy")}
                                        </p>
                                    )}
                                    {(education.additional_skills?.length ?? 0) > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {education.additional_skills.map((s: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Education</p>
                                <p className="text-muted-foreground text-sm">No education history recorded.</p>
                            </div>
                        )}

                        <Separator />

                        {/* Employment Section */}
                        {employment ? (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Previous Employment</p>
                                <div className="space-y-1">
                                    <p className="font-medium">{employment.employer_name || "—"}</p>
                                    <p className="text-muted-foreground">{employment.employer_position || "—"}</p>
                                    {employment.employment_start && employment.employment_end && (
                                        <p className="text-muted-foreground text-xs">
                                            {format(new Date(employment.employment_start), "MMM yyyy")}
                                            {" – "}
                                            {format(new Date(employment.employment_end), "MMM yyyy")}
                                        </p>
                                    )}
                                    {employment.reason_for_leaving && (
                                        <p className="text-muted-foreground text-xs mt-1">
                                            Reason: {employment.reason_for_leaving}
                                        </p>
                                    )}
                                    {(employment.duties?.length ?? 0) > 0 && (
                                        <div className="mt-2">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Duties:</p>
                                            <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
                                                {employment.duties.map((d: string, i: number) => (
                                                    <li key={i}>{d}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Previous Employment</p>
                                <p className="text-muted-foreground text-sm">No employment history recorded.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Documents — HR only */}
                {canEdit && employee.employee_documents && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                                <DetailRow label="National ID" value={employee.employee_documents.national_id} />
                                <DetailRow label="Passport" value={employee.employee_documents.passport} />
                                <DetailRow label="Driver's License" value={employee.employee_documents.drivers_license} />
                                <DetailRow label="Police Clearance" value={employee.employee_documents.police_clearance} />
                                <DetailRow label="Medical Certificate" value={employee.employee_documents.medical_certificates} />
                                <DetailRow
                                    label="Academic Certificates"
                                    value={`${employee.employee_documents.acdemic_certificates?.length ?? 0} file(s)`}
                                />
                            </dl>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

// ── Helpers ───────────────────────────────────────────────────────

function DetailRow({ label, value, span }: { label: string; value?: string | null; span?: boolean }) {
    return (
        <div className={span ? "col-span-2" : ""}>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="font-medium text-sm">{value ?? "—"}</dd>
        </div>
    )
}

function DetailSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-36 w-full rounded-xl" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        </div>
    )
}