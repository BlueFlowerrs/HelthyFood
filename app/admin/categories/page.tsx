'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import AdminSidebar from '../_components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Textarea } from '@/components/ui/Input'
import { t } from '@/lib/i18n/translations'
import { useLocale } from '@/providers/LocaleProvider'
import { useState } from 'react'
import { toast } from 'sonner'

export default function AdminCategoriesPage() {
  const { locale } = useLocale()
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({
    name_vi: '', name_en: '', description_vi: '', description_en: '',
    sort_order: '0', active: true,
  })

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      const data = await res.json()
      return data.categories ?? []
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (payload.id) {
        const res = await fetch(`/api/admin/categories/${payload.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setIsCreating(false)
      setEditingId(null)
      setForm({ name_vi: '', name_en: '', description_vi: '', description_en: '', sort_order: '0', active: true })
      toast.success('Đã lưu danh mục')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Lỗi'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast.success('Đã xóa danh mục')
    },
  })

  const handleSave = () => {
    saveMutation.mutate({
      ...form,
      sort_order: parseInt(form.sort_order) || 0,
      id: editingId,
    })
  }

  const startEdit = (cat: any) => {
    setEditingId(cat.id)
    setIsCreating(false)
    setForm({
      name_vi: cat.name_vi,
      name_en: cat.name_en,
      description_vi: cat.description_vi ?? '',
      description_en: cat.description_en ?? '',
      sort_order: String(cat.sort_order ?? 0),
      active: cat.active,
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">{t('admin.categories.title', locale)}</h1>
            <p className="text-text-muted">{t('admin.categories.subtitle', locale)}</p>
          </div>
          {!isCreating && (
            <Button onClick={() => { setIsCreating(true); setEditingId(null); setForm({ name_vi: '', name_en: '', description_vi: '', description_en: '', sort_order: '0', active: true }) }} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('admin.categories.addCategory', locale)}
            </Button>
          )}
        </div>

        {(isCreating || editingId) && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
            <h2 className="font-semibold mb-4">
              {editingId ? t('admin.categories.editCategory', locale) : t('admin.categories.addCategory', locale)}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label={t('admin.categories.nameVi', locale)} value={form.name_vi} onChange={(e) => setForm((f) => ({ ...f, name_vi: e.target.value }))} required />
              <Input label={t('admin.categories.nameEn', locale)} value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} required />
              <Textarea label={t('admin.categories.descriptionVi', locale)} value={form.description_vi} onChange={(e) => setForm((f) => ({ ...f, description_vi: e.target.value }))} rows={2} />
              <Textarea label={t('admin.categories.descriptionEn', locale)} value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} rows={2} />
              <Input label={t('admin.categories.sortOrder', locale)} type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
              <label className="flex items-center gap-2 pt-6">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-wine" />
                <span className="text-sm">{t('admin.categories.active', locale)}</span>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSave} loading={saveMutation.isPending}>{t('admin.categories.save', locale)}</Button>
              <Button variant="outline" onClick={() => { setIsCreating(false); setEditingId(null) }}>{t('common.cancel', locale)}</Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-text-muted">
                <th className="px-6 py-4 font-semibold">Thứ tự</th>
                <th className="px-6 py-4 font-semibold">Tên</th>
                <th className="px-6 py-4 font-semibold">Mô tả</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories?.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{cat.sort_order ?? 0}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{cat.name_vi}</p>
                    <p className="text-xs text-text-muted">{cat.name_en}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted max-w-xs truncate">{cat.description_vi ?? ''}</td>
                  <td className="px-6 py-4">
                    <Badge variant={cat.active ? 'green' : 'wine'} size="sm">{cat.active ? 'Hiển thị' : 'Ẩn'}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(cat)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4 text-text-muted" />
                      </button>
                      <button onClick={() => { if (confirm('Xóa?')) deleteMutation.mutate(cat.id) }} className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
