export enum UserRole {
    ADMIN = "ADMIN",
    HR_OFFICER = "HR_OFFICER",
    EMPLOYEE = "EMPLOYEE",
    SECTION_HEAD = "SECTION_HEAD",
    HEAD_OF_DEPARTMENT = "HEAD_OF_DEPARTMENT"
}

export interface NavItem {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    items?: NavItem[]
    badge?: number | { count: number; variant?: "default" | "destructive" | "outline" | "secondary" }
    permissions?: UserRole[] // Which roles can see this item
}

export interface NavSection {
    title?: string
    items: NavItem[]
    permissions?: UserRole[]
}

export interface UserInfo {
    name: string
    email: string
    avatar?: string
    role: UserRole
}