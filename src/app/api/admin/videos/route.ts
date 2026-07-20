import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const published = searchParams.get('published')
    const visitorAccessible = searchParams.get('visitorAccessible')
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * pageSize

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleZh: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (published !== null && published !== '') {
      where.published = published === 'true'
    }

    if (visitorAccessible !== null && visitorAccessible !== '') {
      where.visitorAccessible = visitorAccessible === 'true'
    }

    const validSortFields = ['titleZh', 'duration', 'published', 'visitorAccessible', 'createdAt']
    const field = validSortFields.includes(sortField) ? sortField : 'createdAt'
    const order = sortOrder === 'ascend' ? 'asc' : 'desc'

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: { [field]: order },
        skip,
        take: pageSize,
      }),
      prisma.video.count({ where })
    ])

    return NextResponse.json({
      videos,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, titleZh, description, descriptionZh, coverUrl, videoUrl, duration, published, visitorAccessible, categoryIds } = body

    if (!title || !titleZh || !coverUrl || !videoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        title,
        titleZh,
        description,
        descriptionZh,
        coverUrl,
        videoUrl,
        duration,
        published: published || false,
        visitorAccessible: visitorAccessible || false,
        categories: {
          create: categoryIds?.map((categoryId: string) => ({
            category: {
              connect: { id: categoryId }
            }
          })) || []
        }
      }
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
