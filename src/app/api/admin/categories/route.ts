import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const type = searchParams.get('type') || ''
  const search = searchParams.get('search') || ''
  const sortField = searchParams.get('sortField') || 'sortOrder'
  const sortOrder = searchParams.get('sortOrder') || 'asc'

  const skip = (page - 1) * pageSize

  const where: any = {}

  if (type) {
    where.type = type
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameZh: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } }
    ]
  }

  const validSortFields = ['name', 'nameZh', 'slug', 'sortOrder', 'type']
  const field = validSortFields.includes(sortField) ? sortField : 'sortOrder'
  const order = sortOrder === 'ascend' ? 'asc' : 'desc'

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { [field]: order },
      skip,
      take: pageSize,
    }),
    prisma.category.count({ where })
  ])

  return NextResponse.json({
    categories,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, nameZh, slug, sortOrder, type } = body

  const category = await prisma.category.create({
    data: {
      name,
      nameZh,
      slug,
      sortOrder,
      type
    }
  })

  return NextResponse.json(category)
}
