import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { OrganizationRegisterForm } from '@/components/directory/OrganizationRegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '단체 등록 신청 | KIMA' }

export default async function DirectoryRegisterPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/directory/register')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/directory"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          단체 목록으로
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">단체 등록 신청</h1>
          <p className="mt-2 text-sm text-gray-500">
            관리자 승인 후 전국 단체 디렉토리에 등재됩니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <OrganizationRegisterForm />
        </div>
      </div>
    </div>
  )
}
