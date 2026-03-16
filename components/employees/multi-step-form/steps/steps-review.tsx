"use client"

import { format } from "date-fns"
import {
    CheckCircle2,
    User,
    Scale,
    GraduationCap,
    Briefcase,
    Users,
    FileText,
    AlertCircle,
    Edit
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmployeeFormData } from "@/types/employee-form"

interface ReviewStepProps {
    data: EmployeeFormData
    onSubmit: () => void
    onBack: () => void
    isSubmitting: boolean
}

export function ReviewStep({ data, onSubmit, onBack, isSubmitting }: ReviewStepProps) {
    const sections = [
        {
            title: "Personal Information",
            icon: User,
            fields: [
                { label: "Employee Number", value: data.personal.employee_number },
                { label: "Date of Birth", value: data.personal.date_of_birth && format(data.personal.date_of_birth, "PPP") },
                { label: "Gender", value: data.personal.gender },
                { label: "Place of Birth", value: data.personal.place_of_birth },
                { label: "Current Address", value: data.personal.current_address },
                { label: "Citizen", value: data.personal.is_citizen ? "Yes" : "No" },
                { label: "Section ID", value: data.personal.section_id },
                ...(data.personal.is_citizen
                    ? [
                        { label: "Chief/Village Name", value: data.personal.chief_name },
                        { label: "District", value: data.personal.district },
                    ]
                    : [
                        { label: "Nationality", value: data.personal.nationality },
                    ]
                ),
            ],
        },
        {
            title: "Legal Information",
            icon: Scale,
            fields: [
                { label: "Father's Name", value: data.legal.father_name },
                { label: "Father Deceased", value: data.legal.is_father_deceased ? "Yes" : "No" },
                { label: "Father's Place of Birth", value: data.legal.father_place_of_birth },
                { label: "Father's Occupation", value: data.legal.father_occupation },
                { label: "Father's Address", value: data.legal.father_address },
                { label: "Marital Status", value: data.legal.marital_status },
                { label: "Criminal Record", value: data.legal.has_criminal_record ? "Yes" : "No" },
                ...(data.legal.has_criminal_record
                    ? [{ label: "Criminal Record Details", value: data.legal.criminal_record_info }]
                    : []
                ),
                { label: "Previously Dismissed", value: data.legal.has_been_dismissed ? "Yes" : "No" },
                ...(data.legal.has_been_dismissed
                    ? [{ label: "Dismissal Reason", value: data.legal.dismissal_reason }]
                    : []
                ),
            ],
        },
        {
            title: "Education",
            icon: GraduationCap,
            fields: [
                { label: "School/Institution", value: data.education.school_name },
                { label: "Qualification", value: data.education.qualification },
                { label: "Start Date", value: data.education.date_of_entry && format(data.education.date_of_entry, "PPP") },
                { label: "End Date", value: data.education.date_of_leave && format(data.education.date_of_leave, "PPP") },
                { label: "Qualification Start", value: data.education.qualification_start_date && format(data.education.qualification_start_date, "PPP") },
                { label: "Qualification End", value: data.education.qualification_completion_date && format(data.education.qualification_completion_date, "PPP") },
                {
                    label: "Additional Skills",
                    value: data.education.additional_skills?.length > 0
                        ? data.education.additional_skills.join(", ")
                        : "None"
                },
            ],
        },
        {
            title: "Employment History",
            icon: Briefcase,
            fields: [
                { label: "Employer", value: data.employment.employer_name },
                { label: "Position", value: data.employment.employer_position },
                { label: "Employer Address", value: data.employment.employee_address },
                { label: "Start Date", value: data.employment.employment_start && format(data.employment.employment_start, "PPP") },
                { label: "End Date", value: data.employment.employment_end && format(data.employment.employment_end, "PPP") },
                { label: "Salary", value: data.employment.salary },
                { label: "Notice Period", value: data.employment.notice_period },
                { label: "Reason for Leaving", value: data.employment.reason_for_leaving },
                {
                    label: "Duties",
                    value: data.employment.duties?.length > 0
                        ? data.employment.duties.map(d => `• ${d}`).join("\n")
                        : "None"
                },
            ],
        },
        {
            title: "References",
            icon: Users,
            fields: [
                { label: "Reference Name", value: data.references.refernce_name },
                { label: "Occupation", value: data.references.occupation },
                { label: "Address", value: data.references.address },
                { label: "Known For", value: data.references.known_for },
            ],
        },
        {
            title: "Documents",
            icon: FileText,
            fields: [
                { label: "National ID", value: data.documents.national_id },
                { label: "Passport", value: data.documents.passport || "Not provided" },
                { label: "Police Clearance", value: data.documents.police_clearance || "Not uploaded" },
                { label: "Medical Certificate", value: data.documents.medical_certificates || "Not uploaded" },
                { label: "Driver's License", value: data.documents.drivers_license || "Not uploaded" },
                {
                    label: "Academic Certificates",
                    value: data.documents.academic_certificates?.length > 0
                        ? data.documents.academic_certificates.join(", ")
                        : "None"
                },
            ],
        },
    ]

    const OPTIONAL_FIELDS = new Set([
        "Passport",
        "Driver's License",
        "Police Clearance",
        "Medical Certificate",
        "Academic Certificates",
        "Section ID",
        "Additional Skills",
        "Duties",
        "Email",
        "Name",
        "Password",
    ])

    const missingFields = sections.flatMap(section =>
        section.fields
            .filter(field => !field.value && !OPTIONAL_FIELDS.has(field.label))
            .map(field => `${section.title}: ${field.label}`)
    )

    return (
        <div className="space-y-6">
            {missingFields.length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <p className="font-medium mb-2">Missing required information:</p>
                        <ul className="list-disc list-inside text-sm">
                            {missingFields.map((field, i) => (
                                <li key={i}>{field}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="text-lg font-medium">Review Your Information</h3>
            </div>

            <div className="space-y-4">
                {sections.map((section, idx) => {
                    const Icon = section.icon
                    return (
                        <Card key={idx}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle className="text-base">{section.title}</CardTitle>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onBack}
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                    {section.fields.map((field, i) => (
                                        <div key={i} className="col-span-1">
                                            <dt className="text-sm font-medium text-muted-foreground">
                                                {field.label}
                                            </dt>
                                            <dd className="text-sm mt-1 whitespace-pre-line">
                                                {field.value || "—"}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p>By submitting this form, you confirm that all information provided is accurate and complete.</p>
                </div>
            </div>

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack}>
                    Previous
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting || missingFields.length > 0}
                    className="min-w-30"
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin mr-2">⚪</span>
                            Creating...
                        </>
                    ) : (
                        "Create Employee"
                    )}
                </Button>
            </div>
        </div>
    )
}