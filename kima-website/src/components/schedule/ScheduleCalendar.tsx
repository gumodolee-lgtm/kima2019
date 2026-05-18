'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

export interface CalendarEvent {
  id: string
  title: string
  type: string
  scheduledAt: string
  description: string | null
  location: string | null
  zoomUrl: string | null
  maxAttendees: number | null
  attendeeCount: number
}

interface Props {
  events: CalendarEvent[]
  isLoggedIn: boolean
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const TYPE_STYLES: Record<string, { label: string; dot: string; badge: string }> = {
  LISTENING_CALL: { label: '리스닝콜', dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  FORUM:          { label: '포럼',     dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
  ZOOM_MEETING:   { label: '줌 미팅',  dot: 'bg-teal-500',   badge: 'bg-teal-100 text-teal-700' },
}

function typeInfo(type: string) {
  return TYPE_STYLES[type] ?? { label: type, dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' }
}

function formatDate(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString('ko-KR', opts)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}

export function ScheduleCalendar({ events, isLoggedIn }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Build calendar grid for current view month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startOffset = firstDay.getDay() // 0=Sun

    const days: (Date | null)[] = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(viewYear, viewMonth, d))
    }
    // Pad to complete last week
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [viewYear, viewMonth])

  // Map: "YYYY-MM-DD" → events[]
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const d = new Date(ev.scheduledAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
    }
    return map
  }, [events])

  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  // Upcoming events list — if a day is selected show that day, otherwise show all upcoming
  const listEvents = useMemo(() => {
    if (selectedDate) {
      return (eventsByDay.get(dayKey(selectedDate)) ?? []).sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
    }
    // All events sorted by date ascending (upcoming first)
    return [...events].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
  }, [selectedDate, eventsByDay, events])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
    setSelectedDate(null)
  }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(null)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── 왼쪽: 캘린더 ── */}
      <div className="lg:w-[420px] shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#1B3A6B] text-white">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="이전 달"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <p className="font-bold text-base">
                {viewYear}년 {viewMonth + 1}월
              </p>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="다음 달"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 오늘 버튼 */}
          <div className="px-5 py-2 border-b border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={goToday}
              className="text-xs text-[#1B3A6B] hover:underline"
            >
              오늘로
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`text-center text-xs font-semibold py-2 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="aspect-square border-b border-r border-gray-50" />
              }

              const key = dayKey(day)
              const dayEvents = eventsByDay.get(key) ?? []
              const isToday = isSameDay(day, today)
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
              const isSun = day.getDay() === 0
              const isSat = day.getDay() === 6
              const isOtherMonth = day.getMonth() !== viewMonth

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`relative flex flex-col items-center justify-start pt-1.5 pb-1 min-h-[52px] border-b border-r border-gray-50 transition-colors text-left
                    ${isSelected ? 'bg-[#1B3A6B]/8' : 'hover:bg-gray-50'}
                    ${isOtherMonth ? 'opacity-30' : ''}
                  `}
                >
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-0.5
                      ${isToday ? 'bg-[#C8922A] text-white font-bold' : ''}
                      ${isSelected && !isToday ? 'bg-[#1B3A6B] text-white' : ''}
                      ${!isToday && !isSelected && isSun ? 'text-red-400' : ''}
                      ${!isToday && !isSelected && isSat ? 'text-blue-400' : ''}
                      ${!isToday && !isSelected && !isSun && !isSat ? 'text-gray-700' : ''}
                    `}
                  >
                    {day.getDate()}
                  </span>
                  {/* Event dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center px-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${typeInfo(ev.type).dot}`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-gray-400">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* 범례 */}
          <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-3">
            {Object.entries(TYPE_STYLES).map(([, { label, dot }]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 오른쪽: 이벤트 리스트 ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            {selectedDate
              ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 일정`
              : '다가오는 일정'}
          </h2>
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
            >
              전체 보기
            </button>
          )}
        </div>

        {listEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm">
              {selectedDate ? '이 날은 예정된 일정이 없습니다.' : '현재 예정된 일정이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listEvents.map((event) => {
              const info = typeInfo(event.type)
              const isFull = event.maxAttendees != null && event.attendeeCount >= event.maxAttendees
              const isPast = new Date(event.scheduledAt) < today

              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-xl border shadow-sm p-5 transition-colors ${
                    isPast ? 'border-gray-100 opacity-60' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${info.badge}`}>
                          {info.label}
                        </span>
                        {isFull && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                            마감
                          </span>
                        )}
                        {isPast && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                            종료
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-gray-900">{event.title}</p>
                      {event.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>
                          📅 {formatDate(event.scheduledAt, { month: 'long', day: 'numeric', weekday: 'short' })} {formatTime(event.scheduledAt)}
                        </span>
                        {event.location && <span>📍 {event.location}</span>}
                        <span>
                          👥 {event.attendeeCount}명
                          {event.maxAttendees ? ` / 정원 ${event.maxAttendees}명` : ''}
                        </span>
                        {isLoggedIn && event.zoomUrl && (
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

                    {!isPast && (
                      !isFull ? (
                        <Link
                          href={`/network/schedule/${event.id}/attend`}
                          className="shrink-0 px-4 py-2 rounded-xl bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] transition-colors"
                        >
                          참석 신청
                        </Link>
                      ) : (
                        <span className="shrink-0 px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium">
                          마감됨
                        </span>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isLoggedIn && (
          <p className="text-center text-sm text-gray-400 mt-6">
            Zoom 링크는 로그인 후 확인 가능합니다.{' '}
            <a href="/auth/login" className="text-[#1B3A6B] hover:underline">로그인하기 →</a>
          </p>
        )}
      </div>
    </div>
  )
}
