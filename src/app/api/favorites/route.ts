import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [] })
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { videoId: true },
  })

  return NextResponse.json({ favorites: favorites.map(f => f.videoId) })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { videoId } = await request.json()
  if (!videoId) {
    return NextResponse.json({ error: 'videoId required' }, { status: 400 })
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return NextResponse.json({ favorited: false })
  } else {
    await prisma.favorite.create({
      data: { userId: session.user.id, videoId },
    })
    return NextResponse.json({ favorited: true })
  }
}
