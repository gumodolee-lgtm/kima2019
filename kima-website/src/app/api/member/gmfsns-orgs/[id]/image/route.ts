import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'org-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(
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

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 })
  }

  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg',
    'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  }
  const ext = mimeToExt[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'JPG, PNG, WEBP, GIF만 업로드 가능합니다.' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filePath = `orgs/${orgId}.${ext}`

  const supabase = getServiceClient()

  // 기존 파일 삭제 (다른 확장자일 수 있으므로)
  await supabase.storage.from(BUCKET).remove([
    `orgs/${orgId}.jpg`, `orgs/${orgId}.jpeg`,
    `orgs/${orgId}.png`, `orgs/${orgId}.webp`, `orgs/${orgId}.gif`,
  ])

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: '업로드에 실패했습니다.', detail: uploadError.message }, { status: 500 })
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  const imageUrl = publicData.publicUrl

  // gmfsns_org_edits 테이블에 image_url 저장
  const { error: dbError } = await supabase.from('gmfsns_org_edits').upsert(
    {
      org_id: orgId,
      image_url: imageUrl,
      edited_by_id: session.user.id,
      edited_by_name: session.user.name ?? '',
      edited_at: new Date().toISOString(),
    },
    { onConflict: 'org_id' },
  )

  if (dbError) {
    console.error('DB upsert error:', dbError)
    return NextResponse.json({ error: 'DB 저장 실패', detail: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, imageUrl })
}
