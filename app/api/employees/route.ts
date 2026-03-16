import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Gender } from '@prisma/client'

// GET /api/employees
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const sectionId = searchParams.get('sectionId') ? parseInt(searchParams.get('sectionId')!) : undefined
        const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined
        const search = searchParams.get('search')

        const skip = (page - 1) * limit

        const where: any = {}

        if (sectionId) where.section_id = sectionId
        if (isActive !== undefined) where.is_active = isActive

        if (search) {
            where.OR = [
                { employee_number: { contains: search, mode: 'insensitive' } },
                { users: { some: { name: { contains: search, mode: 'insensitive' } } } },
                { current_address: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where,
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    section: true,
                    leaveBalance: {
                        where: {
                            year: new Date().getFullYear()
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.employee.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: employees,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error: any) {
        console.error('Error fetching employees:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch employees', message: error.message },
            { status: 500 }
        )
    }
}

// POST /api/employees
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { personal, legal, education, employment, references, documents } = body

        const {
            userId,
            employee_number,
            current_address,
            date_of_birth,
            gender,
            picture,
            place_of_birth,
            is_citizen,
            chief_name,
            district,
            nationality,
            section_id,
            position,
        } = personal

        // --- All validation and pre-checks BEFORE the transaction ---

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User account not found. Please complete step 1 again.' },
                { status: 400 }
            )
        }

        if (!employee_number || !current_address || !date_of_birth || !gender || !place_of_birth) {
            return NextResponse.json(
                { success: false, error: 'Missing required employee fields' },
                { status: 400 }
            )
        }

        if (is_citizen) {
            if (!chief_name || !district) {
                return NextResponse.json(
                    { success: false, error: 'Chief name and district are required for citizens' },
                    { status: 400 }
                )
            }
        } else {
            if (!nationality) {
                return NextResponse.json(
                    { success: false, error: 'Nationality is required for non-citizens' },
                    { status: 400 }
                )
            }
        }

        const existingEmployee = await prisma.employee.findUnique({
            where: { employee_number }
        })

        if (existingEmployee) {
            return NextResponse.json(
                { success: false, error: 'Employee number already exists' },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!existingUser) {
            return NextResponse.json(
                { success: false, error: 'User account not found. Please complete step 1 again.' },
                { status: 400 }
            )
        }

        // Pre-parse all dates before entering the transaction
        const parsedDateOfBirth = new Date(date_of_birth)
        const parsedEducation = education && Object.keys(education).length > 0 ? {
            ...education,
            date_of_entry: new Date(education.date_of_entry),
            date_of_leave: new Date(education.date_of_leave),
            qualification_start_date: new Date(education.qualification_start_date),
            qualification_completion_date: new Date(education.qualification_completion_date),
        } : null
        const parsedEmployment = employment && Object.keys(employment).length > 0 ? {
            ...employment,
            employment_start: new Date(employment.employment_start),
            employment_end: new Date(employment.employment_end),
        } : null
        const parsedSectionId = section_id
            ? (typeof section_id === 'string' ? parseInt(section_id) : section_id)
            : null

        // --- Transaction with only DB writes, no parsing or checks ---
        const employee = await prisma.$transaction(async (tx) => {
            const newEmployee = await tx.employee.create({
                data: {
                    employee_number,
                    current_address,
                    date_of_birth: parsedDateOfBirth,
                    gender: gender as Gender,
                    picture: picture || '',
                    place_of_birth,
                    is_citizen,
                    chief_name: chief_name || null,
                    district: district || null,
                    nationality: nationality || null,
                    position: position || null,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                    ...(parsedSectionId && { section_id: parsedSectionId }),
                }
            })

            await tx.user.update({
                where: { id: userId },
                data: {
                    employeeId: newEmployee.id,
                    role: "EMPLOYEE"
                }
            })

            if (legal && Object.keys(legal).length > 0) {
                await tx.legalInfo.create({
                    data: {
                        father_name: legal.father_name,
                        father_place_of_birth: legal.father_place_of_birth,
                        father_occupation: legal.father_occupation,
                        father_address: legal.father_address,
                        is_father_deceased: legal.is_father_deceased || false,
                        marital_status: legal.marital_status,
                        has_criminal_record: legal.has_criminal_record || false,
                        criminal_record_info: legal.criminal_record_info || null,
                        has_been_dismissed: legal.has_been_dismissed || false,
                        dismissal_reason: legal.dismissal_reason || null,
                        employee_id: newEmployee.id
                    }
                })
            }

            if (parsedEducation) {
                await tx.educationHistory.create({
                    data: {
                        school_name: parsedEducation.school_name,
                        date_of_entry: parsedEducation.date_of_entry,
                        date_of_leave: parsedEducation.date_of_leave,
                        qualification: parsedEducation.qualification,
                        qualification_start_date: parsedEducation.qualification_start_date,
                        qualification_completion_date: parsedEducation.qualification_completion_date,
                        additional_skills: parsedEducation.additional_skills || [],
                        employee_id: newEmployee.id
                    }
                })
            }

            if (parsedEmployment) {
                await tx.employmentHistory.create({
                    data: {
                        employer_name: parsedEmployment.employer_name,
                        employee_address: parsedEmployment.employee_address,
                        employer_position: parsedEmployment.employer_position,
                        duties: parsedEmployment.duties || [],
                        employment_start: parsedEmployment.employment_start,
                        employment_end: parsedEmployment.employment_end,
                        salary: parsedEmployment.salary,
                        reason_for_leaving: parsedEmployment.reason_for_leaving,
                        notice_period: parsedEmployment.notice_period,
                        employee_id: newEmployee.id
                    }
                })
            }

            if (references && Object.keys(references).length > 0) {
                await tx.references.create({
                    data: {
                        refernce_name: references.refernce_name,
                        address: references.address,
                        occupation: references.occupation,
                        known_for: references.known_for,
                        employee_id: newEmployee.id
                    }
                })
            }

            if (documents && Object.keys(documents).length > 0) {
                await tx.employeeDocuments.create({
                    data: {
                        national_id: documents.national_id,
                        passport: documents.passport || null,
                        acdemic_certificates: documents.academic_certificates || [],
                        police_clearance: documents.police_clearance || null,
                        medical_certificates: documents.medical_certificates || null,
                        drivers_license: documents.drivers_license || null,
                        created_at: new Date(),
                        updated_at: new Date(),
                        employee_id: newEmployee.id
                    }
                })
            }

            await tx.leaveBalance.create({
                data: {
                    year: new Date().getFullYear(),
                    employee_id: newEmployee.id,
                    annual_total: 24,
                    annual_remaining: 24,
                    sick_total: 12,
                    sick_remaining: 12,
                    unpaid_used: 0,
                    maternity_used: 0,
                    carried_over: 0,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            })

            return newEmployee
        }, {
            timeout: 30000 // 30 seconds — enough for all writes
        })

        return NextResponse.json({
            success: true,
            data: employee,
            message: 'Employee created successfully'
        }, { status: 201 })

    } catch (error: any) {
        console.error('Error creating employee:', error)

        if (error.code === 'P2002') {
            const target = error.meta?.target
            if (target?.includes('email')) {
                return NextResponse.json(
                    { success: false, error: 'An account with this email already exists' },
                    { status: 409 }
                )
            }
            if (target?.includes('employee_number')) {
                return NextResponse.json(
                    { success: false, error: 'An employee with this number already exists' },
                    { status: 409 }
                )
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create employee',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        )
    }
}