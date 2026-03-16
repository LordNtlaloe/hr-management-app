import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const role = searchParams.get('role')
        const search = searchParams.get('search')

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}
        if (role) where.role = role
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }

        // Get users with pagination
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    employee: true,
                    leaveApplications: {
                        take: 5,
                        orderBy: { applied_at: 'desc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error: any) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch users',
                message: error.message
            },
            { status: 500 }
        )
    }
}

// POST /api/users
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, email, role, employeeId } = body

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User already exists'
                },
                { status: 400 }
            )
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                id,
                name,
                email,
                role,
                ...(employeeId && {
                    employee: {
                        connect: { id: parseInt(employeeId) }
                    }
                })
            },
            include: {
                employee: true
            }
        })

        return NextResponse.json({
            success: true,
            data: user,
            message: 'User created successfully'
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create user',
                message: error.message
            },
            { status: 500 }
        )
    }
}