import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
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
