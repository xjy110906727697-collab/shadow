import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { videos: true }
  })

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  return NextResponse.json(category)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { name, nameZh, slug, sortOrder } = body

  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      name,
      nameZh,
      slug,
      sortOrder
    }
  })

  return NextResponse.json(category)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.category.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
