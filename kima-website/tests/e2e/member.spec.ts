import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('비로그인 접근 제어', () => {
  test('/community → 로그인 페이지 리디렉트', async ({ page }) => {
    await page.goto('/community')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5_000 })
  })

  test('/network/schedule → 로그인 페이지 리디렉트', async ({ page }) => {
    await page.goto('/network/schedule')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5_000 })
  })

  test('/resources → 로그인 페이지 또는 업그레이드 페이지 리디렉트', async ({ page }) => {
    await page.goto('/resources')
    await expect(page).toHaveURL(/\/auth\/login|\/member\/upgrade/, { timeout: 5_000 })
  })

  test('/admin → 홈 리디렉트', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 5_000 })
  })

  test('/member/mypage → 로그인 페이지 리디렉트', async ({ page }) => {
    await page.goto('/member/mypage')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5_000 })
  })
})

test.describe('공개 페이지 접근', () => {
  test('/about는 비로그인으로 접근 가능하다', async ({ page }) => {
    await page.goto('/about')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page).toHaveURL(/\/about/)
  })

  test('/directory는 비로그인으로 접근 가능하다', async ({ page }) => {
    await page.goto('/directory')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page).toHaveURL(/\/directory/)
  })

  test('/donate는 비로그인으로 접근 가능하다', async ({ page }) => {
    await page.goto('/donate')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page).toHaveURL(/\/donate/)
  })

  test('/privacy는 비로그인으로 접근 가능하다', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page).toHaveURL(/\/privacy/)
  })

  test('/terms는 비로그인으로 접근 가능하다', async ({ page }) => {
    await page.goto('/terms')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page).toHaveURL(/\/terms/)
  })
})

/**
 * 아래 테스트는 DB에 테스트 계정이 필요합니다.
 * tests/e2e/fixtures.ts의 TEST_USERS 참고.
 * CI 환경에서는 SKIP_AUTH_TESTS=true 환경변수로 건너뛸 수 있습니다.
 */
test.describe('로그인 후 접근 제어', () => {
  test.skip(!!process.env.SKIP_AUTH_TESTS, '테스트 계정 필요 — SKIP_AUTH_TESTS=true로 건너뜀')

  test('일반회원은 /community에 접근할 수 있다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/community')
    await expect(page).toHaveURL(/\/community/)
    await expect(page).not.toHaveURL(/\/auth\/login/)
  })

  test('일반회원은 /resources에 접근 시 정회원 안내로 이동한다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/resources')
    await expect(page).toHaveURL(/\/member\/upgrade|\/resources/)
  })

  test('정회원은 /resources에 접근할 수 있다', async ({ page }) => {
    await loginAs(page, 'premium')
    await page.goto('/resources')
    await expect(page).toHaveURL(/\/resources/)
    await expect(page).not.toHaveURL(/\/member\/upgrade|\/auth\/login/)
  })

  test('마이페이지에서 사용자 정보를 확인할 수 있다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/member/mypage')
    await expect(page).toHaveURL(/\/member\/mypage/)
    await expect(page.getByText('마이페이지')).toBeVisible()
  })
})
