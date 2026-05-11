import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '일정 & 참석 신청 | KIMA 리스닝콜' }

const TYPE_LABELS: Record<string, string> = {
  LISTENING_CALL: '리스닝콜',
  FORUM: '포럼',
}

export default async function NetworkSchedulePage() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  const events = await prisma.event.findMany({
    where: { scheduledAt: { gte: new Date() } },
    include: { _count: { select: { attendees: true } } },
    orderBy: { scheduledAt: 'asc' },
  })

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Schedule</p>
          <h1 className="text-2xl font-bold">예정 일정 & 참석 신청</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {events.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p>현재 예정된 일정이 없습니다.</p>
            <p className="text-sm mt-1">일정이 등록되면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {events.map((event) => {
              const dateStr = event.scheduledAt.toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
                weekday: 'short', hour: '2-digit', minute: '2-digit',
              })
              const isFull = event.maxAttendees != null && event._count.attendees >= event.maxAttendees

              return (
                <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          event.type === 'FORUM' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {TYPE_LABELS[event.type] ?? event.type}
                        </span>
                        {isFull && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                            마감
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-500 text-sm mt-1">{event.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 {dateStr}</span>
                        <span>
                          👥 신청 {event._count.attendees}명
                          {event.maxAttendees && ` / 정원 ${event.maxAttendees}명`}
                        </span>
                        {isLoggedIn && event.zoomUrl && (
                          <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer"
                            className="text-blue-500 hover:underline">
                            🎥 Zoom 링크
                          </a>
                        )}
                      </div>
                    </div>

                    {!isFull ? (
                      <a
                        href={`/network/schedule/${event.id}/attend`}
                        className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] transition-colors"
                      >
                        참석 신청
                      </a>
                    ) : (
                      <span className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
                        마감됨
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isLoggedIn && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Zoom 링크는 로그인 후 확인 가능합니다.{' '}
            <a href="/auth/login" className="text-[#1B3A6B] hover:underline">로그인하기 →</a>
          </p>
        )}
      </div>
    </div>
  )
}
