import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { email, expireAt, role } = body
    const { id } = await params

    const data: any = {}
    if (expireAt !== undefined) data.expireAt = expireAt ? new Date(expireAt) : null
    if (role !== undefined) data.role = role
    if (email !== undefined) data.email = email

    const user = await prisma.user.update({
      where: { id },
      data
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 })
  }
}
