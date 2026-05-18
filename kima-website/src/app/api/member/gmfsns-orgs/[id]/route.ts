import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// 서비스 롤 클라이언트 (RLS 우회, 서버 전용)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const orgId = parseInt(id, 10)
  if (isNaN(orgId)) {
    return NextResponse.json({ error: '잘못된 단체 ID입니다.' }, { status: 400 })
  }

  const body = await req.json()
  const { type, targets, languages, address, phone, email, website, introLines, contactItems } = body

  const supabase = getServiceClient()
  const { error } = await supabase.from('gmfsns_org_edits').upsert(
    {
      org_id: orgId,
      type: type ?? null,
      targets: targets ?? [],
      languages: languages ?? [],
      address: address ?? null,
      phone: phone ?? null,
      email: email ?? null,
      website: website ?? null,
      intro_lines: introLines ?? [],
      contact_items: contactItems ?? [],
      edited_by_id: session.user.id,
      edited_by_name: session.user.name ?? '',
      edited_at: new Date().toISOString(),
    },
    { onConflict: 'org_id' },
  )

  if (error) {
    console.error('gmfsns_org_edits upsert error:', error)
    return NextResponse.json({ error: '저장에 실패했습니다.', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const orgId = parseInt(id, 10)

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('gmfsns_org_edits')
    .select('*')
    .eq('org_id', orgId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? null })
}
