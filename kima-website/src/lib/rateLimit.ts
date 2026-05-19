/**
 * 메모리 기반 Rate Limiter (로컬 개발 / 단일 인스턴스 전용)
 *
 * ⚠️ Cloudflare Pages·Vercel 서버리스 환경에서는 인스턴스가 요청마다 분산되므로
 *    이 제한은 인스턴스 단위로만 작동합니다. 완전한 보호를 위해
 *    Cloudflare WAF 규칙(Rate Limiting) 또는 Upstash Redis 를 사용하세요.
 *
 * 현재 보호 수준:
 *  - 1차 방어: Cloudflare WAF Rate Limiting (권장 설정)
 *  - 2차 방어: 이 in-memory limiter (단일 인스턴스 내 폭발적 요청 제한)
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// 만료된 항목 주기적 정리 (메모리 누수 방지)
let lastCleanup = Date.now()
function maybeCleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) store.delete(key)
  }
}

interface RateLimitOptions {
  limit: number
  windowMs: number
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  maybeCleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
  // Cloudflare는 CF-Connecting-IP 헤더를 우선 사용
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}
