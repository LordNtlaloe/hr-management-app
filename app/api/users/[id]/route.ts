import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// GET /api/users/:id
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                employee: true,
                sessions: true,
                accounts: true,
                leaveApplications: {
                    include: {
                        partA: true,
                        partB: true,
                        partC: true,
                        partD: true
                    },
                    orderBy: { applied_at: 'desc' }
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: user })
    } catch (error: any) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user', message: error.message },
            { status: 500 }
        )
    }
}

// PUT /api/users/:id
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, email, role, banned, banReason, banExpires } = body

        const existingUser = await prisma.user.findUnique({ where: { id } })

        if (!existingUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        const updateData: any = { name, email, role, banned, banReason }
        if (banExpires) updateData.banExpires = new Date(banExpires)

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: { employee: true }
        })

        return NextResponse.json({
            success: true,
            data: user,
            message: 'User updated successfully'
        })
    } catch (error: any) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE /api/users/:id
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const user = await prisma.user.findUnique({ where: { id } })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        await prisma.user.delete({ where: { id } })

        return NextResponse.json({ success: true, message: 'User deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete user', message: error.message },
            { status: 500 }
        )
    }
}