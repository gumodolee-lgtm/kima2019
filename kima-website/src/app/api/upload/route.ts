import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

function isOfficer(role?: string) {
  return role === 'ADMIN' || role === 'OFFICER'
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!isOfficer(session?.user?.role)) {
    return NextResponse.json({ error: '임원 이상만 파일을 업로드할 수 있습니다.' }, { status: 403 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `events/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const bytes = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from('kima-media')
      .upload(filename, bytes, { contentType: file.type, upsert: false })

    if (error) {
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다.', detail: error.message },
        { status: 500 }
      )
    }

    const { data } = supabase.storage.from('kima-media').getPublicUrl(filename)
    urls.push(data.publicUrl)
  }

  return NextResponse.json({ urls })
}
