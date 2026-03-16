// app/api/leaves/[id]/review/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/leaves/[id]/review
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)
        const body = await request.json()
        const {
            annual_leave_days,
            deducted_days,
            remaining_leave_days,
            hr_signature,
            filled_by_id,
        } = body

        if (!filled_by_id || annual_leave_days === undefined || deducted_days === undefined || remaining_leave_days === undefined) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'filled_by_id, annual_leave_days, deducted_days, and remaining_leave_days are required',
                },
                { status: 400 }
            )
        }

        const application = await prisma.leaveApplication.findUnique({
            where: { id },
            include: { partB: true },
        })

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Leave application not found' },
                { status: 404 }
            )
        }

        if (application.status !== 'PENDING' && application.status !== 'HR_REVIEW') {
            return NextResponse.json(
                { success: false, error: 'Application is not in a reviewable state for HR' },
                { status: 400 }
            )
        }

        const [updatedApplication] = await prisma.$transaction([
            prisma.leaveApplication.update({
                where: { id },
                data: { status: 'SUPERVISOR_REVIEW' },
            }),
            application.partB
                ? prisma.leavePartB.update({
                      where: { leave_application_id: id },
                      data: {
                          annual_leave_days,
                          deducted_days,
                          remaining_leave_days,
                          date_of_approval: new Date(),
                          hr_signature: hr_signature || null,
                          filled_by_id,
                      },
                  })
                : prisma.leavePartB.create({
                      data: {
                          leave_application_id: id,
                          annual_leave_days,
                          deducted_days,
                          remaining_leave_days,
                          date_of_approval: new Date(),
                          hr_signature: hr_signature || null,
                          filled_by_id,
                      },
                  }),
        ])

        return NextResponse.json({
            success: true,
            data: updatedApplication,
            message: 'HR review submitted. Application forwarded to supervisor.',
        })
    } catch (error: any) {
        console.error('Error submitting HR review:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to submit HR review', message: error.message },
            { status: 500 }
        )
    }
}