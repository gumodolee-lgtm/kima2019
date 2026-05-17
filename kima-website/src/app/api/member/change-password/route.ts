import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod/v4'

const schema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  newPassword: z
    .string()
    .min(8, '새 비밀번호는 8자 이상이어야 합니다.')
    .max(100),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: '새 비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message)
    return NextResponse.json({ error: messages[0] }, { status: 400 })
  }

  const { currentPassword, newPassword } = parsed.data

  // 현재 비밀번호 해시 조회 (user.password 우선, 없으면 account.access_token 폴백)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  let currentHash = user?.password ?? null
  if (!currentHash) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'credentials' },
      select: { access_token: true },
    })
    currentHash = account?.access_token ?? null
  }

  if (!currentHash) {
    return NextResponse.json(
      { error: '비밀번호 로그인을 사용하지 않는 계정입니다. (소셜 로그인 전용)' },
      { status: 400 }
    )
  }

  const isValid = await bcrypt.compare(currentPassword, currentHash)
  if (!isValid) {
    return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 })
  }

  if (currentPassword === newPassword) {
    return NextResponse.json({ error: '새 비밀번호가 현재 비밀번호와 같습니다.' }, { status: 400 })
  }

  const newHash = await bcrypt.hash(newPassword, 12)

  // user.password 컬럼에 저장 (있으면 업데이트, 없으면 account.access_token도 업데이트)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: newHash },
  })

  // 레거시 account.access_token도 동기화
  await prisma.account.updateMany({
    where: { userId: session.user.id, provider: 'credentials' },
    data: { access_token: newHash },
  })

  return NextResponse.json({ ok: true })
}
