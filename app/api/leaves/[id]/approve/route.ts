// app/api/leaves/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/leaves/[id]/approve
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)
        const body = await request.json()
        const { approver_signature, filled_by_id } = body

        if (!filled_by_id) {
            return NextResponse.json(
                { success: false, error: 'filled_by_id is required' },
                { status: 400 }
            )
        }

        const application = await prisma.leaveApplication.findUnique({
            where: { id },
            include: { partD: true, employee: { include: { leaveBalance: true } } },
        })

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Leave application not found' },
                { status: 404 }
            )
        }

        if (application.status !== 'FINAL_REVIEW') {
            return NextResponse.json(
                { success: false, error: 'Application must be in FINAL_REVIEW status to approve' },
                { status: 400 }
            )
        }

        const leaveBalance = application.employee?.leaveBalance

        const transactions: any[] = [
            prisma.leaveApplication.update({
                where: { id },
                data: { status: 'APPROVED' },
            }),
            application.partD
                ? prisma.leavePartD.update({
                      where: { leave_application_id: id },
                      data: {
                          final_decision: 'APPROVED',
                          date_of_decision: new Date(),
                          approver_signature: approver_signature || null,
                          filled_by_id,
                      },
                  })
                : prisma.leavePartD.create({
                      data: {
                          leave_application_id: id,
                          final_decision: 'APPROVED',
                          date_of_decision: new Date(),
                          approver_signature: approver_signature || null,
                          filled_by_id,
                      },
                  }),
        ]

        if (application.employeeId && leaveBalance) {
            const days = application.days
            const leaveType = application.leave_type
            const balanceUpdate: any = {}

            if (leaveType === 'ANNUAL') {
                balanceUpdate.annual_used = { increment: days }
                balanceUpdate.annual_remaining = { decrement: days }
            } else if (leaveType === 'SICK') {
                balanceUpdate.sick_used = { increment: days }
                balanceUpdate.sick_remaining = { decrement: days }
            } else if (leaveType === 'UNPAID') {
                balanceUpdate.unpaid_used = { increment: days }
            } else if (leaveType === 'MATERNITY') {
                balanceUpdate.maternity_used = { increment: days }
            }

            transactions.push(
                prisma.leaveBalance.update({
                    where: { employee_id: application.employeeId },
                    data: balanceUpdate,
                })
            )
        }

        const [updatedApplication] = await prisma.$transaction(transactions)

        return NextResponse.json({
            success: true,
            data: updatedApplication,
            message: 'Leave application approved successfully',
        })
    } catch (error: any) {
        console.error('Error approving leave application:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to approve leave application', message: error.message },
            { status: 500 }
        )
    }
}