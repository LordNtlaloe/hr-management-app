// app/(dashboard)/sections/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { Section } from '@/types/sections';
import { SectionCard } from '@/components/sections/section-card';
import { SectionEmployees } from '@/components/sections/section-employees';
import { SectionForm } from '@/components/sections/sections-form';

export default function SectionsPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewEmployees, setViewEmployees] = useState<Section | null>(null);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch('/api/sections');
                const result = await response.json();
                if (result.success) {
                    setSections(result.data.map((s: Section) => ({ ...s, employees: s.employees ?? [] })));
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        };

        fetchSections();
    }, []);

    const filteredSections = sections.filter(section =>
        section.section_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSection = async (data: Partial<Section>) => {
        try {
            const response = await fetch('/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_name: data.section_name }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Failed to create section:', result.error);
                return;
            }

            setSections(prev => [...prev, { ...result.data, employees: [] }]);
        } catch (error) {
            console.error('Error creating section:', error);
        }
    };

    const handleUpdateSection = (id: number, data: Partial<Section>) => {
        setSections(prev => prev.map(section =>
            section.id === id ? { ...section, ...data } : section
        ));
    };

    const handleDeleteSection = (id: number) => {
        setSections(prev => prev.filter(section => section.id !== id));
    };

    const handleAssignEmployee = (sectionId: number, employeeId: number) => {
        setSections(prev => prev.map(section =>
            section.id === sectionId
                ? {
                    ...section,
                    employees: [
                        ...(section.employees ?? []),
                        {
                            id: employeeId,
                            employee_number: `EMP-${String(employeeId).padStart(3, '0')}`,
                            current_address: 'New Address',
                            date_of_birth: new Date(),
                            gender: 'MALE',
                            picture: '',
                            place_of_birth: '',
                            is_citizen: true,
                            is_active: true,
                            created_at: new Date(),
                            updated_at: new Date(),
                            users: [
                                {
                                    id: `user_${employeeId}`,
                                    name: `Employee ${employeeId}`,
                                    email: `employee${employeeId}@example.com`,
                                    role: 'EMPLOYEE' as const,
                                }
                            ]
                        }
                    ]
                }
                : section
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Sections Management</h1>
                    <p className="text-gray-500 mt-1">Manage departments and employee assignments</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Section
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search sections by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Sections Grid or Empty State */}
            {filteredSections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSections.map((section) => (
                        <SectionCard
                            key={section.id}
                            section={section}
                            onEdit={() => {
                                setSelectedSection(section);
                                setShowForm(true);
                            }}
                            onDelete={() => handleDeleteSection(section.id)}
                            onViewEmployees={() => setViewEmployees(section)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Sections Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Get started by creating your first section. Sections help organize employees into departments or teams.
                    </p>
                    <Button
                        onClick={() => setShowForm(true)}
                        size="lg"
                        className="flex items-center gap-2 mx-auto"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Section
                    </Button>
                </div>
            )}

            {/* Modals */}
            {showForm && (
                <SectionForm
                    section={selectedSection}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedSection(null);
                    }}
                    onSubmit={(data) => {
                        if (selectedSection) {
                            handleUpdateSection(selectedSection.id, data);
                        } else {
                            handleAddSection(data);
                        }
                        setShowForm(false);
                        setSelectedSection(null);
                    }}
                />
            )}

            {viewEmployees && (
                <SectionEmployees
                    section={viewEmployees}
                    onClose={() => setViewEmployees(null)}
                    onAssignEmployee={handleAssignEmployee}
                />
            )}
        </div>
    );
}