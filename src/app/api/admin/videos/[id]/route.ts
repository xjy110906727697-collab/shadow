import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const uploadsDir = path.join(process.cwd(), 'public')

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { title, titleZh, description, descriptionZh, coverUrl, videoUrl, duration, episodeNumber, difficulty, instructor, published, visitorAccessible, categoryIds } = body
    const { id } = await params

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (titleZh !== undefined) updateData.titleZh = titleZh
    if (description !== undefined) updateData.description = description
    if (descriptionZh !== undefined) updateData.descriptionZh = descriptionZh
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (duration !== undefined) updateData.duration = duration
    if (episodeNumber !== undefined) updateData.episodeNumber = episodeNumber || null
    if (difficulty !== undefined) updateData.difficulty = difficulty || null
    if (instructor !== undefined) updateData.instructor = instructor || null
    if (published !== undefined) updateData.published = published
    if (visitorAccessible !== undefined) updateData.visitorAccessible = visitorAccessible

    if (categoryIds !== undefined) {
      updateData.categories = {
        deleteMany: {},
        create: categoryIds?.map((categoryId: string) => ({
          category: {
            connect: { id: categoryId }
          }
        })) || []
      }
    }

    const video = await prisma.video.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get file URLs before deleting the record
    const video = await prisma.video.findUnique({
      where: { id },
      select: { videoUrl: true, coverUrl: true, audioUrl: true }
    })

    // Delete from database
    await prisma.video.delete({
      where: { id }
    })

    // Delete physical files from uploads
    if (video) {
      for (const url of [video.videoUrl, video.coverUrl, video.audioUrl]) {
        if (url && url.startsWith('/uploads/')) {
          const filePath = path.join(uploadsDir, url)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        }
      }
    }

    return NextResponse.json({ message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
