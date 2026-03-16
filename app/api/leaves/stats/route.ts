// app/api/leave-balance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/leave-balance?employeeId=1&year=2025
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employeeId')
        const year = searchParams.get('year') || new Date().getFullYear().toString()

        if (!employeeId) {
            return NextResponse.json(
                { success: false, error: 'employeeId is required' },
                { status: 400 }
            )
        }

        let balance = await prisma.leaveBalance.findFirst({
            where: {
                employee_id: parseInt(employeeId),
                year: parseInt(year),
            },
            include: {
                employee: {
                    select: {
                        employee_number: true,
                        position: true,
                        users: { select: { name: true } },
                    },
                },
            },
        })

        // Auto-create balance for the year if it doesn't exist
        if (!balance) {
            balance = await prisma.leaveBalance.create({
                data: {
                    employee_id: parseInt(employeeId),
                    year: parseInt(year),
                },
                include: {
                    employee: {
                        select: {
                            employee_number: true,
                            position: true,
                            users: { select: { name: true } },
                        },
                    },
                },
            })
        }

        return NextResponse.json({ success: true, data: balance })
    } catch (error: any) {
        console.error('Error fetching leave balance:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch leave balance', message: error.message },
            { status: 500 }
        )
    }
}

// PATCH /api/leave-balance  — HR manually adjusts balance (e.g. carry-over)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { employeeId, year, carried_over, annual_total, sick_total } = body

        if (!employeeId) {
            return NextResponse.json(
                { success: false, error: 'employeeId is required' },
                { status: 400 }
            )
        }

        const targetYear = year || new Date().getFullYear()

        const updated = await prisma.leaveBalance.upsert({
            where: {
                employee_id_year: {
                    employee_id: parseInt(employeeId),
                    year: parseInt(targetYear),
                },
            },
            update: {
                ...(carried_over !== undefined && { carried_over }),
                ...(annual_total !== undefined && {
                    annual_total,
                    annual_remaining: annual_total,
                }),
                ...(sick_total !== undefined && { sick_total, sick_remaining: sick_total }),
            },
            create: {
                employee_id: parseInt(employeeId),
                year: parseInt(targetYear),
                ...(carried_over !== undefined && { carried_over }),
                ...(annual_total !== undefined && {
                    annual_total,
                    annual_remaining: annual_total,
                }),
                ...(sick_total !== undefined && { sick_total, sick_remaining: sick_total }),
            },
        })

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Leave balance updated successfully',
        })
    } catch (error: any) {
        console.error('Error updating leave balance:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update leave balance', message: error.message },
            { status: 500 }
        )
    }
}