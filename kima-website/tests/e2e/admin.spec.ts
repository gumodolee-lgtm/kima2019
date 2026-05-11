import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('관리자 접근 제어', () => {
  test('비로그인 → /admin 접근 시 홈으로 리디렉트된다', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 5_000 })
  })

  test('비로그인 → /admin/members 접근 시 홈으로 리디렉트된다', async ({ page }) => {
    await page.goto('/admin/members')
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 5_000 })
  })
})

/**
 * 아래 테스트는 DB에 관리자 계정이 필요합니다.
 * tests/e2e/fixtures.ts의 TEST_USERS.admin 참고.
 * CI 환경에서는 SKIP_AUTH_TESTS=true 환경변수로 건너뛸 수 있습니다.
 */
test.describe('관리자 기능', () => {
  test.skip(!!process.env.SKIP_AUTH_TESTS, '관리자 테스트 계정 필요 — SKIP_AUTH_TESTS=true로 건너뜀')

  test('관리자는 /admin에 접근할 수 있다', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin/)
    await expect(page).not.toHaveURL('http://localhost:3000/')
  })

  test('관리자 대시보드에 주요 통계 카드가 표시된다', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin')

    await expect(page.getByText('전체 회원')).toBeVisible()
    await expect(page.getByText('단체 승인 대기')).toBeVisible()
    await expect(page.getByText('등록 자료')).toBeVisible()
    await expect(page.getByText('예정 일정')).toBeVisible()
  })

  test('회원 목록 페이지가 정상 렌더링된다', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/members')
    await expect(page).toHaveURL(/\/admin\/members/)
    await expect(page.getByText('회원 관리')).toBeVisible()
  })

  test('정회원신청대기 탭으로 전환할 수 있다', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/members')

    await page.click('text=정회원신청대기')
    await expect(page).toHaveURL(/\/admin\/members\?tab=pending/)
  })

  test('일반회원은 /admin에 접근 시 홈으로 리디렉트된다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/admin')
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 5_000 })
  })
})
