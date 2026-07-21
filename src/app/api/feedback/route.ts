import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { type, content, contact } = await request.json()

    if (!type || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const feedback = await prisma.feedback.create({
      data: { type, content, contact: contact || '' },
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
