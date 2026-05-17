import { z } from 'zod'

const ORG_REGIONS = [
  '전체',
  '서울경기인천',
  '부산경남',
  '대구경북',
  '광주전라',
  '대전충청',
  '강원제주',
  '기타',
] as const

const LANGUAGES = [
  '베트남', '네팔', '몽골', '인도네시아', '필리핀',
  '러시아', '중국', '태국', '기타',
] as const

const TARGETS = [
  '이주노동자', '유학생', '결혼이민자', '다문화자녀', '난민미등록', '귀국이주민',
] as const

const ORG_TYPES = [
  '교회', 'NGO', '법률', '의료', '교육',
  '다문화센터', '선교단체', '부설기관', '기타',
] as const

export const organizationSchema = z.object({
  name: z.string().min(1, '단체명을 입력해주세요').max(100, '단체명은 100자 이하로 입력해주세요'),
  nameEn: z
    .string()
    .regex(/^[a-zA-Z0-9\s\-\.]*$/, '영문, 숫자, 공백, 하이픈만 입력 가능합니다')
    .optional()
    .or(z.literal('')),
  description: z.string().max(500, '소개는 500자 이하로 입력해주세요').optional(),
  region: z.enum(ORG_REGIONS, { message: '지역을 선택해주세요' }),
  languages: z.array(z.string()).min(1, '언어권을 1개 이상 입력해주세요'),
  targets: z.array(z.string()).min(1, '사역대상을 1개 이상 입력해주세요'),
  type: z.enum(ORG_TYPES).optional(),
  address: z.string().optional(),
  phone: z
    .string()
    .regex(/^[\d\-\+\(\)\s]*$/, '올바른 전화번호 형식을 입력해주세요')
    .optional()
    .or(z.literal('')),
  email: z.string().email('올바른 이메일 형식을 입력해주세요').optional().or(z.literal('')),
  website: z.string().url('올바른 URL 형식을 입력해주세요').optional().or(z.literal('')),
})

export type OrganizationInput = z.infer<typeof organizationSchema>
export { ORG_REGIONS, LANGUAGES, TARGETS, ORG_TYPES }
