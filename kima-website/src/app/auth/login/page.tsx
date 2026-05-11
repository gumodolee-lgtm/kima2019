import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: '로그인 | KIMA' }

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1B3A6B]">KIMA</Link>
          <p className="text-gray-500 mt-1 text-sm">한국이주민선교연합회</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">로그인</h1>
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="text-center text-sm text-gray-500 mt-6">
            계정이 없으신가요?{' '}
            <Link href="/auth/register" className="text-[#1B3A6B] font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
