"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"


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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { legalInfoSchema } from "@/types/employee-form"
import { MaritalStatus } from "@/types/enums"

interface LegalInfoStepProps {
    data: LegalInfo
    onUpdate: (data: LegalInfo) => void
    onNext: () => void
    onBack: () => void
}

export interface LegalInfo {
    father_name: string;
    father_place_of_birth: string;
    father_occupation: string;
    father_address: string;
    marital_status: MaritalStatus;
    is_father_deceased?: boolean;
    has_criminal_record?: boolean;
    criminal_record_info?: string;
    has_been_dismissed?: boolean;
    dismissal_reason?: string;
}


export function LegalInfoStep({ data, onUpdate, onNext, onBack }: LegalInfoStepProps) {
    const form = useForm<LegalInfo>({
        resolver: zodResolver(legalInfoSchema),
        defaultValues: {
            father_name: data.father_name || "",
            father_place_of_birth: data.father_place_of_birth || "",
            father_occupation: data.father_occupation || "",
            father_address: data.father_address || "",
            is_father_deceased: data.is_father_deceased ?? false,
            marital_status: data.marital_status || MaritalStatus.SINGLE,
            has_criminal_record: data.has_criminal_record ?? false,
            criminal_record_info: data.criminal_record_info || "",
            has_been_dismissed: data.has_been_dismissed ?? false,
            dismissal_reason: data.dismissal_reason || "",
        },
    });

    const watchHasCriminalRecord = form.watch("has_criminal_record")
    const watchHasBeenDismissed = form.watch("has_been_dismissed")

    const onSubmit = (values: LegalInfo) => {
        onUpdate(values)
        onNext()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Father's Information</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="father_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Father's Full Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="father_place_of_birth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Father's Place of Birth *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City, Country" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="father_occupation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Father's Occupation *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Occupation" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="father_address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Father's Address *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="is_father_deceased"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Father is deceased</FormLabel>
                                                <FormDescription>
                                                    Check if your father is no longer living
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <h3 className="text-lg font-medium">Personal Status</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="marital_status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marital Status *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(MaritalStatus).map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <h3 className="text-lg font-medium">Legal History</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="has_criminal_record"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Has criminal record</FormLabel>
                                                <FormDescription>
                                                    Check if the employee has any criminal history
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {watchHasCriminalRecord && (
                                    <FormField
                                        control={form.control}
                                        name="criminal_record_info"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Criminal Record Details</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Provide details about criminal record"
                                                        className="min-h-25"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="has_been_dismissed"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Has been dismissed from previous employment</FormLabel>
                                                <FormDescription>
                                                    Check if the employee has ever been dismissed
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {watchHasBeenDismissed && (
                                    <FormField
                                        control={form.control}
                                        name="dismissal_reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dismissal Reason</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Reason for dismissal"
                                                        className="min-h-25"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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