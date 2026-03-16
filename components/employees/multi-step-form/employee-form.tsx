"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StepIndicator } from "@/components/employees/multi-step-form/step-indicator"
import { DocumentsStep } from "@/components/employees/multi-step-form/steps/documents"
import { EducationStep } from "@/components/employees/multi-step-form/steps/education-history"
import { LegalInfoStep } from "@/components/employees/multi-step-form/steps/legal-info"
import { PersonalInfoStep } from "@/components/employees/multi-step-form/steps/personal-info"
import { ReferencesStep } from "@/components/employees/multi-step-form/steps/references"
import { EmployeeFormData } from "@/types/employee-form"
import { EmploymentStep } from "@/components/employees/multi-step-form/steps/employment-histroy"
import { ReviewStep } from "@/components/employees/multi-step-form/steps/steps-review"
import { Gender, MaritalStatus } from "@/types/enums"

const steps = [
    { title: "Personal", description: "Basic information" },
    { title: "Legal", description: "Legal & family details" },
    { title: "Education", description: "Educational background" },
    { title: "Employment", description: "Work history" },
    { title: "References", description: "Professional references" },
    { title: "Documents", description: "Upload documents" },
    { title: "Review", description: "Review & submit" },
]

interface EmployeeFormProps {
    sections: { id: number; section_name: string }[]
}

const defaultPersonalInfo = {
    employee_number: "",
    current_address: "",
    date_of_birth: new Date(),
    gender: Gender.MALE,
    picture: "",
    place_of_birth: "",
    is_citizen: true,
    chief_name: "",
    district: "",
    nationality: "",
    position: "",
    section_id: undefined,
    name: "",
    email: "",
    password: "",
}

const defaultLegalInfo = {
    father_name: "",
    is_father_deceased: false,
    father_place_of_birth: "",
    father_occupation: "",
    father_address: "",
    marital_status: MaritalStatus.SINGLE,
    has_criminal_record: false,
    criminal_record_info: "",
    has_been_dismissed: false,
    dismissal_reason: "",
}

const defaultEducation = {
    school_name: "",
    date_of_entry: new Date(),
    date_of_leave: new Date(),
    qualification: "",
    qualification_start_date: new Date(),
    qualification_completion_date: new Date(),
    additional_skills: [],
}

const defaultEmployment = {
    employer_name: "",
    employee_address: "",
    employer_position: "",
    duties: [],
    employment_start: new Date(),
    employment_end: new Date(),
    salary: "",
    reason_for_leaving: "",
    notice_period: "",
}

const defaultReferences = {
    refernce_name: "",
    address: "",
    occupation: "",
    known_for: "",
}

const defaultDocuments = {
    national_id: "",
    passport: "",
    academic_certificates: [],
    police_clearance: "",
    medical_certificates: "",
    drivers_license: "",
}

export default function EmployeeForm({ sections }: EmployeeFormProps) {
    const router = useRouter()
    const { data: session } = useSession()
    const [currentStep, setCurrentStep] = React.useState(1)
    const [formData, setFormData] = React.useState<EmployeeFormData>({
        personal: defaultPersonalInfo,
        legal: defaultLegalInfo,
        education: defaultEducation,
        employment: defaultEmployment,
        references: defaultReferences,
        documents: defaultDocuments,
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFormData = (step: keyof EmployeeFormData, data: any) => {
        setFormData(prev => ({
            ...prev,
            [step]: data,
        }))
    }

    const handleNext = () => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch("/api/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create employee")
            }

            toast.success("Employee created successfully", {
                description: `Employee ${data.data.employee_number} has been added.`,
            })

            router.push(`/employees/${data.data.id}`)
        } catch (err: any) {
            setError(err.message)
            toast.error("Failed to create employee", {
                description: err.message,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <PersonalInfoStep
                        data={formData.personal as any}
                        onUpdate={(data) => updateFormData("personal", data)}
                        onNext={handleNext}
                        sections={sections}
                    />
                )
            case 2:
                return (
                    <LegalInfoStep
                        data={formData.legal}
                        onUpdate={(data) => updateFormData("legal", data)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )
            case 3:
                return (
                    <EducationStep
                        data={formData.education}
                        onUpdate={(data) => updateFormData("education", data)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )
            case 4:
                return (
                    <EmploymentStep
                        data={formData.employment}
                        onUpdate={(data) => updateFormData("employment", data)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )
            case 5:
                return (
                    <ReferencesStep
                        data={formData.references}
                        onUpdate={(data) => updateFormData("references", data)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )
            case 6:
                return (
                    <DocumentsStep
                        data={formData.documents}
                        onUpdate={(data) => updateFormData("documents", data)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )
            case 7:
                return (
                    <ReviewStep
                        data={formData}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            <StepIndicator steps={steps} currentStep={currentStep} />

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="p-6">
                {renderStep()}
            </Card>

            <div className="text-sm text-muted-foreground text-center">
                Step {currentStep} of {steps.length}
            </div>
        </div>
    )
}