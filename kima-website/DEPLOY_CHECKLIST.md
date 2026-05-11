# KIMA 홈페이지 배포 체크리스트

> 배포 구조: 가비아(도메인) → Cloudflare(DNS·CDN·Pages) → Supabase(DB)

---

## STEP 1 — 가비아 → Cloudflare 네임서버 위임

- [ ] cloudflare.com 회원가입 후 "사이트 추가" → `kima2019.org` 입력
- [ ] Cloudflare가 제시하는 네임서버 2개 확인 (예: `aria.ns.cloudflare.com`)
- [ ] 가비아 도메인 관리 → DNS 설정 → 네임서버 변경 → Cloudflare 네임서버 2개 입력
- [ ] Cloudflare 대시보드에서 네임서버 전파 확인 (최대 48시간, 보통 수분~수시간)

---

## STEP 2 — Cloudflare DNS 레코드 설정

Cloudflare DNS → 레코드 추가:

| 유형 | 이름 | 내용 | 프록시 |
|------|------|------|--------|
| CNAME | `@` | `kima-website.pages.dev` | 켜짐 (주황) |
| CNAME | `www` | `kima2019.org` | 켜짐 (주황) |

- [ ] SSL/TLS → Overview → **Full (strict)** 선택
- [ ] SSL/TLS → Edge Certificates → **Always Use HTTPS** ON
- [ ] SSL/TLS → Edge Certificates → Minimum TLS Version: **TLS 1.2**

---

## STEP 3 — Cloudflare 보안 설정

- [ ] Security → WAF → 활성화
- [ ] Security → Bots → **Bot Fight Mode** ON
- [ ] Security → Settings → Security Level: **Medium**
- [ ] Speed → Optimization → Auto Minify → JS/CSS/HTML 모두 체크

---

## STEP 4 — Supabase 프로젝트 설정

- [ ] Supabase 프로젝트 생성 (무료 플랜으로 시작 가능)
- [ ] Settings → API에서 `URL`, `anon key`, `service_role key` 복사
- [ ] Settings → Database → Connection String (URI) 복사 → `DATABASE_URL`로 사용
- [ ] Authentication → URL Configuration → Site URL: `https://kima2019.org`
- [ ] Authentication → URL Configuration → Redirect URLs에 `https://kima2019.org/**` 추가

DB 스키마 적용 (로컬 터미널에서):
```bash
cd kima-website
npx prisma db push         # 스키마 적용
npx prisma db seed         # 카테고리 초기 데이터
```

---

## STEP 5 — Cloudflare Pages 배포

### 5-1. 빌드 테스트 (로컬)
```bash
cd kima-website
npm run build:cf           # @cloudflare/next-on-pages 빌드
```

### 5-2. GitHub 연결 배포 (권장)
- [ ] Cloudflare 대시보드 → Workers & Pages → **Create application** → Pages
- [ ] **GitHub 저장소 연결** → `kima2019` 레포 선택
- [ ] 빌드 설정:
  - Framework preset: **Next.js**
  - Build command: `npx @cloudflare/next-on-pages`
  - Build output directory: `.vercel/output/static`
  - Node.js version: **18.x** (Environment Variables에서 `NODE_VERSION=18` 설정)

### 5-3. 환경변수 입력
Pages → Settings → **Variables and Secrets**에서 아래 변수 모두 입력:

```
DATABASE_URL              = postgresql://postgres:[PW]@db.[REF].supabase.co:5432/postgres
NEXTAUTH_SECRET           = [openssl rand -base64 32 결과값]
NEXTAUTH_URL              = https://kima2019.org
NEXT_PUBLIC_SITE_URL      = https://kima2019.org
SMTP_HOST                 = smtp.gmail.com
SMTP_PORT                 = 587
SMTP_USER                 = admin@kima2019.org
SMTP_PASSWORD             = [Gmail 앱 비밀번호]
ADMIN_EMAIL               = admin@kima2019.org
CRON_SECRET               = [랜덤 문자열]
NEXT_PUBLIC_SUPABASE_URL  = https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon key]
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = [Google Maps API 키]
```

> Gmail 앱 비밀번호: Google 계정 → 보안 → 2단계 인증 → 앱 비밀번호 생성

### 5-4. 도메인 연결
- [ ] Pages → Custom domains → `kima2019.org` 추가
- [ ] Pages → Custom domains → `www.kima2019.org` 추가

---

## STEP 6 — Cloudflare Workers Cron 배포

매일 KST 09:00에 정회원 만료 알림 + 행사 리마인더 이메일 발송:

```bash
# 환경변수 설정 후 배포
npx wrangler secret put CRON_SECRET --name kima-cron
npx wrangler secret put SITE_URL --name kima-cron
npx wrangler deploy src/workers/cron.ts --name kima-cron
```

Cron 트리거 추가 (Cloudflare 대시보드):
- Workers & Pages → kima-cron → Triggers → Cron Triggers → Add Cron Trigger
- Cron 표현식: `0 0 * * *` (매일 UTC 00:00 = KST 09:00)

---

## STEP 7 — 관리자 계정 생성

첫 배포 후 관리자 계정을 수동으로 설정합니다:

**방법 1: Supabase 대시보드**
1. Table Editor → `User` 테이블 → 일반 회원가입으로 생성된 계정 선택
2. `role` 컬럼 → `ADMIN`으로 변경

**방법 2: Prisma Studio** (로컬)
```bash
npx prisma studio
# User 테이블 → 해당 사용자 → role → ADMIN 변경
```

---

## STEP 8 — 최종 확인

- [ ] `https://kima2019.org` 접속 → HTTPS 자물쇠 표시
- [ ] `https://www.kima2019.org` → `https://kima2019.org` 리디렉트
- [ ] 회원가입 → 환영 이메일 수신 확인
- [ ] 로그인 → 마이페이지 접근
- [ ] 관리자 계정으로 `/admin` 접근
- [ ] `/sitemap.xml` 접근 → XML 정상 출력
- [ ] `/robots.txt` 접근 → 정상 출력
- [ ] Google Search Console → sitemap 제출
- [ ] Google Maps API → 허용 도메인 `kima2019.org` 등록
- [ ] Cloudflare Analytics → 트래픽 수집 확인

---

## 유용한 명령어 (배포 후)

```bash
# 배포 상태 확인
npx wrangler pages deployment list --project-name kima-website

# 배포 로그 확인
npx wrangler pages deployment tail --project-name kima-website

# 환경변수 목록 확인
npx wrangler pages secret list --project-name kima-website

# 수동 배포 (GitHub 연결 없이)
npm run build:cf
npx wrangler pages deploy .vercel/output/static --project-name kima-website
```

---

## 비용 참고

| 서비스 | 플랜 | 월 비용 |
|--------|------|---------|
| Cloudflare Pages | Free | 무료 (빌드 500회/월) |
| Cloudflare Workers | Free | 무료 (요청 10만회/일) |
| Supabase | Free | 무료 (DB 500MB, 50K MAU) |
| 도메인 (가비아) | - | 약 ₩15,000/년 |

> Supabase 무료 플랜은 비활성 7일 후 프로젝트가 일시정지됩니다. Pro 플랜($25/월)으로 업그레이드하거나 Cloudflare Cron으로 주기적으로 ping을 보내 활성 상태를 유지하세요.
