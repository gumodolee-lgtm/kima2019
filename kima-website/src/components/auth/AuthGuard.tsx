import Link from 'next/link'

interface AuthGuardProps {
  required?: 'MEMBER' | 'PREMIUM' | 'OFFICER' | 'ADMIN'
}

const LABEL: Record<string, string> = {
  MEMBER: '일반회원',
  PREMIUM: '정회원',
  OFFICER: '임원',
  ADMIN: '관리자',
}

export function AuthGuard({ required = 'MEMBER' }: AuthGuardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-[#1B3A6B] mb-2">
        {LABEL[required]} 전용 콘텐츠입니다
      </h2>
      <p className="text-gray-600 mb-6">
        {required === 'PREMIUM'
          ? '정회원(연 5만원) 신청 후 이용하실 수 있습니다.'
          : '로그인 후 이용하실 수 있습니다.'}
      </p>
      <div className="flex gap-3">
        <Link
          href="/auth/login"
          className="px-5 py-2 bg-[#1B3A6B] text-white rounded-lg font-medium hover:opacity-90"
        >
          로그인
        </Link>
        {required === 'PREMIUM' && (
          <Link
            href="/member/upgrade"
            className="px-5 py-2 border border-[#C8922A] text-[#C8922A] rounded-lg font-medium hover:bg-[#C8922A] hover:text-white"
          >
            정회원 신청
          </Link>
        )}
      </div>
    </div>
  )
}
