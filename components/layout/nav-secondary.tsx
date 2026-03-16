"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { NavSection } from "@/types/role"

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
    section: NavSection
}

export function NavSecondary({ section, ...props }: NavSecondaryProps) {
    const pathname = usePathname()

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
                    {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname === item.url}
                            >
                                <Link href={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {renderBadge(item.badge)}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}