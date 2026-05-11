import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '지난 포럼 아카이브 | KIMA' }

const TYPE_LABELS: Record<string, string> = {
  LISTENING_CALL: '리스닝콜',
  FORUM: '포럼',
}

export default async function NetworkArchivePage() {
  const pastEvents = await prisma.event.findMany({
    where: { scheduledAt: { lt: new Date() } },
    include: { _count: { select: { attendees: true } } },
    orderBy: { scheduledAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Archive</p>
          <h1 className="text-2xl font-bold">지난 포럼 아카이브</h1>
          <p className="mt-2 text-blue-200 text-sm">지난 리스닝콜·포럼의 발표 자료와 기록을 확인하세요.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {pastEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📂</p>
            <p>지난 일정 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 opacity-80">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.type === 'FORUM' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {TYPE_LABELS[event.type] ?? event.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {event.scheduledAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">참석 {event._count.attendees}명</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 italic">
                  발표 자료 문의: admin@kima2019.org
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
