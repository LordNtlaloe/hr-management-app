// components/sections/section-employees.tsx
"use client"

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, X, Users } from 'lucide-react';
import { Section } from '@/types/sections';
import { AssignEmployeeDialog } from './assign-employees-dialog';

interface SectionEmployeesProps {
    section: Section;
    onClose: () => void;
    onAssignEmployee: (sectionId: number, employeeId: number) => void;
}

export const SectionEmployees: React.FC<SectionEmployeesProps> = ({
    section,
    onClose,
    onAssignEmployee,
}) => {
    const [showAssign, setShowAssign] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const employees = section.employees || [];

    const filteredEmployees = employees.filter(emp => {
        const employeeNumberMatch = emp.employee_number.toLowerCase().includes(searchTerm.toLowerCase());
        const userNameMatch = emp.users && emp.users.length > 0
            ? emp.users[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            : false;
        return employeeNumberMatch || userNameMatch;
    });

    const getEmployeeName = (employee: typeof employees[0]): string => {
        return employee.users && employee.users.length > 0
            ? employee.users[0]?.name || 'Unknown'
            : 'No User Account';
    };

    const getEmployeeInitial = (employee: typeof employees[0]): string => {
        return employee.users && employee.users.length > 0 && employee.users[0]?.name
            ? employee.users[0].name.charAt(0)
            : '?';
    };

    const getUserRole = (employee: typeof employees[0]): string | null => {
        return employee.users && employee.users.length > 0
            ? employee.users[0]?.role || null
            : null;
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{section.section_name} - Employees</span>
                        <Badge variant="outline">{employees.length} Employees</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Section Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Position Title</p>
                                <p className="font-medium">{section.employee_position}</p>
                            </div>
                            {section.employee_id && (
                                <div>
                                    <p className="text-sm text-gray-500">Section Head User ID</p>
                                    <p className="font-mono text-sm">{section.employee_id}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={() => setShowAssign(true)} className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Assign Employee
                        </Button>
                    </div>

                    {/* Employees Table */}
                    {filteredEmployees.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Employee Number</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>User Account</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={employee.picture || undefined} />
                                                <AvatarFallback>
                                                    {getEmployeeInitial(employee)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{getEmployeeName(employee)}</p>
                                                <p className="text-sm text-gray-500">{employee.current_address}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.employee_number}</TableCell>
                                        <TableCell>
                                            <Badge variant={employee.is_active ? "default" : "secondary"}>
                                                {employee.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getUserRole(employee) ? (
                                                <Badge variant="outline">{getUserRole(employee)}</Badge>
                                            ) : (
                                                <span className="text-sm text-gray-400">No account</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                <X className="w-4 h-4 text-gray-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="font-medium text-gray-700">No employees assigned</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Start assigning employees to this section
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => setShowAssign(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Assign First Employee
                            </Button>
                        </div>
                    )}
                </div>

                {/* Assign Employee Dialog */}
                {showAssign && (
                    <AssignEmployeeDialog
                        section={section}
                        onClose={() => setShowAssign(false)}
                        onAssign={(employeeId) => {
                            onAssignEmployee(section.id, employeeId);
                            setShowAssign(false);
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};