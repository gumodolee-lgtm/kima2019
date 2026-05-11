'use client'

import { parseVideoUrl } from '@/lib/videoUtils'

interface Props {
  url: string
  title?: string
}

export function VideoEmbed({ url, title }: Props) {
  const info = parseVideoUrl(url)

  if (!info) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-xl h-64 text-sm text-gray-400">
        영상 URL을 인식할 수 없습니다.
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={info.embedUrl}
        title={title ?? '영상'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  )
}
