"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, FileText, X, Plus } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { documentsSchema } from "@/types/employee-form"
import { z } from "zod"

export type Documents = z.infer<typeof documentsSchema>

interface DocumentsStepProps {
    data: Documents
    onUpdate: (data: Documents) => void
    onNext: () => void
    onBack: () => void
}

export function DocumentsStep({ data, onUpdate, onNext, onBack }: DocumentsStepProps) {
    const form = useForm<Documents>({
        resolver: zodResolver(documentsSchema),
        defaultValues: {
            national_id: data.national_id || "",
            passport: data.passport || "",
            academic_certificates: data.academic_certificates || [],
            police_clearance: data.police_clearance || "",
            medical_certificates: data.medical_certificates || "",
            drivers_license: data.drivers_license || "",
        },
    })

    const [certificateInput, setCertificateInput] = useState("")

    const addCertificate = () => {
        if (certificateInput.trim()) {
            const current = form.getValues("academic_certificates")
            form.setValue("academic_certificates", [...current, certificateInput.trim()])
            setCertificateInput("")
        }
    }

    const removeCertificate = (index: number) => {
        const current = form.getValues("academic_certificates")
        form.setValue(
            "academic_certificates",
            current.filter((_, i) => i !== index)
        )
    }

    const handleFileUpload = (
        fieldName: "police_clearance" | "medical_certificates" | "drivers_license",
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0]
        if (file) {
            form.setValue(fieldName, file.name)
        }
    }

    const onSubmit = (values: Documents) => {
        onUpdate(values)
        onNext()
    }

    const certificates = form.watch("academic_certificates")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Documents & Identification</h3>

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="national_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>National ID Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., NRC123456" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Government-issued national ID number
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="passport"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passport Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., AB123456" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                International passport number (if applicable)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="drivers_license"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver's License</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="License number or upload file"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            document.getElementById("license-upload")?.click()
                                                        }
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <input
                                                id="license-upload"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleFileUpload("drivers_license", e)
                                                }
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="police_clearance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Police Clearance</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Upload police clearance"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            document.getElementById("police-upload")?.click()
                                                        }
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <input
                                                id="police-upload"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleFileUpload("police_clearance", e)
                                                }
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="medical_certificates"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Medical Certificates</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Upload medical certificate"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            document.getElementById("medical-upload")?.click()
                                                        }
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <input
                                                id="medical-upload"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleFileUpload("medical_certificates", e)
                                                }
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormLabel>Academic Certificates</FormLabel>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Certificate name (e.g., Bachelor's Degree)"
                                        value={certificateInput}
                                        onChange={(e) => setCertificateInput(e.target.value)}
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(), addCertificate())
                                        }
                                    />
                                    <Button type="button" onClick={addCertificate} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormDescription>
                                    Add all academic certificates and qualifications
                                </FormDescription>

                                <div className="space-y-2">
                                    {certificates.map((cert, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{cert}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCertificate(index)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {certificates.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No certificates added yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="text-sm font-medium mb-2">Document Requirements:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                    <li>Accepted formats: PDF, JPG, JPEG, PNG</li>
                                    <li>Maximum file size: 5MB per file</li>
                                    <li>Ensure all documents are clear and legible</li>
                                    <li>Upload color copies for official documents</li>
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