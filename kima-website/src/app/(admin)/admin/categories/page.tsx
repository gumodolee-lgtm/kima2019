import { prisma } from '@/lib/prisma'
import { CategoryOfficerForm } from '@/components/admin/CategoryOfficerForm'
import type { Metadata } from 'next'
import type { CategoryType } from '@prisma/client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: '카테고리 관리 | KIMA 관리자' }

const TYPE_LABELS: Record<CategoryType, string> = {
  REGION: '지역별',
  LANGUAGE: '언어권별',
  TARGET: '사역대상별',
}

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
  })

  const grouped = categories.reduce<Record<CategoryType, typeof categories>>(
    (acc, cat) => {
      if (!acc[cat.type]) acc[cat.type] = []
      acc[cat.type].push(cat)
      return acc
    },
    { REGION: [], LANGUAGE: [], TARGET: [] }
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1B3A6B]">카테고리 관리</h1>
        <p className="text-sm text-gray-500 mt-1">각 카테고리의 담당 위원장 정보를 관리합니다.</p>
      </div>

      <div className="space-y-8">
        {(Object.keys(TYPE_LABELS) as CategoryType[]).map((type) => (
          <div key={type}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {TYPE_LABELS[type]}
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {grouped[type].map((cat) => (
                <div key={cat.id} className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>
                    <div className="flex-1">
                      <CategoryOfficerForm
                        categoryId={cat.id}
                        officerName={cat.officerName}
                        officerSns={cat.officerSns}
                        officerQr={cat.officerQr}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
