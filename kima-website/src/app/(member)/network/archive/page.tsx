import Link from 'next/link'
import { getEventType } from '@/lib/eventTypes'
import { ARCHIVE_RECORDS } from './data'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '지난 포럼 아카이브 | KIMA' }

type Props = { searchParams: Promise<{ tab?: string }> }

export default async function NetworkArchivePage({ searchParams }: Props) {
  const { tab } = await searchParams
  const activeTab = tab === 'forum' ? 'forum' : tab === 'listening' ? 'listening' : 'all'

  const filtered = ARCHIVE_RECORDS.filter((r) => {
    if (activeTab === 'forum') return r.type === 'FORUM'
    if (activeTab === 'listening') return r.type === 'LISTENING_CALL'
    return true
  })

  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'forum', label: '포럼' },
    { key: 'listening', label: '리스닝콜' },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Archive</p>
          <h1 className="text-2xl font-bold">지난 포럼 아카이브</h1>
          <p className="mt-2 text-blue-200 text-sm">
            지난 리스닝콜·포럼의 기록을 확인하세요. 각 항목을 클릭하면 세부 자료를 볼 수 있습니다.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* 탭 */}
        <div className="flex gap-2 mb-8">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.key === 'all' ? '/network/archive' : `/network/archive?tab=${t.key}`}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === t.key
                  ? 'bg-[#1B3A6B] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* 목록 */}
        <div className="space-y-3">
          {filtered.map((record) => {
            const typeInfo = getEventType(record.type)
            return (
              <Link
                key={record.id}
                href={`/network/archive/${record.id}`}
                className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#C8922A] transition-all group"
              >
                {/* 타입 뱃지 */}
                <div className="shrink-0 pt-0.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-[#C8922A] font-bold">{record.seq}</span>
                    <span className="text-xs text-gray-400">{record.date}</span>
                    {record.location && (
                      <span className="text-xs text-gray-400">📍 {record.location}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#1B3A6B] transition-colors">
                    {record.title}
                  </h3>
                  {record.description && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                      {record.description}
                    </p>
                  )}
                </div>

                {/* 화살표 */}
                <div className="shrink-0 self-center text-gray-300 group-hover:text-[#C8922A] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 pt-8">
          더 이전 기록(1차~9차)은{' '}
          <a href="mailto:kima20191227@gmail.com" className="underline hover:text-gray-600">
            사무국으로 문의
          </a>
          해 주세요.
        </p>
      </div>
    </div>
  )
}
