'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import AdminSidebar from '../_components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { t } from '@/lib/i18n/translations'
import { useLocale } from '@/providers/LocaleProvider'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import { formatPrice } from '@/lib/format'

export default function AdminProductsPage() {
  const { locale } = useLocale()
  const queryClient = useQueryClient()
  const supabase = createClient()
  const [search, setSearch] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      return data.products ?? []
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Đã xóa sản phẩm')
    },
  })

  const filteredProducts = products?.filter((p: any) =>
    !search ||
    p.name_vi.toLowerCase().includes(search.toLowerCase()) ||
    p.name_en.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">{t('admin.products.title', locale)}</h1>
            <p className="text-text-muted">{t('admin.products.subtitle', locale)}</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('admin.products.addProduct', locale)}
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.products.search', locale)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine/30"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-text-muted">
                    <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                    <th className="px-6 py-4 font-semibold">Giá</th>
                    <th className="px-6 py-4 font-semibold">Tồn kho</th>
                    <th className="px-6 py-4 font-semibold">Danh mục</th>
                    <th className="px-6 py-4 font-semibold">Nổi bật</th>
                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts?.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm">{product.name_vi}</p>
                        <p className="text-xs text-text-muted">{product.name_en}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm">{formatPrice(product.sale_price ?? product.price)}đ</p>
                        {product.sale_price && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}đ</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-amber-600' : 'text-text-dark'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.category?.name_vi ?? '-'}
                      </td>
                      <td className="px-6 py-4">
                        {product.featured ? (
                          <Badge variant="green" size="sm">★</Badge>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={product.active ? 'green' : 'wine'} size="sm">
                          {product.active ? 'Đang bán' : 'Ẩn'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/products/${product.id}`}>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit className="w-4 h-4 text-text-muted" />
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Xóa sản phẩm này?')) {
                                deleteMutation.mutate(product.id)
                              }
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-text-muted">{t('admin.products.noProducts', locale)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
