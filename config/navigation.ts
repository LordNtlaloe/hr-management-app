import {
    IconDashboard,
    IconUsers,
    IconCalendarClock,
    IconChartBar,
    IconBriefcase,
    IconSettings,
    IconHelp,
    IconSearch,
    IconReport,
    IconFileText,
    IconClock,
    IconCheckbox,
    IconX,
    IconFileChart,
    IconUserPlus,
    IconDoorExit,
    IconBell,
    IconHome,
    IconUser,
    IconFileDescription,
    IconHistory,
    IconCalendar,
    IconClipboardList,
} from "@tabler/icons-react"

import { NavSection, UserRole } from "@/types/role"

// Role-based navigation configuration
export const navigationConfig: NavSection[] = [
    {
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: IconDashboard,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT, UserRole.EMPLOYEE],
            },
        ],
    },
    {
        title: "MANAGEMENT",
        items: [
            {
                title: "Employees",
                url: "/employees",
                icon: IconUsers,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
                badge: { count: 156, variant: "default" },
                items: [
                    {
                        title: "All Employees",
                        url: "/employees",
                        icon: IconUsers,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER],
                    },
                    {
                        title: "Add Employee",
                        url: "/employees/new",
                        icon: IconUserPlus,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER],
                    },
                    {
                        title: "My Team",
                        url: "/employees/team",
                        icon: IconUsers,
                        permissions: [UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
                    },
                ],
            },
            {
                title: "Leave Management",
                url: "/leave",
                icon: IconCalendarClock,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT, UserRole.EMPLOYEE],
                badge: { count: 12, variant: "destructive" },
                items: [
                    {
                        title: "My Leave",
                        url: "/leave/my-leave",
                        icon: IconCalendar,
                        permissions: [UserRole.EMPLOYEE],
                    },
                    {
                        title: "Apply for Leave",
                        url: "/leave/apply",
                        icon: IconFileDescription,
                        permissions: [UserRole.EMPLOYEE],
                    },
                    {
                        title: "Pending Requests",
                        url: "/leave/pending",
                        icon: IconClock,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
                        badge: 8,
                    },
                    {
                        title: "Approved",
                        url: "/leave/approved",
                        icon: IconCheckbox,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
                    },
                    {
                        title: "Rejected",
                        url: "/leave/rejected",
                        icon: IconX,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
                    },
                    {
                        title: "Leave Balance",
                        url: "/leave/balance",
                        icon: IconFileChart,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.EMPLOYEE],
                    },
                    {
                        title: "Leave History",
                        url: "/leave/history",
                        icon: IconHistory,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.EMPLOYEE],
                    },
                ],
            },
            {
                title: "Reports",
                url: "/reports",
                icon: IconChartBar,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
                items: [
                    {
                        title: "Leave Analytics",
                        url: "/reports/leave-analytics",
                        icon: IconReport,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER],
                    },
                    {
                        title: "Employee Turnover",
                        url: "/reports/turnover",
                        icon: IconDoorExit,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER],
                    },
                    {
                        title: "Attendance",
                        url: "/reports/attendance",
                        icon: IconFileText,
                        permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
                    },
                    {
                        title: "Department Report",
                        url: "/reports/department",
                        icon: IconBriefcase,
                        permissions: [UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
                    },
                ],
            },
            {
                title: "Sections",
                url: "/sections",
                icon: IconBriefcase,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
            },
        ],
    },
    {
        title: "PERSONAL",
        items: [
            {
                title: "My Profile",
                url: "/profile",
                icon: IconUser,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT, UserRole.EMPLOYEE],
            },
            {
                title: "My Leave",
                url: "/leave/my-leave",
                icon: IconCalendarClock,
                permissions: [UserRole.EMPLOYEE],
            },
            {
                title: "My Team",
                url: "/employees/team",
                icon: IconUsers,
                permissions: [UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT],
            },
        ],
    },
    {
        title: "SYSTEM",
        items: [
            {
                title: "Notifications",
                url: "/notifications",
                icon: IconBell,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT, UserRole.EMPLOYEE],
                badge: 3,
            },
            {
                title: "Settings",
                url: "/settings",
                icon: IconSettings,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT, UserRole.EMPLOYEE],
            },
            {
                title: "Help",
                url: "/help",
                icon: IconHelp,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT, UserRole.EMPLOYEE],
            },
            {
                title: "Search",
                url: "/search",
                icon: IconSearch,
                permissions: [UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.SECTION_HEAD, UserRole.HEAD_OF_DEPARTMENT, UserRole.EMPLOYEE],
            },
        ],
    },
]

// Admin-only navigation items
export const adminNavigation: NavSection[] = [
    {
        title: "ADMIN",
        items: [
            {
                title: "User Management",
                url: "/admin/users",
                icon: IconUsers,
                permissions: [UserRole.ADMIN],
            },
            {
                title: "Role Management",
                url: "/admin/roles",
                icon: IconSettings,
                permissions: [UserRole.ADMIN],
            },
            {
                title: "System Logs",
                url: "/admin/logs",
                icon: IconClipboardList,
                permissions: [UserRole.ADMIN],
            },
        ],
    },
]