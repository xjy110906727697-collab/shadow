import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; wordId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, wordId } = await params
    const { word, meaning, meaningZh, entryId, startTime } = await request.json()

    const existingWord = await prisma.videoWord.findFirst({
      where: { id: wordId, videoId: id },
    })

    if (!existingWord) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      )
    }

    const videoWord = await prisma.videoWord.update({
      where: { id: wordId },
      data: {
        word: word || existingWord.word,
        meaning: meaning || existingWord.meaning,
        meaningZh: meaningZh || existingWord.meaningZh,
        entryId: entryId !== undefined ? entryId : existingWord.entryId,
        startTime: startTime !== undefined ? startTime : existingWord.startTime,
      },
    })

    return NextResponse.json({ word: videoWord })
  } catch (error) {
    console.error('Error updating word:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update word' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; wordId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, wordId } = await params

    const existingWord = await prisma.videoWord.findFirst({
      where: { id: wordId, videoId: id },
    })

    if (!existingWord) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      )
    }

    await prisma.videoWord.delete({
      where: { id: wordId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting word:', error)
    return NextResponse.json(
      { error: 'Failed to delete word' },
      { status: 500 }
    )
  }
}
