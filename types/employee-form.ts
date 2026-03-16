// types/employee-form.ts
import { z } from "zod"
import { Gender, MaritalStatus } from "./enums"

export const personalInfoSchema = z.object({
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
    // User account fields — collected in step 1, consumed by API, not re-validated at review
    email: z.string().email("Valid email is required").optional(),
    name: z.string().min(1, "Name is required").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    userId: z.string().optional(),
}).superRefine((data, ctx) => {
    // Date validation
    if (!data.date_of_birth) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Date of birth is required",
            path: ["date_of_birth"],
        });
    }

    // Citizenship-based validation
    if (data.is_citizen) {
        if (!data.chief_name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Chief/Village name is required for citizens",
                path: ["chief_name"],
            });
        }
        if (!data.district) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "District is required for citizens",
                path: ["district"],
            });
        }
        if (data.nationality && data.nationality.trim() !== "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Nationality should not be provided for citizens",
                path: ["nationality"],
            });
        }
    } else {
        if (!data.nationality) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Nationality is required for non-citizens",
                path: ["nationality"],
            });
        }
        if (data.chief_name && data.chief_name.trim() !== "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Chief/Village name should not be provided for non-citizens",
                path: ["chief_name"],
            });
        }
        if (data.district && data.district.trim() !== "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "District should not be provided for non-citizens",
                path: ["district"],
            });
        }
    }
});

export const legalInfoSchema = z.object({
    father_name: z.string().min(1, "Father's name is required"),
    father_place_of_birth: z.string().min(1, "Father's place of birth is required"),
    father_occupation: z.string().min(1, "Father's occupation is required"),
    father_address: z.string().min(1, "Father's address is required"),
    is_father_deceased: z.boolean().default(false),
    marital_status: z.nativeEnum(MaritalStatus),
    has_criminal_record: z.boolean().default(false),
    criminal_record_info: z.string().optional(),
    has_been_dismissed: z.boolean().default(false),
    dismissal_reason: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.has_criminal_record && !data.criminal_record_info) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Criminal record info is required when has_criminal_record is true",
            path: ["criminal_record_info"],
        });
    }
    if (data.has_been_dismissed && !data.dismissal_reason) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dismissal reason is required when has_been_dismissed is true",
            path: ["dismissal_reason"],
        });
    }
});

export const educationSchema = z.object({
    school_name: z.string().min(1, "School name is required"),
    date_of_entry: z.date(),
    date_of_leave: z.date(),
    qualification: z.string().min(1, "Qualification is required"),
    qualification_start_date: z.date(),
    qualification_completion_date: z.date(),
    additional_skills: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
    if (!data.date_of_entry) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start date is required",
            path: ["date_of_entry"],
        });
    }
    if (!data.date_of_leave) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date is required",
            path: ["date_of_leave"],
        });
    }
    if (!data.qualification_start_date) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Qualification start date is required",
            path: ["qualification_start_date"],
        });
    }
    if (!data.qualification_completion_date) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Qualification completion date is required",
            path: ["qualification_completion_date"],
        });
    }
    if (data.date_of_entry && data.date_of_leave) {
        if (data.date_of_leave < data.date_of_entry) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Date of leave must be after date of entry",
                path: ["date_of_leave"],
            });
        }
    }
    if (data.qualification_start_date && data.qualification_completion_date) {
        if (data.qualification_completion_date < data.qualification_start_date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Completion date must be after start date",
                path: ["qualification_completion_date"],
            });
        }
    }
});

export const employmentSchema = z.object({
    employer_name: z.string().min(1, "Employer name is required"),
    employee_address: z.string().min(1, "Employee address is required"),
    employer_position: z.string().min(1, "Position is required"),
    duties: z.array(z.string()).min(1, "At least one duty is required"),
    employment_start: z.date(),
    employment_end: z.date(),
    salary: z.string().min(1, "Salary is required"),
    reason_for_leaving: z.string().min(1, "Reason for leaving is required"),
    notice_period: z.string().min(1, "Notice period is required"),
}).superRefine((data, ctx) => {
    if (!data.employment_start) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Employment start date is required",
            path: ["employment_start"],
        });
    }
    if (!data.employment_end) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Employment end date is required",
            path: ["employment_end"],
        });
    }
    if (data.employment_start && data.employment_end) {
        if (data.employment_end < data.employment_start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Employment end date must be after start date",
                path: ["employment_end"],
            });
        }
    }
});

export const referencesSchema = z.object({
    refernce_name: z.string().min(1, "Reference name is required"),
    address: z.string().min(1, "Address is required"),
    occupation: z.string().min(1, "Occupation is required"),
    known_for: z.string().min(1, "How long have you known them? is required"),
});

export const documentsSchema = z.object({
    national_id: z.string().min(1, "National ID is required"),
    passport: z.string().optional(),
    academic_certificates: z.array(z.string()).default([]),  // ← .default([]) not .optional()
    police_clearance: z.string().optional(),
    medical_certificates: z.string().optional(),
    drivers_license: z.string().optional(),
})

export const employeeFormSchema = z.object({
    personal: personalInfoSchema,
    legal: legalInfoSchema,
    education: educationSchema,
    employment: employmentSchema,
    references: referencesSchema,
    documents: documentsSchema,
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type LegalInfo = z.infer<typeof legalInfoSchema>
export type Education = z.infer<typeof educationSchema>
export type Employment = z.infer<typeof employmentSchema>
export type References = z.infer<typeof referencesSchema>
export type Documents = z.infer<typeof documentsSchema>
export type EmployeeFormData = z.infer<typeof employeeFormSchema>