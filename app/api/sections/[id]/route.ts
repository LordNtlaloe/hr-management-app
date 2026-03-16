// app/api/sections/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── GET /api/sections ───
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search')
        const id = searchParams.get('id')

        // If id is provided, fetch single section
        if (id) {
            const section = await prisma.section.findUnique({
                where: { id: parseInt(id) },
            })

            if (!section)
                return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 })

            return NextResponse.json({ success: true, data: section })
        }

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
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        })
    } catch (error: any) {
        console.error('Error fetching sections:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sections', message: error.message },
            { status: 500 }
        )
    }
}

// ─── POST /api/sections ───
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { section_name, employee_position, employee_id } = body

        if (!section_name)
            return NextResponse.json(
                { success: false, error: 'section_name is required' },
                { status: 400 }
            )

        const newSection = await prisma.section.create({
            data: {
                section_name,
                employee_id: employee_id || '',
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

// ─── PATCH /api/sections ───
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, section_name, employee_position, employee_id } = body

        if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })

        const updatedSection = await prisma.section.update({
            where: { id: parseInt(id) },
            data: {
                ...(section_name && { section_name }),
                ...(employee_position && { employee_position }),
                ...(employee_id && { employee_id }),
            },
        })

        return NextResponse.json({ success: true, data: updatedSection, message: 'Section updated' })
    } catch (error: any) {
        console.error('Error updating section:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update section', message: error.message },
            { status: 500 }
        )
    }
}

// ─── DELETE /api/sections ───
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })

        await prisma.section.delete({
            where: { id: parseInt(id) },
        })

        return NextResponse.json({ success: true, message: 'Section deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting section:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete section', message: error.message },
            { status: 500 }
        )
    }
}