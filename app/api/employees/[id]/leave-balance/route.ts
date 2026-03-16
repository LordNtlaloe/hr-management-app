import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const employeeId = parseInt(params.id)
        const { searchParams } = new URL(request.url)
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        const leaveBalance = await prisma.leaveBalance.findUnique({
            where: {
                employee_id_year: {
                    employee_id: employeeId,
                    year
                }
            },
            include: {
                employee: {
                    select: {
                        employee_number: true,
                        position: true,
                        section: true,
                        users: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!leaveBalance) {
            // Create default balance if not exists
            const newBalance = await prisma.leaveBalance.create({
                data: {
                    year,
                    employee_id: employeeId,
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
            return NextResponse.json({ success: true, data: newBalance })
        }

        return NextResponse.json({
            success: true,
            data: leaveBalance
        })
    } catch (error: any) {
        console.error('Error fetching leave balance:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch leave balance' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const employeeId = parseInt(params.id)
        const body = await request.json()
        const { year, ...updates } = body

        // Verify permissions (should be HR or Admin)
        // Add your auth check here

        const leaveBalance = await prisma.leaveBalance.update({
            where: {
                employee_id_year: {
                    employee_id: employeeId,
                    year: year || new Date().getFullYear()
                }
            },
            data: {
                ...updates,
                updated_at: new Date()
            }
        })

        // Log the adjustment for audit trail
        // await prisma.auditLog.create({
        //     data: {
        //         action: 'LEAVE_BALANCE_ADJUSTED',
        //         employee_id: employeeId,
        //         details: JSON.stringify({ year, ...updates }),
        //         user_id: request.headers.get('x-user-id') // Get from auth middleware
        //     }
        // })

        return NextResponse.json({
            success: true,
            data: leaveBalance,
            message: 'Leave balance updated successfully'
        })
    } catch (error: any) {
        console.error('Error updating leave balance:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update leave balance' },
            { status: 500 }
        )
    }
}