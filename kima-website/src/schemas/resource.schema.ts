import { z } from 'zod'

const FILE_TYPES = ['PDF', 'PPT', 'DOC', 'XLS', 'ETC'] as const

export const resourceSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하로 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이하로 입력해주세요').optional(),
  driveUrl: z
    .string()
    .url('올바른 URL 형식을 입력해주세요')
    .refine(
      (url) => url.includes('drive.google.com'),
      '구글 드라이브 링크만 등록 가능합니다 (drive.google.com)'
    ),
  fileType: z.enum(FILE_TYPES).optional(),
  accessLevel: z.enum(['PUBLIC', 'MEMBER', 'PREMIUM'], { message: '접근 등급을 선택해주세요' }),
  categoryId: z.string().cuid('올바른 카테고리를 선택해주세요').optional(),
})

export type ResourceInput = z.infer<typeof resourceSchema>
export { FILE_TYPES }
