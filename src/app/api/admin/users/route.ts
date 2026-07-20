import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
