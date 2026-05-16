import { prisma } from '@/lib/prisma'
import { ResourceAdminForm } from '@/components/admin/ResourceAdminForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import type { Metadata } from 'next'
import type { AccessLevel } from '@prisma/client'

export const metadata: Metadata = { title: '자료 관리 | KIMA 관리자' }

const ACCESS_LABELS: Record<AccessLevel, string> = {
  PUBLIC: '공개',
  MEMBER: '회원',
  PREMIUM: '정회원',
}
const ACCESS_COLORS: Record<AccessLevel, string> = {
  PUBLIC: 'bg-gray-100 text-gray-600',
  MEMBER: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-amber-100 text-amber-700',
}

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function AdminResourcesPage({ searchParams }: PageProps) {
  const { category: preselectedSlug } = await searchParams

  const [resources, categories] = await Promise.all([
    prisma.resource.findMany({
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: [{ type: 'asc' }, { order: 'asc' }] }),
  ])

  const catForForm = categories.map((c) => ({ id: c.id, name: c.name, type: c.type, slug: c.slug }))
  const preselectedCatId = preselectedSlug
    ? (categories.find((c) => c.slug === preselectedSlug)?.id ?? '')
    : ''

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B3A6B]">자료 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            구글 드라이브 자료 링크를 등록·삭제합니다.
            <span className="ml-2 text-xs text-gray-400">
              📌 커뮤니티 카테고리에서 자료를 등록하려면 해당 카테고리를 선택하세요.
            </span>
          </p>
        </div>
      </div>

      <ResourceAdminForm categories={catForForm} preselectedCategoryId={preselectedCatId} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {resources.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">등록된 자료가 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium">
                <th className="px-4 py-3 text-left">제목</th>
                <th className="px-4 py-3 text-left">형식</th>
                <th className="px-4 py-3 text-left">등급</th>
                <th className="px-4 py-3 text-left">카테고리</th>
                <th className="px-4 py-3 text-left">등록일</th>
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <a
                      href={r.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-[#1B3A6B] hover:underline"
                    >
                      {r.title}
                    </a>
                    {r.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{r.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {r.fileType ?? 'ETC'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ACCESS_COLORS[r.accessLevel]}`}>
                      {ACCESS_LABELS[r.accessLevel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {r.category?.name ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {r.createdAt.toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton url={`/api/admin/resources/${r.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
