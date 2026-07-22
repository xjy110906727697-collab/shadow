import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createUploadVideo } from '@/lib/vod'
import { prisma } from '@/lib/prisma'
import OSS from 'ali-oss'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file.name

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadResult = await createUploadVideo({
      title,
      fileName: file.name,
      fileSize: file.size,
    })

    const { videoId, uploadAddress, uploadAuth } = uploadResult.body

    const address = JSON.parse(Buffer.from(uploadAddress, 'base64').toString())
    const auth = JSON.parse(Buffer.from(uploadAuth, 'base64').toString())

    const client = new OSS({
      region: address.Region,
      accessKeyId: auth.AccessKeyId,
      accessKeySecret: auth.AccessKeySecret,
      stsToken: auth.SecurityToken,
      bucket: address.Bucket,
    })

    const buffer = Buffer.from(await file.arrayBuffer())
    await client.put(address.FileName, buffer)

    const video = await prisma.video.create({
      data: {
        title,
        titleZh: title,
        coverUrl: '',
        videoUrl: '',
        duration: 0,
        vodVideoId: videoId,
        published: false,
      }
    })

    return NextResponse.json({ videoId, dbId: video.id })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
