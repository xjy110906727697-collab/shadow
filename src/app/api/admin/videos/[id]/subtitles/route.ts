import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: {
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
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
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
      subtitleTracks: undefined
    })
  } catch (error) {
    console.error('Error fetching subtitles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subtitles' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { entries } = body

    let koTrack = await prisma.subtitleTrack.findFirst({
      where: { videoId: params.id, lang: 'KO' }
    })

    if (!koTrack) {
      koTrack = await prisma.subtitleTrack.create({
        data: {
          videoId: params.id,
          lang: 'KO'
        }
      })
    }

    await prisma.subtitleEntry.deleteMany({
      where: { trackId: koTrack.id }
    })

    if (entries && entries.length > 0) {
      await prisma.subtitleEntry.createMany({
        data: entries.map((entry: any, idx: number) => ({
          trackId: koTrack.id,
          index: idx,
          startTime: entry.startTime,
          endTime: entry.endTime,
          text: entry.ko || ''
        }))
      })
    }

    let zhTrack = await prisma.subtitleTrack.findFirst({
      where: { videoId: params.id, lang: 'ZH' }
    })

    if (!zhTrack) {
      zhTrack = await prisma.subtitleTrack.create({
        data: {
          videoId: params.id,
          lang: 'ZH'
        }
      })
    }

    await prisma.subtitleEntry.deleteMany({
      where: { trackId: zhTrack.id }
    })

    if (entries && entries.length > 0) {
      await prisma.subtitleEntry.createMany({
        data: entries.map((entry: any, idx: number) => ({
          trackId: zhTrack.id,
          index: idx,
          startTime: entry.startTime,
          endTime: entry.endTime,
          text: entry.zh || ''
        }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating subtitles:', error)
    return NextResponse.json(
      { error: 'Failed to update subtitles' },
      { status: 500 }
    )
  }
}
