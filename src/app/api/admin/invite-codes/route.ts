import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function generateCode(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    const where: any = {}
    if (filter === 'available') {
      where.used = false
    } else if (filter === 'used') {
      where.used = true
    }

    const codes = await prisma.inviteCode.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Failed to fetch invite codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { count = 1 } = await request.json().catch(() => ({ count: 1 }))

    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      let code = generateCode()
      while (await prisma.inviteCode.findUnique({ where: { code } })) {
        code = generateCode()
      }
      const inviteCode = await prisma.inviteCode.create({
        data: { code }
      })
      codes.push(inviteCode.code)
    }

    return NextResponse.json({ codes }, { status: 201 })
  } catch (error) {
    console.error('Failed to generate invite codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
