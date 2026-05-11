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
