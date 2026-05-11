/**
 * E2E 테스트용 계정 픽스처
 *
 * 실제 테스트 실행 전에 아래 계정이 DB에 존재해야 합니다.
 * 초기 설정: prisma/seed.ts에 테스트 계정 시드 추가 또는
 * 관리자 패널(/admin/members)에서 수동 생성 후 등급 변경
 */
export const TEST_USERS = {
  member: {
    email: 'test.member@kima-test.org',
    password: 'testpassword123',
    name: '테스트일반회원',
  },
  premium: {
    email: 'test.premium@kima-test.org',
    password: 'testpassword123',
    name: '테스트정회원',
  },
  admin: {
    email: 'test.admin@kima-test.org',
    password: 'testpassword123',
    name: '테스트관리자',
  },
} as const

export type TestUserRole = keyof typeof TEST_USERS
