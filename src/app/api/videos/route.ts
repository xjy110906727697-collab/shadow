import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const isVisitor = !session

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const topic = searchParams.get('topic')
    const search = searchParams.get('search')
    const duration = searchParams.get('duration')
    const difficulty = searchParams.get('difficulty')
    const instructor = searchParams.get('instructor')
    const progress = searchParams.get('progress')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')

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

    // Duration filter
    if (duration) {
      switch (duration) {
        case 'lt3':
          where.duration = { lt: 180 }
          break
        case '3to5':
          where.duration = { gte: 180, lte: 300 }
          break
        case 'gt5':
          where.duration = { gt: 300 }
          break
      }
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = parseInt(difficulty)
    }

    // Instructor filter
    if (instructor) {
      where.instructor = instructor
    }

    // Progress filter (learned / unlearned)
    if (progress && session?.user?.id) {
      if (progress === 'learned') {
        where.progress = {
          some: {
            userId: session.user.id,
            completed: true,
          }
        }
      } else if (progress === 'unlearned') {
        where.progress = {
          none: {
            userId: session.user.id,
            completed: true,
          }
        }
      }
    }

    const effectiveLimit = isVisitor ? Math.min(limit, 12) : limit

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
        take: effectiveLimit,
      }),
      prisma.video.count({ where })
    ])

    const videosWithLevel = videos.map(video => {
      const levelCategory = video.categories.find(c => c.category.type === 'LEVEL')
      const topicCategories = video.categories
        .filter(c => c.category.type === 'TOPIC')
        .map(c => ({ id: c.category.id, name: c.category.nameZh, slug: c.category.slug }))
      return {
        id: video.id,
        title: video.title,
        titleZh: video.titleZh,
        description: video.description,
        descriptionZh: video.descriptionZh,
        coverUrl: video.coverUrl,
        duration: video.duration,
        episodeNumber: video.episodeNumber,
        difficulty: video.difficulty,
        instructor: video.instructor,
        level: levelCategory?.category.nameZh || null,
        topics: topicCategories,
        visitorAccessible: video.visitorAccessible,
        createdAt: video.createdAt,
        categories: undefined
      }
    })

    return NextResponse.json({
      videos: videosWithLevel,
      isVisitor,
      pagination: {
        page,
        limit: effectiveLimit,
        total,
        totalPages: Math.ceil(total / effectiveLimit)
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
