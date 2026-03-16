// components/employees/multi-step-form/steps/personal-info.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, Mail, Lock, User } from "lucide-react"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Gender } from "@/types/enums"
import { toast } from "sonner"
import { z } from "zod"
import React from "react"
import { signUp } from "@/lib/auth-client"

// Defined independently (not via .extend) because personalInfoSchema uses
// .superRefine() which blocks .extend(). This schema is for step 1 only —
// email/name/password are required here but optional in the shared schema
// so final form submission doesn't fail validation.
const personalInfoStepSchema = z.object({
    employee_number: z.string().min(1, "Employee number is required"),
    current_address: z.string().min(1, "Current address is required"),
    date_of_birth: z.date(),
    gender: z.nativeEnum(Gender),
    picture: z.string().optional(),
    place_of_birth: z.string().min(1, "Place of birth is required"),
    is_citizen: z.boolean(),
    chief_name: z.string().optional(),
    district: z.string().optional(),
    nationality: z.string().optional(),
    section_id: z.number().optional(),
    position: z.string().optional(),
    // Required in step 1, optional in shared schema
    email: z.string().email("Valid email is required"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    userId: z.string().optional(),
}).superRefine((data, ctx) => {
    if (!data.date_of_birth) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Date of birth is required",
            path: ["date_of_birth"],
        })
    }
    if (data.is_citizen) {
        if (!data.chief_name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Chief/Village name is required for citizens",
                path: ["chief_name"],
            })
        }
        if (!data.district) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "District is required for citizens",
                path: ["district"],
            })
        }
        if (data.nationality && data.nationality.trim() !== "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Nationality should not be provided for citizens",
                path: ["nationality"],
            })
        }
    } else {
        if (!data.nationality) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Nationality is required for non-citizens",
                path: ["nationality"],
            })
        }
        if (data.chief_name && data.chief_name.trim() !== "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Chief/Village name should not be provided for non-citizens",
                path: ["chief_name"],
            })
        }
        if (data.district && data.district.trim() !== "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "District should not be provided for non-citizens",
                path: ["district"],
            })
        }
    }
})

type PersonalInfoStepData = z.infer<typeof personalInfoStepSchema>

interface PersonalInfoStepProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate: (data: any) => void
    onNext: () => void
    sections?: { id: number; section_name: string }[]
}

