import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { youtubeUrl } = body

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Subtitle import feature requires yt-dlp CLI tool to be installed',
      instructions: [
        '1. Install yt-dlp: pip install yt-dlp',
        '2. Install ffmpeg for audio extraction',
        '3. Run the import script: npm run import-subs -- --video-id=' + params.id + ' --url=' + youtubeUrl
      ]
    })
  } catch (error) {
    console.error('Error importing subtitles:', error)
    return NextResponse.json(
      { error: 'Failed to import subtitles' },
      { status: 500 }
    )
  }
}
