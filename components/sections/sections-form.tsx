// components/sections/sections-form.tsx
"use client"

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Section } from '@/types/sections';

interface SectionFormProps {
    section?: Section | null;
    onClose: () => void;
    onSubmit: (data: Partial<Section>) => void;
}

export const SectionForm: React.FC<SectionFormProps> = ({
    section,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<Partial<Section>>({
        section_name: '',
        employee_id: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (section) {
            setFormData({
                section_name: section.section_name,
                employee_id: section.employee_id || '',
            });
        }
    }, [section]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.section_name?.trim()) {
            newErrors.section_name = 'Section name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {section ? 'Edit Section' : 'Create New Section'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="section_name">
                            Section Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="section_name"
                            value={formData.section_name}
                            onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                            placeholder="e.g., Human Resources, IT Department"
                            className={errors.section_name ? 'border-red-500' : ''}
                        />
                        {errors.section_name && (
                            <p className="text-sm text-red-500">{errors.section_name}</p>
                        )}
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Please fill in all required fields
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {section ? 'Update Section' : 'Create Section'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};