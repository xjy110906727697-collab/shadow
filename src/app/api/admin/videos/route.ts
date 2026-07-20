import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(videos)
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
    const { title, titleZh, description, descriptionZh, coverUrl, videoUrl, duration, published, categoryIds } = body

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
