import { describe, it, expect } from 'vitest'
import { formatDate, formatPhone, isPremiumActive } from '@/lib/utils'

describe('formatDate', () => {
  it('Date 객체를 한국어 날짜 형식으로 변환한다', () => {
    const date = new Date('2025-01-15T00:00:00.000Z')
    const result = formatDate(date)
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/1/)
  })

  it('ISO 문자열을 한국어 날짜 형식으로 변환한다', () => {
    const result = formatDate('2025-06-01T00:00:00.000Z')
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/6/)
  })

  it('년·월·일 텍스트를 포함한다', () => {
    const result = formatDate(new Date('2024-03-20T00:00:00.000Z'))
    expect(result).toMatch(/년|월|일/)
  })
})

describe('formatPhone', () => {
  it('11자리 번호를 XXX-XXXX-XXXX 형식으로 변환한다', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678')
  })

  it('이미 하이픈이 포함된 번호도 올바르게 처리한다', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678')
  })

  it('02로 시작하는 10자리 번호를 02-XXXX-XXXX 형식으로 변환한다', () => {
    expect(formatPhone('0212345678')).toBe('02-1234-5678')
  })

  it('02가 아닌 10자리 번호를 XXX-XXX-XXXX 형식으로 변환한다', () => {
    expect(formatPhone('0312345678')).toBe('031-234-5678')
  })

  it('형식에 맞지 않는 번호는 원본을 반환한다', () => {
    expect(formatPhone('123')).toBe('123')
    expect(formatPhone('abc')).toBe('abc')
  })
})

describe('isPremiumActive', () => {
  it('expiresAt이 미래이면 true를 반환한다', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    expect(isPremiumActive(future)).toBe(true)
  })

  it('expiresAt이 과거이면 false를 반환한다', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24)
    expect(isPremiumActive(past)).toBe(false)
  })

  it('expiresAt이 null이면 false를 반환한다', () => {
    expect(isPremiumActive(null)).toBe(false)
  })

  it('expiresAt이 undefined이면 false를 반환한다', () => {
    expect(isPremiumActive(undefined)).toBe(false)
  })
})
