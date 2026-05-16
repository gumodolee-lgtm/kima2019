export type ScheduleItem = { time: string; title: string; speaker?: string }
export type Material = { title: string; type: 'PDF' | 'PPT' | 'VIDEO' | 'LINK'; url?: string }

export type ArchiveRecord = {
  id: string
  seq: string
  type: 'LISTENING_CALL' | 'FORUM'
  date: string
  title: string
  description: string
  location?: string
  theme?: string
  scheduleItems?: ScheduleItem[]
  materials?: Material[]
  photos?: string[]
  videoUrl?: string
}

export const ARCHIVE_RECORDS: ArchiveRecord[] = [
  {
    id: 'forum-2025',
    seq: '4회 포럼',
    type: 'FORUM',
    date: '2025년 12월 8~10일',
    title: '제4회 KIMA 이주민 선교 포럼',
    description: '전국 이주민 사역자 연합 포럼 — 협력과 네트워크를 통한 한국교회 이주민선교 강화',
    location: '사랑교회 안성수양관',
    theme: '"Together We Walk On" — 협력과 네트워크를 통한 한국교회 이주민선교 강화',
  },
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
    seq: '3회 포럼',
    type: 'FORUM',
    date: '2024년 12월 9~11일',
    title: '제3회 KIMA 이주민 선교 포럼',
    description: '전국 사역자 연합 포럼 — 이주민 선교 현황 및 협력 전략',
    location: '사랑교회 안성수양관',
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
