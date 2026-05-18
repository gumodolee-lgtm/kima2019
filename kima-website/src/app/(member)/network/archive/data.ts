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

export const ARCHIVE_RECORDS: ArchiveRecord[] = []
