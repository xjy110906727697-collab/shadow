import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const topic = searchParams.get('topic')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const skip = (page - 1) * limit

    const where: any = {
      published: true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleZh: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionZh: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (level || topic) {
      where.categories = {
        some: {}
      }

      const categoryFilters = []

      if (level) {
        categoryFilters.push({
          category: {
            type: 'LEVEL',
            slug: level
          }
        })
      }

      if (topic) {
        categoryFilters.push({
          category: {
            type: 'TOPIC',
            slug: topic
          }
        })
      }

      if (categoryFilters.length > 0) {
        where.categories.some = {
          OR: categoryFilters
        }
      }
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          categories: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.video.count({ where })
    ])

    const videosWithLevel = videos.map(video => {
      const levelCategory = video.categories.find(c => c.category.type === 'LEVEL')
      return {
        ...video,
        level: levelCategory?.category.nameZh || null,
        categories: undefined
      }
    })

    return NextResponse.json({
      videos: videosWithLevel,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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
