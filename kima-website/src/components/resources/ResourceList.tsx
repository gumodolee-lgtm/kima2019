import { cn } from '@/lib/utils'
import type { AccessLevel } from '@prisma/client'

interface Resource {
  id: string
  title: string
  description: string | null
  driveUrl: string
  fileType: string | null
  accessLevel: AccessLevel
  createdAt: string | Date
  category?: { id: string; name: string; slug: string } | null
}

interface ResourceListProps {
  resources: Resource[]
  userAccessLevel: 'none' | 'member' | 'premium'
}

const FILE_TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-100 text-red-700',
  PPT: 'bg-orange-100 text-orange-700',
  DOC: 'bg-blue-100 text-blue-700',
  XLS: 'bg-green-100 text-green-700',
  ETC: 'bg-gray-100 text-gray-700',
}

const ACCESS_BADGES: Record<AccessLevel, { label: string; className: string }> = {
  PUBLIC: { label: '공개', className: 'bg-gray-100 text-gray-600' },
  MEMBER: { label: '회원', className: 'bg-blue-100 text-blue-700' },
  PREMIUM: { label: '정회원', className: 'bg-amber-100 text-amber-700' },
}

function canAccess(resourceLevel: AccessLevel, userLevel: 'none' | 'member' | 'premium'): boolean {
  if (resourceLevel === 'PUBLIC') return true
  if (resourceLevel === 'MEMBER') return userLevel === 'member' || userLevel === 'premium'
  if (resourceLevel === 'PREMIUM') return userLevel === 'premium'
  return false
}

function LockIcon({ gold }: { gold?: boolean }) {
  return (
    <svg
      className={cn('w-4 h-4 flex-shrink-0', gold ? 'text-amber-500' : 'text-blue-400')}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function ResourceList({ resources, userAccessLevel }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">등록된 자료가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {resources.map((resource) => {
        const accessible = canAccess(resource.accessLevel, userAccessLevel)
        const badge = ACCESS_BADGES[resource.accessLevel]
        const fileColor = resource.fileType ? (FILE_TYPE_COLORS[resource.fileType] ?? FILE_TYPE_COLORS.ETC) : FILE_TYPE_COLORS.ETC
        const date = new Date(resource.createdAt).toLocaleDateString('ko-KR')

        return (
          <div
            key={resource.id}
            className={cn(
              'flex items-center gap-4 py-4 px-2 transition-colors',
              accessible ? 'hover:bg-gray-50' : 'opacity-60'
            )}
          >
            {/* 파일 타입 뱃지 */}
            <span
              className={cn(
                'inline-flex items-center justify-center w-12 h-8 rounded text-xs font-bold flex-shrink-0',
                fileColor
              )}
            >
              {resource.fileType ?? 'ETC'}
            </span>

            {/* 제목 + 설명 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900 truncate">{resource.title}</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    badge.className
                  )}
                >
                  {resource.accessLevel !== 'PUBLIC' && (
                    <LockIcon gold={resource.accessLevel === 'PREMIUM'} />
                  )}
                  {badge.label}
                </span>
              </div>
              {resource.description && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">{resource.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{date}</p>
            </div>

            {/* 링크 또는 접근 불가 메시지 */}
            {accessible ? (
              <a
                href={resource.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#1B3A6B] text-white hover:bg-[#142d54] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                열기
              </a>
            ) : (
              <span className="flex-shrink-0 text-xs text-gray-400 flex items-center gap-1">
                {resource.accessLevel === 'PREMIUM' ? (
                  <>
                    <LockIcon gold />
                    정회원 전용
                  </>
                ) : (
                  <>
                    <LockIcon />
                    회원 전용
                  </>
                )}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
