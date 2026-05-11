/**
 * Cloudflare Workers Cron Handler
 *
 * 배포: wrangler deploy src/workers/cron.ts --name kima-cron
 * 트리거: wrangler.toml의 cron 설정 (매일 UTC 00:00 = KST 09:00)
 *
 * 이 워커는 kima2019.org의 크론 API 엔드포인트를 호출합니다.
 * CRON_SECRET 환경변수를 Cloudflare 대시보드에서 설정해야 합니다.
 */

interface Env {
  CRON_SECRET: string
  SITE_URL: string
}

const CRON_JOBS = [
  '/api/cron/expiring-members',
  '/api/cron/event-reminders',
] as const

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const siteUrl = env.SITE_URL ?? 'https://kima2019.org'
    const secret = env.CRON_SECRET

    const results = await Promise.allSettled(
      CRON_JOBS.map((path) =>
        fetch(`${siteUrl}${path}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
          },
        }).then(async (res) => ({
          path,
          status: res.status,
          body: await res.json(),
        }))
      )
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        console.log(`[cron] ${result.value.path} → ${result.value.status}`, result.value.body)
      } else {
        console.error(`[cron] failed:`, result.reason)
      }
    }

    void ctx
  },
} satisfies ExportedHandler<Env>
