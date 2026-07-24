import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const search = searchParams.get('search') || ''
  const sortField = searchParams.get('sortField') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const skip = (page - 1) * pageSize

  const where: any = {}

  if (search) {
    where.email = { contains: search, mode: 'insensitive' }
  }

  const validSortFields = ['email', 'role', 'expireAt', 'createdAt']
  const field = validSortFields.includes(sortField) ? sortField : 'createdAt'
  const order = sortOrder === 'ascend' ? 'asc' : 'desc'

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [field]: order },
      skip,
      take: pageSize,
      include: {
        inviteCode: {
          select: { code: true }
        }
      }
    }),
    prisma.user.count({ where })
  ])

  return NextResponse.json({
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role, expireAt } = body

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role || 'USER',
        expireAt: expireAt ? new Date(expireAt) : null,
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 })
  }
}
