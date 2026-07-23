import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const words = await prisma.videoWord.findMany({
      where: { videoId: id },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json({ words })
  } catch (error) {
    console.error('Error fetching words:', error)
    return NextResponse.json(
      { error: 'Failed to fetch words' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { word, meaning, meaningZh, entryId, startTime } = await request.json()

    if (!word || !meaning || !meaningZh) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existing = await prisma.videoWord.findUnique({
      where: { videoId_word: { videoId: id, word } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Word already exists for this video' },
        { status: 400 }
      )
    }

    const videoWord = await prisma.videoWord.create({
      data: {
        videoId: id,
        word,
        meaning,
        meaningZh,
        entryId: entryId || null,
        startTime: startTime || null,
      },
    })

    return NextResponse.json({ word: videoWord })
  } catch (error) {
    console.error('Error creating word:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create word' },
      { status: 500 }
    )
  }
}
