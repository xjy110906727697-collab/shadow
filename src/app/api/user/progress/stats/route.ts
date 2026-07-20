import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Get total published videos count
    const totalVideos = await prisma.video.count({
      where: { published: true }
    })

    // If user is not logged in, learned/unlearned are 0
    if (!session?.user?.id) {
      return NextResponse.json({
        totalVideos,
        learnedVideos: 0,
        unlearnedVideos: totalVideos,
      })
    }

    // Count videos the user has completed
    const learnedVideos = await prisma.userVideoProgress.count({
      where: {
        userId: session.user.id,
        completed: true,
        video: { published: true }
      }
    })

    return NextResponse.json({
      totalVideos,
      learnedVideos,
      unlearnedVideos: totalVideos - learnedVideos,
    })
  } catch (error) {
    console.error('Error fetching progress stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress stats' },
      { status: 500 }
    )
  }
}
