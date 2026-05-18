import { z } from 'zod'

const REGIONS = [
  '서울',
  '경기',
  '인천',
  '부산경남',
  '대구경북',
  '광주전라',
  '대전충청',
  '강원',
  '제주',
  '기타',
] as const

export const updateProfileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상 입력해주세요'),
  organization: z.string().max(100, '단체명은 100자 이하로 입력해주세요').optional(),
  region: z.enum(REGIONS, { message: '올바른 지역을 선택해주세요' }).optional(),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)')
    .optional()
    .or(z.literal('')),
})

export const premiumRequestSchema = z.object({
  depositorName: z.string().min(1, '입금자명을 입력해주세요'),
  depositedAt: z.string().min(1, '입금일을 선택해주세요'),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type PremiumRequestInput = z.infer<typeof premiumRequestSchema>
export { REGIONS }
