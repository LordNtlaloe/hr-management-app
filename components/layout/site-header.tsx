"use client"

import { Bell, Search } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface SiteHeaderProps {
    title?: string
}

export function SiteHeader({ title }: SiteHeaderProps) {
    const pathname = usePathname()

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
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                <Bell className="h-4 w-4" />
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