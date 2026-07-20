import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { youtubeUrl } = body
    const { id } = await params

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      )
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // Fetch transcript from YouTube Transcript API
    const transcriptRes = await fetch(
      `https://youtubetranscript.com/api?vid=${videoId}&lang=en`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!transcriptRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch transcript. Video may not have captions.' },
        { status: 400 }
      )
    }

    const transcriptData = await transcriptRes.json()

    if (!transcriptData?.segments || transcriptData.segments.length === 0) {
      return NextResponse.json(
        { error: 'No transcript segments found for this video.' },
        { status: 400 }
      )
    }

    // Create subtitle tracks
    let koTrack = await prisma.subtitleTrack.findFirst({
      where: { videoId: id, lang: 'KO' }
    })

    if (!koTrack) {
      koTrack = await prisma.subtitleTrack.create({
        data: { videoId: id, lang: 'KO' }
      })
    } else {
      await prisma.subtitleEntry.deleteMany({
        where: { trackId: koTrack.id }
      })
    }

    let zhTrack = await prisma.subtitleTrack.findFirst({
      where: { videoId: id, lang: 'ZH' }
    })

    if (!zhTrack) {
      zhTrack = await prisma.subtitleTrack.create({
        data: { videoId: id, lang: 'ZH' }
      })
    } else {
      await prisma.subtitleEntry.deleteMany({
        where: { trackId: zhTrack.id }
      })
    }

    // Save subtitle entries
    const koEntries = transcriptData.segments.map((seg: any, idx: number) => ({
      trackId: koTrack!.id,
      index: idx,
      startTime: seg.start,
      endTime: seg.start + (seg.duration || 2),
      text: seg.text || '',
    }))

    const zhEntries = transcriptData.segments.map((seg: any, idx: number) => ({
      trackId: zhTrack!.id,
      index: idx,
      startTime: seg.start,
      endTime: seg.start + (seg.duration || 2),
      text: seg.text || '',
    }))

    await prisma.subtitleEntry.createMany({ data: koEntries })
    await prisma.subtitleEntry.createMany({ data: zhEntries })

    const entries = transcriptData.segments.map((seg: any, idx: number) => ({
      id: `new-${idx}`,
      index: idx,
      startTime: seg.start,
      endTime: seg.start + (seg.duration || 2),
      ko: seg.text || '',
      zh: seg.text || '',
    }))

    return NextResponse.json({
      message: '字幕导入成功',
      entries,
    })
  } catch (error: any) {
    console.error('Error importing subtitles:', error)
    if (error?.name === 'TimeoutError') {
      return NextResponse.json(
        { error: '请求超时，请稍后重试' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: '导入字幕失败: ' + (error?.message || '未知错误') },
      { status: 500 }
    )
  }
}
