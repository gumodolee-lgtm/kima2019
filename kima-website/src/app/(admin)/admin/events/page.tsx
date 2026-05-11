import { prisma } from '@/lib/prisma'
import { EventForm } from '@/components/admin/EventForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { getEventType } from '@/lib/eventTypes'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '일정 관리 | KIMA 관리자' }

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { attendees: true } } },
    orderBy: { scheduledAt: 'desc' },
  })

  const now = new Date()

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B3A6B]">일정 관리</h1>
          <p className="text-sm text-gray-500 mt-1">리스닝콜·포럼 일정을 등록하고 참석 현황을 확인합니다.</p>
        </div>
      </div>

      <EventForm />

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            등록된 일정이 없습니다.
          </div>
        ) : (
          events.map((event) => {
            const isPast = event.scheduledAt < now
            return (
              <div
                key={event.id}
                className={`bg-white rounded-xl border shadow-sm p-5 ${isPast ? 'border-gray-100 opacity-70' : 'border-blue-100'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEventType(event.type).color}`}>
                        {getEventType(event.type).label}
                      </span>
                      {isPast && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">
                          종료
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    </div>

                    {event.description && (
                      <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>
                        📅 {event.scheduledAt.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {event.location && (
                        <span>📍 {event.location}</span>
                      )}
                      <span>
                        👥 참석 신청: {event._count.attendees}명
                        {event.maxAttendees && ` / ${event.maxAttendees}명`}
                      </span>
                      {event.zoomUrl && (
                        <a
                          href={event.zoomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          🎥 Zoom 링크
                        </a>
                      )}
                    </div>
                  </div>

                  <DeleteButton url={`/api/admin/events/${event.id}`} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
