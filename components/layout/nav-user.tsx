"use client"

import {
    IconCreditCard,
    IconLogout,
    IconNotification,
    IconUserCircle,
    IconSettings,
    IconHelp,
    IconChevronDown,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { UserInfo } from "@/types/role"
import { signOut } from "@/lib/auth-client"

interface NavUserProps {
    user: UserInfo
}

export function NavUser({ user }: NavUserProps) {
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

    const handleLogout = async () => {
        await signOut({})
        router.push('/sign-in')
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