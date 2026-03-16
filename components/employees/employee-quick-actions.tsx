"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    UserPlus,
    Download,
    Upload,
    Mail,
    FileText,
    Users,
    Settings,
    MoreVertical,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface EmployeeQuickActionsProps {
    userRole: string
    onAddEmployee?: () => void
    onExportData?: () => void
    onImportData?: () => void
    onSendEmail?: () => void
    onGenerateReport?: () => void
}

export function EmployeeQuickActions({
    userRole,
    onAddEmployee,
    onExportData,
    onImportData,
    onSendEmail,
    onGenerateReport,
}: EmployeeQuickActionsProps) {
    const router = useRouter()
    const canEdit = ["ADMIN", "HR_OFFICER"].includes(userRole)

    return (
        <div className="flex items-center gap-2">
            {canEdit && (
                <Button onClick={onAddEmployee}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={onExportData}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                    </DropdownMenuItem>

                    {canEdit && (
                        <DropdownMenuItem onClick={onImportData}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import Data
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={onSendEmail}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={onGenerateReport}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                    </DropdownMenuItem>

                    {userRole === "ADMIN" && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/settings/employee")}>
                                <Settings className="mr-2 h-4 w-4" />
                                Employee Settings
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}