/**
 * 서버리스/엣지 환경에서 메모리 공유가 불가능하므로
 * 이 rate limiter는 단일 인스턴스(로컬 개발·단일 서버)에서만 완전히 동작합니다.
 * 프로덕션 규모에서는 Upstash Redis 등 외부 스토어로 교체를 권장합니다.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  limit: number
  windowMs: number
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
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
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}
