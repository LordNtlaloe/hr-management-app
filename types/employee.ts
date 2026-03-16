import { Role, Gender, MARITAL_STATUS, LeaveStatus, LeaveType } from "@prisma/client"

export interface Employee {
    id: number
    employee_number: string
    current_address: string
    date_of_birth: Date
    gender: Gender
    picture: string
    place_of_birth: string
    is_citizen: boolean
    chief_name?: string | null
    district?: string | null
    nationality?: string | null
    is_active: boolean
    created_at: Date
    updated_at: Date
    users?: User[]
    section?: Section | null
    legal_info?: LegalInfo | null
    education_history?: EducationHistory | null
    employment_history?: EmploymentHistory | null
    references?: References | null
    employee_documents?: EmployeeDocuments | null
    leaveApplications?: LeaveApplication[]
    leaveBalance?: LeaveBalance[]
}

export interface User {
    id: string
    name: string
    email: string
    role: Role
    image?: string | null
    employeeId?: number | null
}

export interface Section {
    id: number
    section_name: string
    employee_position: string
}

export interface LegalInfo {
    father_name: string
    is_father_deceased: boolean
    father_place_of_birth: string
    father_occupation: string
    father_address: string
    marital_status: MARITAL_STATUS
    has_criminal_record: boolean
    criminal_record_info?: string | null
    has_been_dismissed: boolean
    dismissal_reason?: string | null
}

export interface EducationHistory {
    school_name: string
    date_of_entry: Date
    date_of_leave: Date
    qualification: string
    qualification_start_date: Date
    qualification_completion_date: Date
    additional_skills: string[]
}

export interface EmploymentHistory {
    employer_name: string
    employee_address: string
    employer_position: string
    duties: string[]
    employment_start: Date
    employment_end: Date
    salary: string
    reason_for_leaving: string
    notice_period: string
}

export interface References {
    refernce_name: string
    address: string
    occupation: string
    known_for: string
}

export interface EmployeeDocuments {
    national_id: string
    passport: string
    acdemic_certificates: string[]
    police_clearance: string
    medical_certificates: string
    drivers_license: string
}

export interface LeaveApplication {
    id: number
    leave_type: LeaveType
    start_date: Date
    end_date: Date
    days: number
    reason?: string | null
    status: LeaveStatus
    applied_at: Date
    partA?: LeavePartA | null
    partB?: LeavePartB | null
    partC?: LeavePartC | null
    partD?: LeavePartD | null
}

export interface LeavePartA {
    employee_name: string
    employment_number: string
    employee_position?: string | null
    number_of_leave_days: number
    start_date: Date
    end_date: Date
    location_during_leave?: string | null
    phone_number: string
    email: string
    current_address: string
    date_of_request: Date
}

export interface LeavePartB {
    annual_leave_days: number
    deducted_days: number
    remaining_leave_days: number
    date_of_approval?: Date | null
    hr_signature?: string | null
}

export interface LeavePartC {
    supervisor_comments?: string | null
    recommendation?: string | null
    date_of_review?: Date | null
    supervisor_signature?: string | null
}

export interface LeavePartD {
    final_decision?: string | null
    date_of_decision?: Date | null
    approver_signature?: string | null
}

export interface LeaveBalance {
    year: number
    annual_total: number
    annual_used: number
    annual_remaining: number
    sick_total: number
    sick_used: number
    sick_remaining: number
    unpaid_used: number
    maternity_used: number
    carried_over: number
}

export interface EmployeeFilters {
    search?: string
    sectionId?: number
    isActive?: boolean
    gender?: Gender
    page?: number
    limit?: number
}

export interface EmployeeStats {
    total: number
    active: number
    inactive: number
    bySection: { section: string; count: number }[]
    byGender: { gender: string; count: number }[]
    recentHires: Employee[]
    upcomingRetirements: { name: string; date: Date }[]
}