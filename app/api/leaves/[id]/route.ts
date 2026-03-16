// app/api/leaves/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/leaves/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)

        const application = await prisma.leaveApplication.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        employee_number: true,
                        position: true,
                        gender: true,
                        users: { select: { name: true, email: true } },
                        section: { select: { section_name: true } },
                        leaveBalance: true,
                    },
                },
                user: { select: { id: true, name: true, email: true, role: true } },
                partA: { include: { filled_by: { select: { name: true, email: true } } } },
                partB: { include: { filled_by: { select: { name: true, email: true } } } },
                partC: { include: { filled_by: { select: { name: true, email: true } } } },
                partD: { include: { filled_by: { select: { name: true, email: true } } } },
            },
        })

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Leave application not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: application })
    } catch (error: any) {
        console.error('Error fetching leave application:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch leave application', message: error.message },
            { status: 500 }
        )
    }
}

// PATCH /api/leaves/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)
        const body = await request.json()
        const { reason, start_date, end_date, days } = body

        const existing = await prisma.leaveApplication.findUnique({ where: { id } })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Leave application not found' },
                { status: 404 }
            )
        }

        if (existing.status !== 'PENDING') {
            return NextResponse.json(
                { success: false, error: 'Only PENDING applications can be edited' },
                { status: 400 }
            )
        }

        const updated = await prisma.leaveApplication.update({
            where: { id },
            data: {
                ...(reason !== undefined && { reason }),
                ...(start_date && { start_date: new Date(start_date) }),
                ...(end_date && { end_date: new Date(end_date) }),
                ...(days && { days: parseInt(days) }),
            },
        })

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Leave application updated successfully',
        })
    } catch (error: any) {
        console.error('Error updating leave application:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update leave application', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE /api/leaves/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)

        const existing = await prisma.leaveApplication.findUnique({ where: { id } })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Leave application not found' },
                { status: 404 }
            )
        }

        if (existing.status !== 'PENDING') {
            return NextResponse.json(
                { success: false, error: 'Only PENDING applications can be withdrawn' },
                { status: 400 }
            )
        }

        await prisma.leaveApplication.delete({ where: { id } })

        return NextResponse.json({
            success: true,
            message: 'Leave application withdrawn successfully',
        })
    } catch (error: any) {
        console.error('Error deleting leave application:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to withdraw leave application', message: error.message },
            { status: 500 }
        )
    }
}