import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const role = session?.user?.role
    if (role !== 'ADMIN' && role !== 'OFFICER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'misc'

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    const MAX_MB = 50
    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `파일 크기는 ${MAX_MB}MB 이하여야 합니다.` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const safeName = file.name
      .replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
      .slice(0, 80)
    const timestamp = Date.now()
    const path = `${folder}/${timestamp}-${safeName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('forum-files')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload/forum] Supabase error:', uploadError)
      return NextResponse.json({ error: '업로드 실패: ' + uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('forum-files')
      .getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[upload/forum]', err)
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
