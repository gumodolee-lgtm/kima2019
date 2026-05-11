import Link from 'next/link'
import Image from 'next/image'
import { parseVideoUrl } from '@/lib/videoUtils'

interface StoryCardProps {
  id: string
  title: string
  content: string
  type: 'TEXT' | 'VIDEO'
  videoUrl?: string | null
  thumbnail?: string | null
  authorName?: string | null
  createdAt: Date | string
}

export function StoryCard({ id, title, content, type, videoUrl, thumbnail, authorName, createdAt }: StoryCardProps) {
  const date = new Date(createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const preview = content.replace(/\n/g, ' ').slice(0, 120)

  const ytThumb = type === 'VIDEO' && videoUrl ? parseVideoUrl(videoUrl)?.thumbnailUrl : null
  const coverImage = thumbnail || ytThumb

  return (
    <Link href={`/story/${id}`} className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all overflow-hidden">
      {/* 썸네일 */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#1B3A6B]/10 to-[#C8922A]/10">
            <span className="text-4xl">{type === 'VIDEO' ? '🎬' : '📄'}</span>
          </div>
        )}
        {/* 유형 뱃지 */}
        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
          type === 'VIDEO'
            ? 'bg-red-500 text-white'
            : 'bg-[#1B3A6B] text-white'
        }`}>
          {type === 'VIDEO' ? '▶ 영상' : '📝 일반'}
        </span>
        {/* 영상 재생 오버레이 */}
        {type === 'VIDEO' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-[#1B3A6B] ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 내용 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[#1B3A6B] transition-colors mb-2">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {preview}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{authorName ?? 'KIMA'}</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  )
}
