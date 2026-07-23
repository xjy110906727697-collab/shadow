import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ words: [] })
  }

  const wordBag = await prisma.userWordBag.findMany({
    where: { userId: session.user.id },
    include: {
      word: {
        include: {
          video: {
            select: {
              id: true,
              title: true,
              titleZh: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const words = wordBag.map(wb => ({
    id: wb.word.id,
    word: wb.word.word,
    meaning: wb.word.meaning,
    meaningZh: wb.word.meaningZh,
    videoId: wb.word.videoId,
    videoTitle: wb.word.video.titleZh || wb.word.video.title,
    addedAt: wb.createdAt,
  }))

  return NextResponse.json({ words })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { wordId } = await request.json()
  if (!wordId) {
    return NextResponse.json({ error: 'wordId required' }, { status: 400 })
  }

  const existing = await prisma.userWordBag.findUnique({
    where: { userId_wordId: { userId: session.user.id, wordId } },
  })

  if (existing) {
    await prisma.userWordBag.delete({ where: { id: existing.id } })
    return NextResponse.json({ added: false })
  } else {
    await prisma.userWordBag.create({
      data: { userId: session.user.id, wordId },
    })
    return NextResponse.json({ added: true })
  }
}
