import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany()
    const result: Record<string, string> = {}
    settings.forEach(s => { result[s.key] = s.value })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { qrCodeUrl } = body

    await prisma.siteSetting.upsert({
      where: { key: 'wechat-qrcode' },
      update: { value: qrCodeUrl },
      create: { key: 'wechat-qrcode', value: qrCodeUrl }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
