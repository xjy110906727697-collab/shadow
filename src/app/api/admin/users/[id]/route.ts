import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { expireAt, role } = body

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      expireAt: expireAt ? new Date(expireAt) : null,
      role
    }
  })

  return NextResponse.json(user)
}
