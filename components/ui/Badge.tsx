import { cn } from '@/lib/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'wine' | 'green' | 'sale' | 'new' | 'outline' | 'tan'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'wine', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        {
          'bg-wine/10 text-wine': variant === 'wine',
          'bg-brand-green/10 text-brand-green': variant === 'green',
          'bg-wine text-white': variant === 'sale',
          'bg-brand-green text-white': variant === 'new',
          'border border-current text-text-muted': variant === 'outline',
          'bg-tan/10 text-tan': variant === 'tan',
          'px-2 py-0.5 text-[10px]': size === 'sm',
          'px-3 py-1 text-xs': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
