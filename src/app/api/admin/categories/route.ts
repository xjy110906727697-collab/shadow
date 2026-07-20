import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  return NextResponse.json(categories)
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
