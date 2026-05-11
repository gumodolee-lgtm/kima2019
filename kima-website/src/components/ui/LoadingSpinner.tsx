import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

export function LoadingSpinner({ size = 'md', className, label = '로딩 중...' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)} role="status">
      <svg
        className={cn('animate-spin text-[#1B3A6B]', sizeClasses[size])}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label && <span className="text-sm text-gray-500 sr-only">{label}</span>}
    </div>
  )
}
