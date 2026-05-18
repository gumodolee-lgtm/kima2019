import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEventType } from '@/lib/eventTypes'
import { prisma } from '@/lib/prisma'
import { ARCHIVE_RECORDS } from '../data'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const db = await prisma.forumArchive.findUnique({ where: { id }, select: { title: true } }).catch(() => null)
  if (db) return { title: `${db.title} | KIMA` }
  const rec = ARCHIVE_RECORDS.find((r) => r.id === id)
  return { title: rec ? `${rec.title} | KIMA` : '아카이브 | KIMA' }
}

export default async function ArchiveDetailPage({ params }: Props) {
  const { id } = await params

  // Try DB first
  const dbRecord = await prisma.forumArchive.findUnique({
    where: { id },
    include: {
      schedules: { orderBy: { order: 'asc' } },
      materials: { orderBy: { order: 'asc' } },
    },
  }).catch(() => null)

  if (dbRecord) {
    if (!dbRecord.isPublished) notFound()

    const typeInfo = getEventType(dbRecord.type)
    const hasContent =
      !!(dbRecord.theme || dbRecord.location || dbRecord.schedules.length > 0 ||
      dbRecord.materials.length > 0 || dbRecord.photos.length > 0 || dbRecord.videoUrls.length > 0)

    return (
      <ArchiveDetailView
        recordType={dbRecord.type}
        typeInfo={typeInfo}
        seq={dbRecord.seq}
        title={dbRecord.title}
        date={dbRecord.date}
        location={dbRecord.location ?? undefined}
        theme={dbRecord.theme ?? undefined}
        description={dbRecord.description ?? undefined}
        scheduleItems={dbRecord.schedules.map((s) => ({ time: s.time, title: s.title, speaker: s.speaker ?? undefined }))}
        materials={dbRecord.materials.map((m) => ({ title: m.title, type: m.fileType, url: m.url }))}
        photos={dbRecord.photos}
        videoUrls={dbRecord.videoUrls}
        hasContent={hasContent}
      />
    )
  }

  // Fallback to static data (legacy IDs like 'forum-2025', 'lc-16')
  const record = ARCHIVE_RECORDS.find((r) => r.id === id)
  if (!record) notFound()

  const typeInfo = getEventType(record.type)
  const hasContent =
    !!(record.theme || record.location || (record.scheduleItems?.length ?? 0) > 0 ||
    (record.materials?.length ?? 0) > 0 || (record.photos?.length ?? 0) > 0 || record.videoUrl)

  return (
    <ArchiveDetailView
      recordType={record.type as 'FORUM' | 'LISTENING_CALL'}
      typeInfo={typeInfo}
      seq={record.seq}
      title={record.title}
      date={record.date}
      location={record.location}
      theme={record.theme}
      description={record.description}
      scheduleItems={record.scheduleItems}
      materials={record.materials}
      photos={record.photos}
      videoUrls={record.videoUrl ? [record.videoUrl] : []}
      hasContent={hasContent}
    />
  )
}

interface ViewProps {
  recordType: 'FORUM' | 'LISTENING_CALL'
  typeInfo: { label: string; color: string }
  seq: string
  title: string
  date: string
  location?: string
  theme?: string
  description?: string
  scheduleItems?: { time: string; title: string; speaker?: string }[]
  materials?: { title: string; type: string; url?: string }[]
  photos?: string[]
  videoUrls?: string[]
  hasContent: boolean
}

function ArchiveDetailView({
  recordType, typeInfo, seq, title, date, location, theme, description,
  scheduleItems, materials, photos, videoUrls, hasContent,
}: ViewProps) {
  const backHref = recordType === 'LISTENING_CALL' ? '/network/listening' : '/network/forum'
  const backLabel = recordType === 'LISTENING_CALL' ? '리스닝콜 목록으로' : '포럼 목록으로'

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 헤더 */}
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-blue-300 text-sm hover:text-white mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-blue-300 text-sm">{seq}</span>
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-200">
            <span>🗓 {date}</span>
            {location && <span>📍 {location}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* 주제 */}
        {theme && (
          <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 rounded-xl p-6">
            <p className="text-xs font-semibold text-[#C8922A] uppercase tracking-wider mb-2">주제</p>
            <p className="text-[#1B3A6B] font-semibold leading-relaxed">{theme}</p>
          </div>
        )}

        {/* 개요 */}
        {description && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">개요</p>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
        )}

        {/* 일정표 */}
        {scheduleItems && scheduleItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">일정표</p>
            <div className="space-y-3">
              {scheduleItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="shrink-0 text-xs text-[#C8922A] font-semibold w-20 pt-0.5">{item.time}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    {item.speaker && <p className="text-xs text-gray-400 mt-0.5">{item.speaker}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 발표자료 */}
        {materials && materials.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">발표 자료</p>
            <div className="space-y-2">
              {materials.map((mat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    mat.type === 'PDF' ? 'bg-red-50 text-red-600' :
                    mat.type === 'PPT' ? 'bg-orange-50 text-orange-600' :
                    mat.type === 'VIDEO' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {mat.type}
                  </span>
                  {mat.url ? (
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1B3A6B] hover:underline"
                    >
                      {mat.title}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">{mat.title}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 영상 */}
        {videoUrls && videoUrls.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">영상</p>
            <div className="space-y-4">
              {videoUrls.map((url, i) => (
                <div key={i} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={url}
                    className="w-full h-full"
                    allowFullScreen
                    title={`영상 ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 사진 */}
        {photos && photos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">사진</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`사진 ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 자료 없음 */}
        {!hasContent && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            <p className="text-3xl mb-3">📂</p>
            <p className="text-sm">세부 자료를 준비 중입니다.</p>
            <p className="text-xs mt-1">자료 요청은 사무국으로 문의해 주세요.</p>
          </div>
        )}

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-gray-400">
            자료 문의:{' '}
            <a href="mailto:kima20191227@gmail.com" className="underline hover:text-gray-600">
              kima20191227@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
