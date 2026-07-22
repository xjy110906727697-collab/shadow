import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPlayInfo } from '@/lib/vod'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: vodVideoId } = await params

    const result = await getPlayInfo(vodVideoId)

    const playInfoList = result.body.playInfoList?.playInfo || []
    
    const mp4Url = playInfoList.find((p: { format: string }) => p.format === 'mp4')?.playURL
    const m3u8Url = playInfoList.find((p: { format: string }) => p.format === 'm3u8')?.playURL
    const coverUrl = result.body.videoBase?.coverURL
    const duration = parseFloat(result.body.videoBase?.duration || '0')

    return NextResponse.json({
      mp4Url,
      m3u8Url,
      coverUrl,
      duration,
    })
  } catch (error) {
    console.error('Error getting video info:', error)
    return NextResponse.json(
      { error: 'Failed to get video info' },
      { status: 500 }
    )
  }
}
