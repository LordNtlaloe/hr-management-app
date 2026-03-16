// app/api/leaves/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/leaves
// HR: sees all applications with filters
// Employee: sees only their own
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const status = searchParams.get('status')
        const leave_type = searchParams.get('leave_type')
        const employeeId = searchParams.get('employeeId')
        const userId = searchParams.get('userId')
        const year = searchParams.get('year')

        const skip = (page - 1) * limit

        const where: any = {}

        if (status) where.status = status
        if (leave_type) where.leave_type = leave_type
        if (employeeId) where.employeeId = parseInt(employeeId)
        if (userId) where.userId = userId

        if (year) {
            const yearInt = parseInt(year)
            where.start_date = {
                gte: new Date(`${yearInt}-01-01`),
                lte: new Date(`${yearInt}-12-31`),
            }
        }

        const [applications, total] = await Promise.all([
            prisma.leaveApplication.findMany({
                where,
                skip,
                take: limit,
                orderBy: { applied_at: 'desc' },
                include: {
                    employee: {
                        select: {
                            id: true,
                            employee_number: true,
                            position: true,
                            users: { select: { name: true, email: true } },
                            section: { select: { section_name: true } },
                        },
                    },
                    user: { select: { id: true, name: true, email: true, role: true } },
                    partA: true,
                    partB: true,
                    partC: true,
                    partD: true,
                },
            }),
            prisma.leaveApplication.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: applications,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error: any) {
        console.error('Error fetching leave applications:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch leave applications', message: error.message },
            { status: 500 }
        )
    }
}

// POST /api/leaves
// Employee submits a new leave application (creates application + Part A)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            leave_type,
            start_date,
            end_date,
            days,
            reason,
            userId,
            employeeId,
            // Part A fields
            employee_name,
            employment_number,
            employee_position,
            location_during_leave,
            phone_number,
            email,
            current_address,
            employee_signature,
        } = body

        if (!leave_type || !start_date || !end_date || !days || !userId) {
            return NextResponse.json(
                { success: false, error: 'leave_type, start_date, end_date, days, and userId are required' },
                { status: 400 }
            )
        }

        const application = await prisma.leaveApplication.create({
            data: {
                leave_type,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                days: parseInt(days),
                reason,
                status: 'PENDING',
                userId,
                employeeId: employeeId ? parseInt(employeeId) : undefined,
                partA: {
                    create: {
                        employee_name,
                        employment_number,
                        employee_position,
                        number_of_leave_days: parseInt(days),
                        start_date: new Date(start_date),
                        end_date: new Date(end_date),
                        location_during_leave,
                        phone_number,
                        email,
                        current_address,
                        date_of_request: new Date(),
                        employee_signature,
                        filled_by_id: userId,
                    },
                },
            },
            include: {
                partA: true,
                employee: {
                    select: { employee_number: true, position: true },
                },
            },
        })

        return NextResponse.json(
            {
                success: true,
                data: application,
                message: 'Leave application submitted successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error creating leave application:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create leave application', message: error.message },
            { status: 500 }
        )
    }
}

