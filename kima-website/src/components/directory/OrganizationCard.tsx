import Link from 'next/link'
import type { Organization } from '@prisma/client'
import { cn } from '@/lib/utils'

interface OrganizationCardProps {
  org: Organization
  isSelected?: boolean
  isHovered?: boolean
  onSelect?: () => void
  showContact?: boolean
}

export function OrganizationCard({ org, isSelected, isHovered, onSelect, showContact }: OrganizationCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4 cursor-pointer transition-all',
        isSelected
          ? 'border-[#1B3A6B] shadow-md ring-1 ring-[#1B3A6B]'
          : isHovered
            ? 'border-[#1B3A6B]/40 bg-blue-50/60 shadow-sm'
            : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      )}
      onClick={onSelect}
    >
      {/* 상단: 단체명 + 지역 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#1B3A6B] truncate">{org.name}</h3>
          {org.nameEn && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{org.nameEn}</p>
          )}
        </div>
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
          {org.region}
        </span>
      </div>

      {/* 사역유형 + 태그 */}
      <div className="mt-2 flex flex-wrap gap-1">
        {org.type && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 font-medium">
            {org.type}
          </span>
        )}
        {org.languages.slice(0, 3).map((lang) => (
          <span key={lang} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
            {lang}
          </span>
        ))}
        {org.languages.length > 3 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">
            +{org.languages.length - 3}
          </span>
        )}
      </div>

      {/* 소개 */}
      {org.description && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {org.description}
        </p>
      )}

      {/* 주소 */}
      {org.address && (
        <p className="mt-2 text-xs text-gray-400 flex items-start gap-1">
          <svg className="w-3 h-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{org.address}</span>
        </p>
      )}

      {/* 연락처 (로그인 회원만) */}
      {showContact && (org.phone || org.email) && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
          {org.phone && (
            <a href={`tel:${org.phone}`} className="flex items-center gap-1 hover:text-[#1B3A6B]" onClick={(e) => e.stopPropagation()}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {org.phone}
            </a>
          )}
          {org.email && (
            <a href={`mailto:${org.email}`} className="flex items-center gap-1 hover:text-[#1B3A6B]" onClick={(e) => e.stopPropagation()}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {org.email}
            </a>
          )}
        </div>
      )}

      {/* 상세 링크 */}
      <div className="mt-3 text-right">
        <Link
          href={`/directory/${org.id}`}
          className="text-xs text-[#1B3A6B] font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          상세 보기 →
        </Link>
      </div>
    </div>
  )
}
