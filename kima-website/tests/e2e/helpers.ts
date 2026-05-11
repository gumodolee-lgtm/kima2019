import { type Page } from '@playwright/test'
import { TEST_USERS, type TestUserRole } from './fixtures'

export async function loginAs(page: Page, role: TestUserRole) {
  const user = TEST_USERS[role]
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', user.email)
  await page.fill('input[type="password"]', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
    timeout: 10_000,
  })
}

export async function logout(page: Page) {
  // 헤더 프로필 드롭다운으로 로그아웃
  const profileBtn = page.locator('[data-testid="profile-menu"]')
  if (await profileBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await profileBtn.click()
    const logoutBtn = page.locator('[data-testid="logout-btn"]')
    await logoutBtn.click()
    await page.waitForURL('/')
  }
}
