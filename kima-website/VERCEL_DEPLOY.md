# Vercel 배포 가이드

## 1단계: Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com) 로그인
2. **Add New → Project** 클릭
3. GitHub 저장소 `kima20191227/kima2019` 선택
4. **Framework Preset**: Next.js (자동 감지)
5. **Root Directory**: `kima-website` 로 변경 ← 중요!
6. **Build Command**: `prisma generate && next build` (package.json에 이미 설정됨)
7. **Output Directory**: `.next` (기본값)

---

## 2단계: 환경변수 설정

Vercel 대시보드 → Settings → Environment Variables에 아래 값을 입력합니다.

### 필수 (없으면 서비스 불가)

| 변수명 | 값 | 비고 |
|--------|----|------|
| `DATABASE_URL` | `postgresql://postgres.zchqhqaluahakaoiiway:...@aws-1-ap-south-1.pooler.supabase.com:5432/postgres` | .env.local에서 복사 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zchqhqaluahakaoiiway.supabase.co` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | .env.local에서 복사 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | .env.local에서 복사 |
| `NEXTAUTH_URL` | `https://kima2019.org` | 도메인 확정 후 입력 |
| `NEXTAUTH_SECRET` | `6yJriD8V3q4v3QBs6ca5E6SQSEScy6RDd/BFuhriziE=` | .env.local에서 복사 |
| `NEXT_PUBLIC_SITE_URL` | `https://kima2019.org` | |

### 이메일 자동화 (없으면 이메일만 미전송)

| 변수명 | 값 |
|--------|----|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `kima20191227@gmail.com` |
| `SMTP_PASSWORD` | Gmail 앱 비밀번호 (16자리) |
| `ADMIN_EMAIL` | `kima20191227@gmail.com` |

### 크론 보안 (설정 권장)

| 변수명 | 값 |
|--------|----|
| `CRON_SECRET` | 임의 랜덤 문자열 (예: `openssl rand -base64 32` 결과) |

### 선택 (없어도 다른 기능 정상 동작)

| 변수명 | 값 |
|--------|----|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 |

---

## 3단계: 배포 실행

환경변수 입력 후 **Deploy** 버튼 클릭.
배포 완료 시 `*.vercel.app` 도메인으로 임시 접속 가능.

---

## 4단계: 도메인 연결 (kima2019.org)

### Vercel 측 설정
1. Vercel 대시보드 → Domains → **Add Domain**
2. `kima2019.org` 입력
3. Vercel이 제시하는 DNS 레코드 확인

### 가비아 측 설정 (2가지 방법 중 선택)

**방법 A: Vercel DNS 레코드 추가 (네임서버 유지)**
- 가비아 DNS 관리 → A 레코드 추가:
  - 호스트: `@` → IP: `76.76.21.21`
- CNAME 레코드 추가:
  - 호스트: `www` → 값: `cname.vercel-dns.com`

**방법 B: Cloudflare 네임서버 위임 후 Vercel 연결 (CDN+보안 강화)**
- Cloudflare에 사이트 추가 → 네임서버 2개 확인
- 가비아 네임서버를 Cloudflare로 변경
- Cloudflare DNS에 CNAME `@` → `cname.vercel-dns.com` 추가

---

## 5단계: Supabase 허용 도메인 추가

Supabase 대시보드 → Authentication → URL Configuration:
- **Site URL**: `https://kima2019.org`
- **Redirect URLs**: `https://kima2019.org/api/auth/callback/*`

---

## 6단계: Gmail 앱 비밀번호 발급 (이메일 활성화)

1. Google 계정 → 보안 → 2단계 인증 활성화
2. **앱 비밀번호** → 앱: 메일, 기기: Windows → 생성
3. 16자리 비밀번호를 `SMTP_PASSWORD` 환경변수에 입력

---

## 크론 동작 확인

배포 완료 후 Vercel 대시보드 → Functions → Cron Jobs에서:
- `/api/cron/expiring-members` — 매일 UTC 00:00 (KST 09:00)
- `/api/cron/event-reminders` — 매일 UTC 00:00 (KST 09:00)

> Vercel Hobby 플랜: 1일 1회 크론 가능 / Pro 플랜: 분 단위 스케줄 가능

---

## 배포 완료 체크리스트

- [ ] `https://kima2019.org` 접속 (HTTPS 자물쇠)
- [ ] `https://www.kima2019.org` → `https://kima2019.org` 리디렉트
- [ ] `/api/health` → `{ status: "ok", db: "connected" }` 응답
- [ ] 회원가입 → 환영 이메일 수신
- [ ] 관리자 로그인 (`/admin`) 확인
- [ ] Vercel Functions → Cron Jobs 등록 확인
