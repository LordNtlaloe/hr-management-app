import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Gender, MARITAL_STATUS } from '@prisma/client'

// GET /api/employees/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            include: {
                users: true,
                section: true,
                legal_info: true,
                education_history: true,
                employment_history: true,
                references: true,
                employee_documents: true,
                leaveApplications: {
                    include: {
                        partA: true,
                        partB: true,
                        partC: true,
                        partD: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    },
                    orderBy: {
                        applied_at: 'desc'
                    }
                },
                leaveBalance: true
            }
        })

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            )
        }

        if (Array.isArray(employee.leaveBalance)) {
            employee.leaveBalance.sort((a, b) => b.year - a.year)
        }

        return NextResponse.json({ success: true, data: employee })
    } catch (error: any) {
        console.error('Error fetching employee:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch employee', message: error.message },
            { status: 500 }
        )
    }
}

// PUT /api/employees/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const {
            current_address,
            date_of_birth,
            gender,
            picture,
            place_of_birth,
            is_citizen,
            chief_name,
            district,
            nationality,
            is_active,
            section_id,
            legal_info,
            education_history,
            employment_history,
            references,
            employee_documents
        } = body

        const existingEmployee = await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            include: {
                legal_info: true,
                education_history: true,
                employment_history: true,
                references: true,
                employee_documents: true
            }
        })

        if (!existingEmployee) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            )
        }

        await prisma.$transaction(async (tx) => {
            await tx.employee.update({
                where: { id: parseInt(id) },
                data: {
                    ...(current_address !== undefined && { current_address }),
                    ...(date_of_birth && { date_of_birth: new Date(date_of_birth) }),
                    ...(gender && { gender: gender as Gender }),
                    ...(picture !== undefined && { picture }),
                    ...(place_of_birth !== undefined && { place_of_birth }),
                    ...(is_citizen !== undefined && { is_citizen }),
                    ...(chief_name !== undefined && { chief_name }),
                    ...(district !== undefined && { district }),
                    ...(nationality !== undefined && { nationality }),
                    ...(is_active !== undefined && { is_active }),
                    ...(section_id && { section_id: parseInt(section_id) }),
                    updated_at: new Date()
                }
            })

            if (legal_info) {
                const legalData: any = {
                    father_name: legal_info.father_name,
                    is_father_deceased: legal_info.is_father_deceased,
                    father_place_of_birth: legal_info.father_place_of_birth,
                    father_occupation: legal_info.father_occupation,
                    father_address: legal_info.father_address,
                    marital_status: legal_info.marital_status as MARITAL_STATUS,
                    has_criminal_record: legal_info.has_criminal_record,
                    criminal_record_info: legal_info.criminal_record_info,
                    has_been_dismissed: legal_info.has_been_dismissed,
                    dismissal_reason: legal_info.dismissal_reason
                }

                if (existingEmployee.legal_info) {
                    await tx.legalInfo.update({
                        where: { id: existingEmployee.legal_info.id },
                        data: legalData
                    })
                } else {
                    await tx.legalInfo.create({
                        data: { ...legalData, employee_id: parseInt(id) }
                    })
                }
            }

            if (education_history) {
                const educationData: any = {
                    school_name: education_history.school_name,
                    date_of_entry: education_history.date_of_entry ? new Date(education_history.date_of_entry) : null,
                    date_of_leave: education_history.date_of_leave ? new Date(education_history.date_of_leave) : null,
                    qualification: education_history.qualification,
                    qualification_start_date: education_history.qualification_start_date ? new Date(education_history.qualification_start_date) : null,
                    qualification_completion_date: education_history.qualification_completion_date ? new Date(education_history.qualification_completion_date) : null,
                    additional_skills: education_history.additional_skills || []
                }

                if (existingEmployee.education_history) {
                    await tx.educationHistory.update({
                        where: { id: existingEmployee.education_history.id },
                        data: educationData
                    })
                } else {
                    await tx.educationHistory.create({
                        data: { ...educationData, employee_id: parseInt(id) }
                    })
                }
            }

            if (employment_history) {
                const employmentData: any = {
                    employer_name: employment_history.employer_name,
                    employee_address: employment_history.employee_address,
                    employer_position: employment_history.employer_position,
                    duties: employment_history.duties || [],
                    salary: employment_history.salary,
                    reason_for_leaving: employment_history.reason_for_leaving,
                    notice_period: employment_history.notice_period
                }

                if (employment_history.employment_start) {
                    employmentData.employment_start = new Date(employment_history.employment_start)
                }
                if (employment_history.employment_end) {
                    employmentData.employment_end = new Date(employment_history.employment_end)
                }

                if (existingEmployee.employment_history) {
                    await tx.employmentHistory.update({
                        where: { id: existingEmployee.employment_history.id },
                        data: employmentData
                    })
                } else {
                    await tx.employmentHistory.create({
                        data: { ...employmentData, employee_id: parseInt(id) }
                    })
                }
            }

            if (references) {
                const referencesData = {
                    refernce_name: references.refernce_name,
                    address: references.address,
                    occupation: references.occupation,
                    known_for: references.known_for
                }

                if (existingEmployee.references) {
                    await tx.references.update({
                        where: { id: existingEmployee.references.id },
                        data: referencesData
                    })
                } else {
                    await tx.references.create({
                        data: { ...referencesData, employee_id: parseInt(id) }
                    })
                }
            }

            if (employee_documents) {
                const docsData = {
                    national_id: employee_documents.national_id,
                    passport: employee_documents.passport,
                    acdemic_certificates: employee_documents.acdemic_certificates || [],
                    police_clearance: employee_documents.police_clearance,
                    medical_certificates: employee_documents.medical_certificates,
                    drivers_license: employee_documents.drivers_license,
                    updated_at: new Date()
                }

                if (existingEmployee.employee_documents) {
                    await tx.employeeDocuments.update({
                        where: { id: existingEmployee.employee_documents.id },
                        data: docsData
                    })
                } else {
                    await tx.employeeDocuments.create({
                        data: { ...docsData, created_at: new Date(), employee_id: parseInt(id) }
                    })
                }
            }
        })

        const updatedEmployee = await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            include: {
                users: true,
                section: true,
                legal_info: true,
                education_history: true,
                employment_history: true,
                references: true,
                employee_documents: true,
                leaveBalance: true,
                leaveApplications: {
                    include: {
                        partA: true,
                        partB: true,
                        partC: true,
                        partD: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    },
                    orderBy: { applied_at: 'desc' }
                }
            }
        })

        if (Array.isArray(updatedEmployee?.leaveBalance)) {
            updatedEmployee.leaveBalance.sort((a, b) => b.year - a.year)
        }

        return NextResponse.json({
            success: true,
            data: updatedEmployee,
            message: 'Employee updated successfully'
        })
    } catch (error: any) {
        console.error('Error updating employee:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update employee', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE /api/employees/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            include: { users: true }
        })

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            )
        }

        if (employee.users && employee.users.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Cannot delete employee with associated user accounts. Please deactivate instead.'
                },
                { status: 400 }
            )
        }

        await prisma.employee.delete({
            where: { id: parseInt(id) }
        })

        return NextResponse.json({ success: true, message: 'Employee deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting employee:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete employee', message: error.message },
            { status: 500 }
        )
    }
}