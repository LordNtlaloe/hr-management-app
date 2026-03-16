"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { employmentSchema, Employment } from "@/types/employee-form"

interface EmploymentStepProps {
    data: Employment
    onUpdate: (data: Employment) => void
    onNext: () => void
    onBack: () => void
}

// Helper function to format date
const formatDate = (date: Date | undefined) => {
    if (!date) return "Select date"
    return date.toLocaleDateString()
}

// Reusable date picker component with dropdowns
function EmploymentDatePicker({
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
                            variant="outline"
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

export function EmploymentStep({ data, onUpdate, onNext, onBack }: EmploymentStepProps) {
    const form = useForm<Employment>({
        resolver: zodResolver(employmentSchema),
        defaultValues: {
            employer_name: data.employer_name || "",
            employee_address: data.employee_address || "",
            employer_position: data.employer_position || "",
            duties: data.duties || [],
            employment_start: data.employment_start || undefined,
            employment_end: data.employment_end || undefined,
            salary: data.salary || "",
            reason_for_leaving: data.reason_for_leaving || "",
            notice_period: data.notice_period || "",
        },
    })

    // For the duties array, we need to handle it as an array of strings
    const [dutyInput, setDutyInput] = useState("")

    const addDuty = () => {
        if (dutyInput.trim()) {
            const currentDuties = form.getValues("duties") || []
            form.setValue("duties", [...currentDuties, dutyInput.trim()])
            setDutyInput("")
        }
    }

    const removeDuty = (index: number) => {
        const currentDuties = form.getValues("duties") || []
        form.setValue("duties", currentDuties.filter((_, i) => i !== index))
    }

    const onSubmit = (values: Employment) => {
        onUpdate(values)
        onNext()
    }

    const employmentStart = form.watch("employment_start")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Employment History</h3>

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="employer_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employer Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Company name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="employer_position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Job title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="employee_address"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Employer Address *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Company address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="employment_start"
                                    render={({ field }) => (
                                        <EmploymentDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Start Date"
                                            maxDate={form.watch("employment_end")}
                                        />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="employment_end"
                                    render={({ field }) => (
                                        <EmploymentDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="End Date"
                                            minDate={employmentStart}
                                        />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="salary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Salary *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., $50,000/year" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notice_period"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notice Period *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 2 weeks" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reason_for_leaving"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Reason for Leaving *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Why did you leave this position?"
                                                    className="min-h-25"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormLabel>Duties & Responsibilities *</FormLabel>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a duty (e.g., Managed team of 10)"
                                        value={dutyInput}
                                        onChange={(e) => setDutyInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDuty())}
                                    />
                                    <Button type="button" onClick={addDuty} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormDescription>
                                    Add all major duties and responsibilities from this position
                                </FormDescription>

                                <div className="space-y-2">
                                    {form.watch("duties")?.map((duty, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <span className="text-sm">{duty}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDuty(index)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!form.watch("duties") || form.watch("duties").length === 0) && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No duties added yet. Add at least one duty.
                                        </p>
                                    )}
                                </div>
                                {form.formState.errors.duties && (
                                    <p className="text-sm font-medium text-destructive">
                                        {form.formState.errors.duties.message}
                                    </p>
                                )}
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