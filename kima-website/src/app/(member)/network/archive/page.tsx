import { prisma } from '@/lib/prisma'
import { getEventType } from '@/lib/eventTypes'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '지난 포럼 아카이브 | KIMA' }

const TYPE_LABELS: Record<string, string> = {
  LISTENING_CALL: '리스닝콜',
  FORUM: '포럼',
}

const STATIC_RECORDS = [
  {
    id: 'lc-16',
    seq: '16차',
    type: 'LISTENING_CALL',
    date: '2025년 9월',
    title: '제16차 전국 이주민 사역자 리스닝콜',
    description: '하반기 사역 나눔 및 4기 준비 논의',
  },
  {
    id: 'lc-15',
    seq: '15차',
    type: 'LISTENING_CALL',
    date: '2025년 6월',
    title: '제15차 전국 이주민 사역자 리스닝콜',
    description: '지역별·언어권별 사역 보고 및 협력 방안 논의',
  },
  {
    id: 'lc-14',
    seq: '14차',
    type: 'LISTENING_CALL',
    date: '2025년 3월',
    title: '제14차 전국 이주민 사역자 리스닝콜',
    description: '3기 연차총회 연계 — 연간 사역 계획 공유',
  },
  {
    id: 'forum-2024',
    seq: '포럼',
    type: 'FORUM',
    date: '2024년 11월',
    title: '2024 KIMA 이주민 선교 포럼',
    description: '전국 사역자 연합 포럼 — 이주민 선교 현황 및 협력 전략 발표',
  },
  {
    id: 'lc-13',
    seq: '13차',
    type: 'LISTENING_CALL',
    date: '2024년 9월',
    title: '제13차 전국 이주민 사역자 리스닝콜',
    description: '언어권별 현장 보고 및 자료 공유',
  },
  {
    id: 'lc-12',
    seq: '12차',
    type: 'LISTENING_CALL',
    date: '2024년 6월',
    title: '제12차 전국 이주민 사역자 리스닝콜',
    description: '이주민 법률·복지 정보 공유 및 사역 나눔',
  },
  {
    id: 'lc-11',
    seq: '11차',
    type: 'LISTENING_CALL',
    date: '2024년 3월',
    title: '제11차 전국 이주민 사역자 리스닝콜',
    description: '3기 총회 연계 — 신임 임원단 소개 및 3기 사역 방향 논의',
  },
  {
    id: 'lc-10',
    seq: '10차',
    type: 'LISTENING_CALL',
    date: '2023년 12월',
    title: '제10차 전국 이주민 사역자 리스닝콜',
    description: '연말 사역 결산 및 2024년 사역 방향 논의',
  },
]

export default async function NetworkArchivePage() {
  const dbEvents = await prisma.event.findMany({
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
          <p className="mt-2 text-blue-200 text-sm">지난 리스닝콜·포럼의 기록을 확인하세요. 자료 요청은 사무국으로 문의해 주세요.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* DB에 등록된 이벤트 (있을 경우) */}
        {dbEvents.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-500 mb-4">등록된 일정 기록</h2>
            <div className="space-y-4">
              {dbEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
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
                    발표 자료 문의: kima20191227@gmail.com
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 정적 아카이브 기록 */}
        <section>
          <h2 className="text-base font-semibold text-gray-500 mb-4">리스닝콜 · 포럼 기록</h2>
          <div className="space-y-4">
            {STATIC_RECORDS.map((record) => (
              <div key={record.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      record.type === 'FORUM'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {TYPE_LABELS[record.type]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-[#C8922A] font-bold">{record.seq}</span>
                      <span className="text-xs text-gray-400">{record.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">{record.title}</h3>
                    {record.description && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{record.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2 italic">
                      자료 문의: kima20191227@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 pb-4">
          더 이전 기록(1차~9차)은 사무국으로 문의해 주세요.
        </p>
      </div>
    </div>
  )
}
