import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    if (digits.startsWith('02')) {
      return `02-${digits.slice(2, 6)}-${digits.slice(6)}`
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function isPremiumActive(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false
  return expiresAt > new Date()
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'video/mp4':  'mp4',
  'video/quicktime': 'mov',
}

export function safeStorageKey(file: { name: string; type: string }, folder: string): string {
  const ext = MIME_TO_EXT[file.type]
    ?? file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toLowerCase()
    ?? 'bin'
  const base = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 60)
  return `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}.${ext}`
}
