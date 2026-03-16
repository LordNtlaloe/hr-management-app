"use client"

import * as React from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Gender } from "@/types/enums" // ✅ plain enum — no Prisma runtime

interface EmployeeFiltersProps {
    onFilterChange: (filters: EmployeeFilterValues) => void
    sections: { id: number; section_name: string }[]
    initialFilters?: Partial<EmployeeFilterValues>
}

export interface EmployeeFilterValues {
    search?: string
    sectionId?: number
    gender?: Gender
    isActive?: boolean
}

export function EmployeeFilters({ onFilterChange, sections, initialFilters = {} }: EmployeeFiltersProps) {
    const [search, setSearch] = React.useState(initialFilters.search ?? "")
    const [sectionId, setSectionId] = React.useState<string>(initialFilters.sectionId?.toString() ?? "")
    const [gender, setGender] = React.useState<string>(initialFilters.gender ?? "")
    const [status, setStatus] = React.useState<string>(
        initialFilters.isActive === undefined ? "" : String(initialFilters.isActive)
    )
    const [open, setOpen] = React.useState(false)

    const activeFiltersCount = [search, sectionId, gender, status].filter(Boolean).length

    const applyFilters = () => {
        onFilterChange({
            search: search || undefined,
            sectionId: sectionId ? parseInt(sectionId) : undefined,
            gender: (gender as Gender) || undefined,
            isActive: status !== "" ? status === "true" : undefined,
        })
        setOpen(false)
    }

    const clearFilters = () => {
        setSearch("")
        setSectionId("")
        setGender("")
        setStatus("")
        onFilterChange({})
        setOpen(false)
    }

    return (
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    className="pl-8"
                />
            </div>

            {activeFiltersCount > 0 && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear all filters">
                    <X className="h-4 w-4" />
                </Button>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Filter Employees</h4>
                            {activeFiltersCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground">
                                    Clear all
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Section</Label>
                            <Select value={sectionId} onValueChange={setSectionId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Sections" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Sections</SelectItem>
                                    {sections.map((section) => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                            {section.section_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Gender</Label>
                            <Select value={gender} onValueChange={setGender}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Genders" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Genders</SelectItem>
                                    {Object.values(Gender).map((g) => (
                                        <SelectItem key={g} value={g}>
                                            {g.charAt(0) + g.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={applyFilters} className="flex-1" size="sm">
                                Apply Filters
                            </Button>
                            <Button onClick={clearFilters} variant="outline" className="flex-1" size="sm">
                                Reset
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}