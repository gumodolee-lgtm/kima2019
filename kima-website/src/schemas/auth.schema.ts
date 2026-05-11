import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상 입력해주세요'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 2자 이상 입력해주세요')
      .max(50, '이름은 50자 이하로 입력해주세요'),
    email: z.string().email('올바른 이메일 형식을 입력해주세요'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상 입력해주세요')
      .regex(/[a-zA-Z]/, '비밀번호에 영문자를 포함해주세요')
      .regex(/[0-9]/, '비밀번호에 숫자를 포함해주세요'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    organization: z.string().max(100, '단체명은 100자 이하로 입력해주세요').optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
