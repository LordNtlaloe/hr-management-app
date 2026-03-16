// app/api/leaves/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/leaves/[id]/reject
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)
        const body = await request.json()
        const { rejection_reason, rejected_by_id, approver_signature, filled_by_id } = body

        if (!rejected_by_id) {
            return NextResponse.json(
                { success: false, error: 'rejected_by_id is required' },
                { status: 400 }
            )
        }

        const application = await prisma.leaveApplication.findUnique({
            where: { id },
            include: { partD: true },
        })

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Leave application not found' },
                { status: 404 }
            )
        }

        if (application.status === 'APPROVED' || application.status === 'REJECTED') {
            return NextResponse.json(
                { success: false, error: 'Application is already finalised' },
                { status: 400 }
            )
        }

        const partDFillerId = filled_by_id || rejected_by_id

        const [updatedApplication] = await prisma.$transaction([
            prisma.leaveApplication.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    rejected_by_id: rejected_by_id ? parseInt(rejected_by_id) : undefined,
                    rejected_at: new Date(),
                    rejection_reason: rejection_reason || null,
                },
            }),
            application.partD
                ? prisma.leavePartD.update({
                      where: { leave_application_id: id },
                      data: {
                          final_decision: 'REJECTED',
                          date_of_decision: new Date(),
                          approver_signature: approver_signature || null,
                          filled_by_id: partDFillerId,
                      },
                  })
                : prisma.leavePartD.create({
                      data: {
                          leave_application_id: id,
                          final_decision: 'REJECTED',
                          date_of_decision: new Date(),
                          approver_signature: approver_signature || null,
                          filled_by_id: partDFillerId,
                      },
                  }),
        ])

        return NextResponse.json({
            success: true,
            data: updatedApplication,
            message: 'Leave application rejected',
        })
    } catch (error: any) {
        console.error('Error rejecting leave application:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to reject leave application', message: error.message },
            { status: 500 }
        )
    }
}