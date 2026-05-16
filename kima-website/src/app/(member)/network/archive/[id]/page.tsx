import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEventType } from '@/lib/eventTypes'
import { ARCHIVE_RECORDS } from '../data'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const record = ARCHIVE_RECORDS.find((r) => r.id === id)
  return { title: record ? `${record.title} | KIMA` : '아카이브 | KIMA' }
}

export async function generateStaticParams() {
  return ARCHIVE_RECORDS.map((r) => ({ id: r.id }))
}

export default async function ArchiveDetailPage({ params }: Props) {
  const { id } = await params
  const record = ARCHIVE_RECORDS.find((r) => r.id === id)
  if (!record) notFound()

  const typeInfo = getEventType(record.type)
  const hasContent =
    record.theme || record.location || record.scheduleItems?.length ||
    record.materials?.length || record.photos?.length || record.videoUrl

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 헤더 */}
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/network/archive"
            className="inline-flex items-center gap-1 text-blue-300 text-sm hover:text-white mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            아카이브 목록으로
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-blue-300 text-sm">{record.seq}</span>
          </div>
          <h1 className="text-2xl font-bold">{record.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-200">
            <span>🗓 {record.date}</span>
            {record.location && <span>📍 {record.location}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* 주제 */}
        {record.theme && (
          <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 rounded-xl p-6">
            <p className="text-xs font-semibold text-[#C8922A] uppercase tracking-wider mb-2">주제</p>
            <p className="text-[#1B3A6B] font-semibold leading-relaxed">{record.theme}</p>
          </div>
        )}

        {/* 개요 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">개요</p>
          <p className="text-gray-700 leading-relaxed">{record.description}</p>
        </div>

        {/* 일정표 */}
        {record.scheduleItems && record.scheduleItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">일정표</p>
            <div className="space-y-3">
              {record.scheduleItems.map((item, i) => (
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
        {record.materials && record.materials.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">발표 자료</p>
            <div className="space-y-2">
              {record.materials.map((mat, i) => (
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
        {record.videoUrl && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">영상</p>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={record.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={record.title}
              />
            </div>
          </div>
        )}

        {/* 사진 */}
        {record.photos && record.photos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">사진</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {record.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${record.title} 사진 ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 자료 없음 안내 */}
        {!hasContent && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            <p className="text-3xl mb-3">📂</p>
            <p className="text-sm">세부 자료를 준비 중입니다.</p>
            <p className="text-xs mt-1">자료 요청은 사무국으로 문의해 주세요.</p>
          </div>
        )}

        {/* 문의 */}
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
