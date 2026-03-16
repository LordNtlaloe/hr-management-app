// components/dashboard/types.ts
export interface DashboardUser {
    id: string
    name: string
    email: string
    role?: string | null
    image?: string | null
}

export interface StatCardProps {
    label: string
    value: string | number
    sub?: string
    icon: React.ReactNode
    accent?: string
    trend?: { value: number; label: string }
}