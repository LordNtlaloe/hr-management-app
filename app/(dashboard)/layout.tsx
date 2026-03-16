"use client"
import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { IconBriefcase, IconBell, IconSearch, IconUserCircle, IconSettings, IconHelp, IconLogout, IconCreditCard, IconNotification, IconChevronDown } from "@tabler/icons-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarProvider,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useSession, signOut } from "@/lib/auth-client"
import { navigationConfig, adminNavigation } from "@/config/navigation"
import { NavSection, UserInfo, UserRole } from "@/types/role"

// Extend the session user type to include role
interface ExtendedUser {
    id: string
    name: string
    email: string
    image?: string | null
    role: UserRole
    createdAt: Date
    updatedAt: Date
    emailVerified: boolean
}

// ==================== Nav Components ====================

interface NavMainProps {
    section: NavSection
    pathname: string
}

function NavMain({ section, pathname }: NavMainProps) {
    const [openItems, setOpenItems] = React.useState<string[]>([])

    const toggleItem = (title: string) => {
        setOpenItems(prev =>
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        )
    }

    const renderBadge = (badge?: number | { count: number; variant?: string }) => {
        if (!badge) return null

        const count = typeof badge === 'number' ? badge : badge.count
        const variant = typeof badge === 'object' ? badge.variant : "default"

        return (
            <Badge variant={variant as any} className="ml-auto">
                {count}
            </Badge>
        )
    }

    return (
        <SidebarGroup>
            {section.title && (
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            )}
            <SidebarMenu>
                {section.items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0
                    const isOpen = openItems.includes(item.title)
                    const isActive = pathname === item.url || pathname.startsWith(item.url + '/')

                    if (hasSubItems) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                open={isOpen}
                                onOpenChange={() => toggleItem(item.title)}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={isActive}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            {renderBadge(item.badge)}
                                            <IconChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => {
                                                const isSubActive = pathname === subItem.url
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isSubActive}
                                                        >
                                                            <Link href={subItem.url}>
                                                                {subItem.icon && <subItem.icon />}
                                                                <span>{subItem.title}</span>
                                                                {renderBadge(subItem.badge)}
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                )
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isActive}
                            >
                                <Link href={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {renderBadge(item.badge)}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
    section: NavSection
    pathname: string
}

function NavSecondary({ section, pathname, ...props }: NavSecondaryProps) {
    const renderBadge = (badge?: number | { count: number; variant?: string }) => {
        if (!badge) return null

        const count = typeof badge === 'number' ? badge : badge.count
        const variant = typeof badge === 'object' ? badge.variant : "default"

        return (
            <Badge variant={variant as any} className="ml-auto">
                {count}
            </Badge>
        )
    }

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {section.items.map((item) => {
                        const isActive = pathname === item.url
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive}
                                >
                                    <Link href={item.url}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        {renderBadge(item.badge)}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

interface NavUserProps {
    user: UserInfo
}

function NavUser({ user }: NavUserProps) {
    const { isMobile } = useSidebar()
    const router = useRouter()

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case 'HR_OFFICER':
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case 'SECTION_HEAD':
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case 'HEAD_OF_DEPARTMENT':
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        }
    }

    const handleLogout = async () => {
        await signOut()
        router.push('/sign-in')
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                            <IconChevronDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                    <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => router.push('/profile')}>
                                <IconUserCircle className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                <IconSettings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/notifications')}>
                                <IconNotification className="mr-2 h-4 w-4" />
                                Notifications
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/billing')}>
                                <IconCreditCard className="mr-2 h-4 w-4" />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/help')}>
                                <IconHelp className="mr-2 h-4 w-4" />
                                Help
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <IconLogout className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

// ==================== RoleBasedSidebar Component ====================

interface RoleBasedSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserInfo
    pathname: string
}

function RoleBasedSidebar({ user, pathname, ...props }: RoleBasedSidebarProps) {
    // Filter navigation items based on user role
    const filterNavItems = (sections: NavSection[]): NavSection[] => {
        return sections
            .map(section => ({
                ...section,
                items: section.items.filter(item =>
                    !item.permissions || item.permissions.includes(user.role)
                ).map(item => ({
                    ...item,
                    items: item.items?.filter(subItem =>
                        !subItem.permissions || subItem.permissions.includes(user.role)
                    ),
                })),
            }))
            .filter(section => section.items.length > 0)
    }

    // Get base navigation
    let navSections = filterNavItems(navigationConfig)

    // Add admin sections if user is admin
    if (user.role === UserRole.ADMIN) {
        navSections = [...navSections, ...filterNavItems(adminNavigation)]
    }

    // Separate secondary navigation (usually at the bottom)
    const secondarySection = navSections.find(s => s.title === "SYSTEM")
    const mainSections = navSections.filter(s => s.title !== "SYSTEM")

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <Link href="/dashboard">
                                <IconBriefcase className="size-5!" />
                                <span className="text-base font-semibold">
                                    {user.role === UserRole.ADMIN && "Admin"}
                                    {user.role === UserRole.HR_OFFICER && "HR Manager"}
                                    {user.role === UserRole.SECTION_HEAD && "Section Head"}
                                    {user.role === UserRole.HEAD_OF_DEPARTMENT && "Dept. Head"}
                                    {user.role === UserRole.EMPLOYEE && "Employee Portal"}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {mainSections.map((section, index) => (
                    <NavMain key={index} section={section} pathname={pathname} />
                ))}
                {secondarySection && (
                    <NavSecondary section={secondarySection} pathname={pathname} className="mt-auto" />
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

// ==================== SiteHeader Component ====================

interface SiteHeaderProps {
    title?: string
    pathname: string
}

function SiteHeader({ title, pathname }: SiteHeaderProps) {
    // Generate title from pathname if not provided
    const getTitleFromPath = () => {
        if (title) return title
        const path = pathname.split('/').filter(Boolean)
        if (path.length === 0) return "Dashboard"
        return path[path.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 h-4" />
                <h1 className="text-lg font-semibold">{getTitleFromPath()}</h1>

                <div className="ml-auto flex items-center gap-2">
                    {/* Search */}
                    <div className="relative hidden md:block">
                        <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-64 rounded-lg bg-background pl-8"
                        />
                    </div>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="relative">
                                <IconBell className="h-4 w-4" />
                                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0">
                                    3
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">New Leave Request</p>
                                    <p className="text-xs text-muted-foreground">John Doe applied for annual leave</p>
                                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Leave Approved</p>
                                    <p className="text-xs text-muted-foreground">Your leave request has been approved</p>
                                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Document Required</p>
                                    <p className="text-xs text-muted-foreground">Please upload your medical certificate</p>
                                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-center">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

// ==================== Loading State ====================

function DashboardSkeleton() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    )
}

// ==================== Main Layout Component ====================

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, isPending } = useSession()

    React.useEffect(() => {
        if (!isPending && !session?.user) {
            router.push('/sign-in')
        }
    }, [isPending, session, router])

    if (isPending) {
        return <DashboardSkeleton />
    }

    if (!session?.user) {
        return null
    }

    // Cast the user to our extended type that includes role
    const userData = session.user as ExtendedUser

    const user = {
        name: userData.name || 'User',
        email: userData.email || '',
        avatar: userData.image ?? undefined, // Convert null/undefined to undefined
        role: userData.role || UserRole.EMPLOYEE, // Default to EMPLOYEE if role not set
    }

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 16)",
            } as React.CSSProperties}
        >
            <RoleBasedSidebar user={user} pathname={pathname} variant="inset" />
            <div className="flex flex-1 flex-col">
                <SiteHeader pathname={pathname} />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}