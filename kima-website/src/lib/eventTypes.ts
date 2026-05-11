export const EVENT_TYPES = [
  { value: 'LISTENING_CALL',   label: '리스닝콜',     color: 'bg-blue-100 text-blue-700' },
  { value: 'FORUM',            label: '포럼',          color: 'bg-purple-100 text-purple-700' },
  { value: 'EVENT',            label: '행사',          color: 'bg-green-100 text-green-700' },
  { value: 'ZOOM_MEETING',     label: 'Zoom미팅',      color: 'bg-sky-100 text-sky-700' },
  { value: 'REGION_MEETING',   label: '지역별모임',    color: 'bg-orange-100 text-orange-700' },
  { value: 'MINISTRY_MEETING', label: '사역권별 모임', color: 'bg-teal-100 text-teal-700' },
  { value: 'OFFICER_MEETING',  label: '임원회의',      color: 'bg-red-100 text-red-700' },
  { value: 'ETC',              label: '기타',          color: 'bg-gray-100 text-gray-600' },
] as const

export type EventTypeValue = (typeof EVENT_TYPES)[number]['value']

export function getEventType(value: string) {
  return EVENT_TYPES.find((t) => t.value === value)
    ?? { value, label: value, color: 'bg-gray-100 text-gray-600' }
}
