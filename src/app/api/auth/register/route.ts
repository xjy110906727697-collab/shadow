import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().min(1, '请输入邮箱或手机号'),
  password: z.string().min(6),
  inviteCode: z.string().min(1, '请输入邀请码'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, inviteCode } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该账号已注册' },
        { status: 400 }
      )
    }

    const code = await prisma.inviteCode.findUnique({
      where: { code: inviteCode.trim().toUpperCase() }
    })

    if (!code) {
      return NextResponse.json(
        { error: '邀请码无效' },
        { status: 400 }
      )
    }

    if (code.used) {
      return NextResponse.json(
        { error: '该邀请码已被使用' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        inviteCode: {
          connect: { id: code.id }
        }
      }
    })

    await prisma.inviteCode.update({
      where: { id: code.id },
      data: { used: true }
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return NextResponse.json(
        { error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
