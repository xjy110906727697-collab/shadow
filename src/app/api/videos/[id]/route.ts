import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const isVisitor = !session

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        subtitleTracks: {
          include: {
            entries: {
              orderBy: { index: 'asc' }
            }
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

    if (isVisitor && !video.visitorAccessible) {
      return NextResponse.json(
        { error: '需要订阅', code: 'LOCKED' },
        { status: 403 }
      )
    }

    const koTrack = video.subtitleTracks.find(t => t.lang === 'KO')
    const zhTrack = video.subtitleTracks.find(t => t.lang === 'ZH')

    const subtitles = koTrack?.entries.map((entry, idx) => ({
      id: entry.id,
      index: entry.index,
      startTime: entry.startTime,
      endTime: entry.endTime,
      ko: entry.text,
      zh: zhTrack?.entries[idx]?.text || ''
    })) || []

    return NextResponse.json({
      ...video,
      subtitles,
      categories: undefined,
      subtitleTracks: undefined
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}
