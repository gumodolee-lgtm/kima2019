import { test, expect } from '@playwright/test'

test.describe('회원가입', () => {
  test('유효한 정보로 가입하면 로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/auth/register')

    const uniqueEmail = `e2e.${Date.now()}@kima-test.org`
    await page.fill('input[placeholder="홍길동"]', '테스트유저')
    await page.fill('input[placeholder="example@email.com"]', uniqueEmail)
    await page.fill('input[placeholder="영문+숫자 8자 이상"]', 'testpass123')
    await page.fill('input[placeholder="비밀번호 재입력"]', 'testpass123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test('이메일 형식 오류 시 에러 메시지를 표시하고 페이지를 이동하지 않는다', async ({ page }) => {
    await page.goto('/auth/register')

    await page.fill('input[placeholder="홍길동"]', '홍길동')
    await page.fill('input[placeholder="example@email.com"]', 'not-valid-email')
    await page.fill('input[placeholder="영문+숫자 8자 이상"]', 'password123')
    await page.fill('input[placeholder="비밀번호 재입력"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page.getByText('올바른 이메일 형식을 입력해주세요')).toBeVisible()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  test('비밀번호 불일치 시 에러 메시지를 표시한다', async ({ page }) => {
    await page.goto('/auth/register')

    await page.fill('input[placeholder="홍길동"]', '홍길동')
    await page.fill('input[placeholder="example@email.com"]', 'valid@kima.org')
    await page.fill('input[placeholder="영문+숫자 8자 이상"]', 'password123')
    await page.fill('input[placeholder="비밀번호 재입력"]', 'different456')
    await page.click('button[type="submit"]')

    await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  test('빈 폼 제출 시 이름·이메일·비밀번호 에러 메시지를 표시한다', async ({ page }) => {
    await page.goto('/auth/register')
    await page.click('button[type="submit"]')

    await expect(page.getByText('이름은 2자 이상 입력해주세요')).toBeVisible()
    await expect(page.getByText('올바른 이메일 형식을 입력해주세요')).toBeVisible()
    await expect(page.getByText('비밀번호는 8자 이상 입력해주세요')).toBeVisible()
  })
})

test.describe('로그인', () => {
  test('존재하지 않는 계정으로 로그인하면 에러 메시지를 표시한다', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('input[type="email"]', 'nonexistent@kima-test.org')
    await page.fill('input[type="password"]', 'wrongpassword123')
    await page.click('button[type="submit"]')

    await expect(
      page.getByText(/이메일 또는 비밀번호|로그인 오류|올바르지 않/)
    ).toBeVisible({ timeout: 10_000 })
  })

  test('비로그인 상태에서 /community 접근 시 로그인 페이지로 리디렉트된다', async ({ page }) => {
    await page.goto('/community')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5_000 })
  })

  test('비로그인 상태에서 /member/mypage 접근 시 로그인 페이지로 리디렉트된다', async ({ page }) => {
    await page.goto('/member/mypage')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5_000 })
  })

  test('로그인 페이지에서 회원가입 링크로 이동할 수 있다', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('link', { name: /회원가입/ }).click()
    await expect(page).toHaveURL(/\/auth\/register/)
  })
})
