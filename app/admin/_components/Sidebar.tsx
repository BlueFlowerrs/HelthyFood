'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Layers, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/cn'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: Layers },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-brand-green-dark text-white min-h-screen p-6 shrink-0">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-wine rounded-full flex items-center justify-center">
          <span className="text-white font-serif font-bold">H</span>
        </div>
        <div>
          <p className="font-serif font-semibold">HelthyFood</p>
          <p className="text-xs text-white/50">Admin Panel</p>
        </div>
      </div>

      <nav className="space-y-1">
        {adminLinks.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                isActive
                  ? 'bg-wine text-white'
                  : 'hover:bg-white/10 text-white/70 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          ← Quay về website
        </Link>
      </div>
    </aside>
  )
}
