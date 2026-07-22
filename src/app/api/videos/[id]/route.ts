import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPlayInfo } from '@/lib/vod'

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

    let playUrl = video.videoUrl
    let coverUrl = video.coverUrl

    if (video.vodVideoId) {
      try {
        const vodInfo = await getPlayInfo(video.vodVideoId)
        const playInfoList = vodInfo.body?.playInfoList?.playInfo || []
        const mp4Url = playInfoList.find((p: any) => p.format === 'mp4')?.playURL
        const m3u8Url = playInfoList.find((p: any) => p.format === 'm3u8')?.playURL
        playUrl = m3u8Url || mp4Url || video.videoUrl
        coverUrl = vodInfo.body?.videoBase?.coverURL || video.coverUrl
      } catch (error) {
        console.error('Error fetching VOD play info:', error)
      }
    }

    return NextResponse.json({
      ...video,
      videoUrl: playUrl,
      coverUrl,
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
