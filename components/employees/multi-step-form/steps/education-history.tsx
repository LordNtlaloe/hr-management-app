"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { educationSchema } from "@/types/employee-form"
import { useState } from "react"

interface EducationStepProps {
    data: Education
    onUpdate: (data: Education) => void
    onNext: () => void
    onBack: () => void
}

export interface Education {
    school_name: string
    date_of_entry: Date
    date_of_leave: Date
    qualification: string
    qualification_start_date: Date
    qualification_completion_date: Date
    additional_skills?: string[]
}

// Helper function to format date
const formatDate = (date: Date | undefined) => {
    if (!date) return "Select date"
    return date.toLocaleDateString()
}

// Reusable date picker component with dropdowns
function EducationDatePicker({
    value,
    onChange,
    label,
    minDate,
    maxDate
}: {
    value: Date | undefined,
    onChange: (date: Date | undefined) => void,
    label: string,
    minDate?: Date,
    maxDate?: Date
}) {
    const [open, setOpen] = useState(false)

    return (
        <FormItem className="flex flex-col">
            <FormLabel>{label} *</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !value && "text-muted-foreground"
                            )}
                        >
                            {value ? formatDate(value) : "Select date"}
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        defaultMonth={value}
                        onSelect={(date) => {
                            onChange(date)
                            setOpen(false)
                        }}
                        disabled={(date) => {
                            if (minDate && date < minDate) return true
                            if (maxDate && date > maxDate) return true
                            return false
                        }}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear() + 10}
                    />
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    )
}

export function EducationStep({ data, onUpdate, onNext, onBack }: EducationStepProps) {
    const form = useForm<Education>({
        resolver: zodResolver(educationSchema),
        defaultValues: {
            school_name: data.school_name ?? "",
            date_of_entry: data.date_of_entry ?? undefined,
            date_of_leave: data.date_of_leave ?? undefined,
            qualification: data.qualification ?? "",
            qualification_start_date: data.qualification_start_date ?? undefined,
            qualification_completion_date:
                data.qualification_completion_date ?? undefined,
            additional_skills: data.additional_skills ?? [],
        },
    })
    const [skillInput, setSkillInput] = useState("")

    const addSkill = () => {
        if (skillInput.trim()) {
            const currentSkills = form.getValues("additional_skills") || []
            form.setValue("additional_skills", [...currentSkills, skillInput.trim()])
            setSkillInput("")
        }
    }

    const removeSkill = (index: number) => {
        const currentSkills = form.getValues("additional_skills") || []
        form.setValue("additional_skills", currentSkills.filter((_, i) => i !== index))
    }

    const onSubmit = (values: Education) => {
        onUpdate(values)
        onNext()
    }

    const dateOfEntry = form.watch("date_of_entry")
    const qualificationStartDate = form.watch("qualification_start_date")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Educational Background</h3>

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="school_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>School/Institution Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Name of school" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="qualification"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Qualification *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Bachelor's Degree" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="date_of_entry"
                                    render={({ field }) => (
                                        <EducationDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Start Date"
                                            maxDate={form.watch("date_of_leave")}
                                        />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="date_of_leave"
                                    render={({ field }) => (
                                        <EducationDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="End Date"
                                            minDate={dateOfEntry}
                                        />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="qualification_start_date"
                                    render={({ field }) => (
                                        <EducationDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Qualification Start Date"
                                            maxDate={form.watch("qualification_completion_date")}
                                        />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="qualification_completion_date"
                                    render={({ field }) => (
                                        <EducationDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Qualification Completion Date"
                                            minDate={qualificationStartDate}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormLabel>Additional Skills</FormLabel>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a skill (e.g., Python, Management)"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                                    />
                                    <Button type="button" onClick={addSkill} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormDescription>
                                    Press Enter or click the plus button to add skills
                                </FormDescription>

                                <div className="flex flex-wrap gap-2">
                                    {form.watch("additional_skills")?.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="gap-1">
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(index)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={onBack}>
                        Previous
                    </Button>
                    <Button type="submit">Next Step</Button>
                </div>
            </form>
        </Form>
    )
}