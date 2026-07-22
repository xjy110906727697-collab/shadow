import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { refreshUploadVideo } from '@/lib/vod'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Missing required field: videoId' },
        { status: 400 }
      )
    }

    const result = await refreshUploadVideo(videoId)

    return NextResponse.json({
      videoId: result.body.videoId,
      uploadAddress: result.body.uploadAddress,
      uploadAuth: result.body.uploadAuth,
    })
  } catch (error) {
    console.error('Error refreshing upload credentials:', error)
    return NextResponse.json(
      { error: 'Failed to refresh upload credentials' },
      { status: 500 }
    )
  }
}
