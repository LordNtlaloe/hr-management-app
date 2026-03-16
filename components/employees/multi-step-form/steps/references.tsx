"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, MapPin, Briefcase, Clock } from "lucide-react"

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
import { Card, CardContent } from "@/components/ui/card"
import { referencesSchema, References } from "@/types/employee-form"

interface ReferencesStepProps {
    data: References
    onUpdate: (data: References) => void
    onNext: () => void
    onBack: () => void
}

export function ReferencesStep({ data, onUpdate, onNext, onBack }: ReferencesStepProps) {
    const form = useForm<References>({
        resolver: zodResolver(referencesSchema),
        defaultValues: {
            refernce_name: data.refernce_name || "",
            address: data.address || "",
            occupation: data.occupation || "",
            known_for: data.known_for || "",
        },
    })

    const onSubmit = (values: References) => {
        onUpdate(values)
        onNext()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-5 w-5" />
                                <h3 className="text-lg font-medium">Professional Reference</h3>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="refernce_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reference Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full name" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Name of the person providing reference
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="occupation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Occupation *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Manager, Supervisor" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Their job title or position
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Address *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full address" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Current address of the reference
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="known_for"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>How long have you known them? *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 3 years, 5 years" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Duration of professional relationship
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="text-sm font-medium mb-2">Reference Guidelines:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                    <li>Choose someone who can speak to your professional abilities</li>
                                    <li>Previous supervisors or managers are ideal</li>
                                    <li>Ensure you have their permission before listing them</li>
                                    <li>Provide accurate contact information</li>
                                </ul>
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