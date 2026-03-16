// app/api/sections/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sections
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search')

        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.section_name = { contains: search, mode: 'insensitive' }
        }

        const [sections, total] = await Promise.all([
            prisma.section.findMany({
                where,
                skip,
                take: limit,
                orderBy: { section_name: 'asc' },
            }),
            prisma.section.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: sections,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error: any) {
        console.error('Error fetching sections:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sections', message: error.message },
            { status: 500 }
        )
    }
}


// POST /api/sections
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { section_name } = body

        if (!section_name) {
            return NextResponse.json(
                { success: false, error: 'section_name is required' },
                { status: 400 }
            )
        }

        const newSection = await prisma.section.create({
            data: {
                section_name,
            },
        })

        return NextResponse.json({
            success: true,
            data: newSection,
            message: 'Section created successfully',
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating section:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create section', message: error.message },
            { status: 500 }
        )
    }
}