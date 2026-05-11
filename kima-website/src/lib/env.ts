import { envSchema } from '@/schemas/env.schema'

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  throw new Error(`환경변수 설정 오류:\n${missing}\n\n.env.local 파일을 확인해주세요.`)
}

export const env = parsed.data
