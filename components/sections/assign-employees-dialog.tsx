// components/sections/AssignEmployeeDialog.tsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Check } from 'lucide-react';
import { Section } from '@/types/sections';

interface AssignEmployeeDialogProps {
    section: Section;
    onClose: () => void;
    onAssign: (employeeId: number) => void;
}

// Mock available employees - in real app, fetch from API
const AVAILABLE_EMPLOYEES = [
    { id: 1, number: 'EMP-2024-001', name: 'John Doe', position: 'Developer' },
    { id: 2, number: 'EMP-2024-002', name: 'Jane Smith', position: 'Designer' },
    { id: 3, number: 'EMP-2024-003', name: 'Bob Johnson', position: 'Manager' },
];

export const AssignEmployeeDialog: React.FC<AssignEmployeeDialogProps> = ({
    section,
    onClose,
    onAssign,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const filteredEmployees = AVAILABLE_EMPLOYEES.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Assign Employee to {section.section_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Employee List */}
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredEmployees.map((employee) => (
                            <div
                                key={employee.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedId === employee.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'hover:bg-gray-50'
                                    }`}
                                onClick={() => setSelectedId(employee.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{employee.name}</p>
                                        <p className="text-sm text-gray-500">{employee.number}</p>
                                        <p className="text-xs text-gray-400 mt-1">{employee.position}</p>
                                    </div>
                                    {selectedId === employee.id && (
                                        <Check className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredEmployees.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                No employees found
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => selectedId && onAssign(selectedId)}
                        disabled={!selectedId}
                    >
                        Assign Employee
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};