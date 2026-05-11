import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata = { title: '회원가입 | KIMA' }

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1B3A6B]">KIMA</Link>
          <p className="text-gray-500 mt-1 text-sm">한국이주민선교연합회</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">회원가입</h1>
          <p className="text-sm text-gray-500 mb-6">
            가입 후 단체 디렉토리, 커뮤니티 등을 이용하실 수 있습니다.
          </p>
          <RegisterForm />
          <p className="text-center text-sm text-gray-500 mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-[#1B3A6B] font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
