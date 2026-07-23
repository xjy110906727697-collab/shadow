import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('search') || ''
  const videoId = searchParams.get('videoId') || ''

  const skip = (page - 1) * pageSize

  const where: any = {}

  if (search) {
    where.OR = [
      { word: { contains: search, mode: 'insensitive' } },
      { meaning: { contains: search, mode: 'insensitive' } },
      { meaningZh: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (videoId) {
    where.videoId = videoId
  }

  try {
    const [words, total] = await Promise.all([
      prisma.videoWord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          video: { select: { titleZh: true, title: true } },
        },
      }),
      prisma.videoWord.count({ where }),
    ])

    return NextResponse.json({
      words,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching word cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch word cards' },
      { status: 500 }
    )
  }
}
