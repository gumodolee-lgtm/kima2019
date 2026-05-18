'use client'

import { parseVideoUrl } from '@/lib/videoUtils'

interface Props {
  url: string
  title?: string
  index?: number
}

export function VideoEmbed({ url, title, index }: Props) {
  const info = parseVideoUrl(url)

  if (!info) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition-colors"
      >
        <span className="text-red-600 text-lg leading-none">▶</span>
        <span className="truncate">{url}</span>
      </a>
    )
  }

  const label = title ?? (index !== undefined ? `영상 ${index + 1}` : '영상')

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-md" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={info.embedUrl}
        title={label}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  )
}
