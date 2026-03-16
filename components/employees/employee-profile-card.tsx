"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    GraduationCap,
    Heart,
    FileText,
    Edit,
    Download,
} from "lucide-react"
import { Employee } from "@/types/employee"
import { format } from "date-fns"

interface EmployeeProfileCardProps {
    employee: Employee
    onEdit?: () => void
    onDownloadDocuments?: () => void
    userRole: string
}

export function EmployeeProfileCard({
    employee,
    onEdit,
    onDownloadDocuments,
    userRole
}: EmployeeProfileCardProps) {
    const canEdit = ["ADMIN", "HR_OFFICER"].includes(userRole)
    const user = employee.users?.[0]
    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || employee.employee_number.slice(0, 2)

    const getMaritalStatusIcon = (status: string) => {
        switch (status) {
            case "MARRIED": return "💍"
            case "SINGLE": return "👤"
            case "DIVORCED": return "⚖️"
            case "WIDOWED": return "💔"
            default: return "❓"
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={employee.picture} alt={employee.employee_number} />
                            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <h2 className="text-2xl font-bold">{user?.name || "—"}</h2>
                                <Badge variant={employee.is_active ? "default" : "secondary"}>
                                    {employee.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{employee.employee_number}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {user?.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{employee.current_address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Born: {format(new Date(employee.date_of_birth), "MMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="h-4 w-4" />
                                    <span>Joined: {format(new Date(employee.created_at), "MMM d, yyyy")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {canEdit && (
                                <Button onClick={onEdit}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                            )}
                            <Button variant="outline" onClick={onDownloadDocuments}>
                                <Download className="mr-2 h-4 w-4" />
                                Documents
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Place of Birth</p>
                                <p className="font-medium">{employee.place_of_birth}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Gender</p>
                                <p className="font-medium">{employee.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Citizen</p>
                                <p className="font-medium">{employee.is_citizen ? "Yes" : "No"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Nationality</p>
                                <p className="font-medium">{employee.nationality || "—"}</p>
                            </div>
                            {employee.chief_name && (
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Chief's Name</p>
                                    <p className="font-medium">{employee.chief_name}</p>
                                </div>
                            )}
                            {employee.district && (
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">District</p>
                                    <p className="font-medium">{employee.district}</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {employee.legal_info && (
                            <>
                                <h3 className="font-semibold">Legal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Father's Name</p>
                                        <p className="font-medium">{employee.legal_info.father_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Marital Status</p>
                                        <p className="font-medium">
                                            {getMaritalStatusIcon(employee.legal_info.marital_status)} {employee.legal_info.marital_status}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Father Deceased</p>
                                        <p className="font-medium">{employee.legal_info.is_father_deceased ? "Yes" : "No"}</p>
                                    </div>
                                    {employee.legal_info.has_criminal_record && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-muted-foreground">Criminal Record</p>
                                            <p className="font-medium">{employee.legal_info.criminal_record_info}</p>
                                        </div>
                                    )}
                                    {employee.legal_info.has_been_dismissed && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-muted-foreground">Previous Dismissal</p>
                                            <p className="font-medium">{employee.legal_info.dismissal_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Employment & Education */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Employment & Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {employee.section && (
                            <div>
                                <p className="text-sm text-muted-foreground">Current Section</p>
                                <p className="font-medium">{employee.section.section_name}</p>
                                <p className="text-sm">{employee.section.employee_position}</p>
                            </div>
                        )}

                        <Separator />

                        {employee.education_history && (
                            <>
                                <h3 className="font-semibold">Education</h3>
                                <div>
                                    <p className="font-medium">{employee.education_history.school_name}</p>
                                    <p className="text-sm">{employee.education_history.qualification}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(employee.education_history.date_of_entry), "yyyy")} - {format(new Date(employee.education_history.date_of_leave), "yyyy")}
                                    </p>
                                </div>
                                {employee.education_history.additional_skills.length > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Additional Skills</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {employee.education_history.additional_skills.map((skill, i) => (
                                                <Badge key={i} variant="secondary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {employee.employment_history && (
                            <>
                                <Separator />
                                <h3 className="font-semibold">Previous Employment</h3>
                                <div>
                                    <p className="font-medium">{employee.employment_history.employer_name}</p>
                                    <p className="text-sm">{employee.employment_history.employer_position}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(employee.employment_history.employment_start), "MMM yyyy")} - {format(new Date(employee.employment_history.employment_end), "MMM yyyy")}
                                    </p>
                                    <p className="text-sm mt-1">Salary: {employee.employment_history.salary}</p>
                                    <p className="text-sm">Reason for leaving: {employee.employment_history.reason_for_leaving}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Duties</p>
                                    <ul className="list-disc list-inside text-sm">
                                        {employee.employment_history.duties.map((duty, i) => (
                                            <li key={i}>{duty}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Documents */}
                {employee.employee_documents && (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">National ID</p>
                                    <p className="font-medium">{employee.employee_documents.national_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Passport</p>
                                    <p className="font-medium">{employee.employee_documents.passport || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Driver's License</p>
                                    <p className="font-medium">{employee.employee_documents.drivers_license || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Police Clearance</p>
                                    <p className="font-medium">{employee.employee_documents.police_clearance || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Medical Certificate</p>
                                    <p className="font-medium">{employee.employee_documents.medical_certificates || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Academic Certificates</p>
                                    <p className="font-medium">{employee.employee_documents.acdemic_certificates.length} files</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}