export function PersonalInfoStep({ data, onUpdate, onNext, sections = [] }: PersonalInfoStepProps) {
    const [isCreatingUser, setIsCreatingUser] = React.useState(false)
    const [calendarOpen, setCalendarOpen] = React.useState(false)
    const [isCheckingUser, setIsCheckingUser] = React.useState(false)

    const form = useForm<PersonalInfoStepData>({
        resolver: zodResolver(personalInfoStepSchema),
        defaultValues: {
            employee_number: data.employee_number || "",
            current_address: data.current_address || "",
            date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
            gender: data.gender || Gender.MALE,
            picture: data.picture || "",
            place_of_birth: data.place_of_birth || "",
            is_citizen: data.is_citizen ?? true,
            chief_name: data.chief_name || "",
            district: data.district || "",
            nationality: data.nationality || "",
            section_id: data.section_id ?? undefined,
            position: data.position || "",
            email: data.email || "",
            name: data.name || "",
            password: data.password || "",
        },
    })

    const isCitizen = form.watch("is_citizen")

    const checkUserExists = async (email: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/users/check?email=${encodeURIComponent(email)}`)
            const result = await response.json()
            return result.exists
        } catch (error) {
            console.error("Error checking user:", error)
            return false
        }
    }

    // email, name, password are guaranteed strings by personalInfoStepSchema
    const onSubmit = async (values: PersonalInfoStepData) => {
        setIsCreatingUser(true)
        setIsCheckingUser(true)

        try {
            const userExists = await checkUserExists(values.email)

            if (userExists) {
                toast.info("User account already exists", {
                    description: "Using existing user account for this employee.",
                })

                const response = await fetch(`/api/users/by-email?email=${encodeURIComponent(values.email)}`)
                const userData = await response.json()

                if (userData.user?.id) {
                    const { password: _pw, ...personalDataWithoutPassword } = values
                    onUpdate({ ...personalDataWithoutPassword, userId: userData.user.id })
                    onNext()
                } else {
                    throw new Error("Could not retrieve existing user ID")
                }
            } else {
                const { data: userData, error } = await signUp.email({
                    email: values.email,
                    password: values.password,
                    name: values.name,
                })

                if (error) {
                    toast.error("Failed to create user account", {
                        description: error.message || "Please check the email and try again",
                    })
                    return
                }

                if (userData?.user) {
                    const { password: _pw, ...personalDataWithoutPassword } = values
                    onUpdate({ ...personalDataWithoutPassword, userId: userData.user.id })
                    toast.success("User account created successfully")
                    onNext()
                }
            }
        } catch (error: any) {
            toast.error("Error processing user account", {
                description: error.message || "An unexpected error occurred",
            })
        } finally {
            setIsCreatingUser(false)
            setIsCheckingUser(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                form.setValue("picture", reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Employee Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="employee_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee Number *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="EMP-2024-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="section_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section</FormLabel>
                                        <Select
                                            value={field.value ? String(field.value) : ""}
                                            onValueChange={(value) => {
                                                if (!value) {
                                                    field.onChange(undefined)
                                                    return
                                                }
                                                field.onChange(Number(value))
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select section" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent position="popper">
                                                {sections.length > 0 ? (
                                                    sections.map((section) => (
                                                        <SelectItem
                                                            key={section.id}
                                                            value={String(section.id)}
                                                        >
                                                            {section.section_name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="none" disabled>
                                                        No sections available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Software Engineer, Manager" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="date_of_birth"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date of Birth *</FormLabel>
                                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            field.value.toLocaleDateString()
                                                        ) : (
                                                            <span>Select date</span>
                                                        )}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    defaultMonth={field.value}
                                                    onSelect={(date) => {
                                                        field.onChange(date)
                                                        setCalendarOpen(false)
                                                    }}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    captionLayout="dropdown"
                                                    fromYear={1900}
                                                    toYear={new Date().getFullYear()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(Gender).map((gender) => (
                                                    <SelectItem key={gender} value={gender}>
                                                        {gender}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="place_of_birth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Place of Birth *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="City, Country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="current_address"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Current Address *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Full address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_citizen"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Citizen</FormLabel>
                                            <FormDescription>
                                                Check if employee is a citizen of the country
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {isCitizen ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="chief_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Chief/Village Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Chief's name" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Name of the chief or village
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="district"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>District *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="District" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="nationality"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Nationality *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Mosotho" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the country of citizenship
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* User Account Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Account</CardTitle>
                        <FormDescription>
                            Create a user account for the employee to access the system
                        </FormDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="John Doe"
                                                    className="pl-9"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="pl-9"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            This will be used for sign-in
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Password *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-9"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Minimum 6 characters
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Picture Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="picture"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="flex items-center gap-4">
                                            {field.value && (
                                                <img
                                                    src={field.value}
                                                    alt="Preview"
                                                    className="h-20 w-20 rounded-full object-cover"
                                                />
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById("picture-upload")?.click()}
                                                disabled={isCreatingUser || isCheckingUser}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Image
                                            </Button>
                                            <input
                                                id="picture-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isCreatingUser || isCheckingUser}>
                        {isCreatingUser ? (
                            <>
                                <span className="animate-spin mr-2">⚪</span>
                                Creating Account...
                            </>
                        ) : isCheckingUser ? (
                            <>
                                <span className="animate-spin mr-2">⚪</span>
                                Checking User...
                            </>
                        ) : (
                            "Next Step"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}