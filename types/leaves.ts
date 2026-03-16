// types/leave.ts

export type LeaveStatus =
    | "PENDING"
    | "HR_REVIEW"
    | "SUPERVISOR_REVIEW"
    | "FINAL_REVIEW"
    | "APPROVED"
    | "REJECTED"

export type LeaveType = "ANNUAL" | "SICK" | "UNPAID" | "MATERNITY"

export type Role =
    | "ADMIN"
    | "HR_OFFICER"
    | "EMPLOYEE"
    | "SECTION_HEAD"
    | "HEAD_OF_DEPARTMENT"

export interface LeavePartA {
    id: number
    employee_name: string
    employment_number: string
    employee_position?: string
    number_of_leave_days: number
    start_date: string
    end_date: string
    location_during_leave?: string
    phone_number: string
    email: string
    current_address: string
    date_of_request: string
    employee_signature: string
    filled_at: string
    filled_by: { name: string; email: string }
}

export interface LeavePartB {
    id: number
    annual_leave_days: number
    deducted_days: number
    remaining_leave_days: number
    date_of_approval?: string
    hr_signature?: string
    filled_at: string
    filled_by: { name: string; email: string }
}

export interface LeavePartC {
    id: number
    supervisor_comments?: string
    recommendation?: "RECOMMEND" | "NOT_RECOMMEND"
    date_of_review?: string
    supervisor_signature?: string
    filled_at: string
    filled_by: { name: string; email: string }
}

export interface LeavePartD {
    id: number
    final_decision: "APPROVED" | "REJECTED"
    date_of_decision?: string
    approver_signature?: string
    filled_at: string
    filled_by: { name: string; email: string }
}

export interface LeaveApplication {
    id: number
    leave_type: LeaveType
    start_date: string
    end_date: string
    days: number
    reason?: string
    status: LeaveStatus
    applied_at: string
    rejection_reason?: string
    rejected_at?: string
    employee?: {
        id: number
        employee_number: string
        position?: string
        users: { name: string; email: string }[]
        section?: { section_name: string }
        leaveBalance?: LeaveBalance
    }
    user?: { id: string; name: string; email: string; role?: Role }
    partA?: LeavePartA
    partB?: LeavePartB
    partC?: LeavePartC
    partD?: LeavePartD
}

export interface LeaveBalance {
    id: number
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

export interface PaginatedResponse<T> {
    success: boolean
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}