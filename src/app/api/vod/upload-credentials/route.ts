import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createUploadVideo } from '@/lib/vod'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, fileName, fileSize } = await request.json()

    if (!title || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields: title, fileName' },
        { status: 400 }
      )
    }

    const result = await createUploadVideo({
      title,
      fileName,
      fileSize,
    })

    return NextResponse.json({
      videoId: result.body?.videoId,
      uploadAddress: result.body?.uploadAddress,
      uploadAuth: result.body?.uploadAuth,
    })
  } catch (error) {
    console.error('Error getting upload credentials:', error)
    return NextResponse.json(
      { error: 'Failed to get upload credentials' },
      { status: 500 }
    )
  }
}
