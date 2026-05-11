import { cn } from '@/lib/utils'

type BadgeVariant = 'member' | 'premium' | 'officer' | 'admin' | 'default'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  member: 'bg-blue-100 text-blue-700',
  premium: 'bg-amber-100 text-amber-700',
  officer: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
}

const variantLabels: Record<BadgeVariant, string> = {
  default: '',
  member: '정회원',
  premium: '프리미엄',
  officer: '임원',
  admin: '관리자',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children ?? (variant !== 'default' ? variantLabels[variant] : null)}
    </span>
  )
}
