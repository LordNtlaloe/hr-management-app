"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Icon } from "@tabler/icons-react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuAction,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { NavSection } from "@/types/role"

interface NavMainProps {
    section: NavSection
}

export function NavMain({ section }: NavMainProps) {
    const pathname = usePathname()
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
                                            isActive={item.isActive}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            {renderBadge(item.badge)}
                                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subItem.isActive}
                                                    >
                                                        <Link href={subItem.url}>
                                                            {subItem.icon && <subItem.icon />}
                                                            <span>{subItem.title}</span>
                                                            {renderBadge(subItem.badge)}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
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
                                isActive={item.isActive}
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