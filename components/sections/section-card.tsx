// components/sections/section-card.tsx
"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Section } from '@/types/sections';

interface SectionCardProps {
    section: Section;
    onEdit: () => void;
    onDelete: () => void;
    onViewEmployees: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    section,
    onEdit,
    onDelete,
    onViewEmployees,
}) => {
    const employeeCount = section.employees?.length || 0;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{section.section_name}</CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Section
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onViewEmployees}>
                                <Users className="w-4 h-4 mr-2" />
                                View Employees
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Section
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {employeeCount} {employeeCount === 1 ? 'Employee' : 'Employees'}
                        </span>
                    </div>
                    <Badge variant={employeeCount > 0 ? "default" : "secondary"}>
                        {employeeCount > 0 ? 'Active' : 'Empty'}
                    </Badge>
                </div>

                {/* Section Head Info */}
                {section.employee_id && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-1">Section Head ID</p>
                        <p className="text-sm font-mono">{section.employee_id}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};