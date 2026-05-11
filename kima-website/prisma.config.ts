import { defineConfig } from 'prisma/config'

export default defineConfig({
  // Supabase 연결 문자열 형식:
  // postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  // .env.local에 DATABASE_URL 설정 후 prisma db push 실행
  migrations: {
    seed: 'node --env-file=.env.local --require tsx/cjs prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
