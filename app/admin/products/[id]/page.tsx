'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { ArrowLeft, Upload, X } from 'lucide-react'
import AdminSidebar from '../../_components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { t } from '@/lib/i18n/translations'
import { useLocale } from '@/providers/LocaleProvider'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/Skeleton'

const NUTRITION_TAGS = [
  'high-protein', 'low-carb', 'keto', 'vegan', 'gluten-free', 'organic',
  'low-fat', 'high-fiber', 'sugar-free', 'dairy-free', 'high-calorie', 'meal-prep',
]

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { locale } = useLocale()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`)
      const data = await res.json()
      return data.product
    },
  })

  const [form, setForm] = useState<Record<string, any>>({})
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Sync form when product loads
  useEffect(() => {
    if (product && !initialized) {
      setForm({
        slug: product.slug ?? '',
        name_vi: product.name_vi ?? '',
        name_en: product.name_en ?? '',
        description_vi: product.description_vi ?? '',
        description_en: product.description_en ?? '',
        short_description_vi: product.short_description_vi ?? '',
        short_description_en: product.short_description_en ?? '',
        price: String(product.price ?? ''),
        sale_price: product.sale_price != null ? String(product.sale_price) : '',
        stock: String(product.stock ?? '0'),
        calories: String(product.calories ?? ''),
        protein: String(product.protein ?? ''),
        carbs: String(product.carbs ?? ''),
        fat: String(product.fat ?? ''),
        category_id: product.category_id != null ? String(product.category_id) : '',
        featured: product.featured ?? false,
        active: product.active ?? true,
        nutrition_tags: product.nutrition_tags ?? [],
        image_url: product.image_url ?? '',
      })
      setInitialized(true)
    }
  }, [product, initialized])

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
      setForm((f) => ({ ...f, image_url: publicUrl }))
      toast.success('Đã tải lên hình ảnh')
    } catch {
      toast.error('Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
          stock: parseInt(form.stock) || 0,
          calories: parseInt(form.calories) || 0,
          protein: parseFloat(form.protein) || 0,
          carbs: parseFloat(form.carbs) || 0,
          fat: parseFloat(form.fat) || 0,
          category_id: form.category_id ? parseInt(form.category_id) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Đã lưu sản phẩm!')
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      router.push('/admin/products')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <Skeleton className="h-96 max-w-2xl" />
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p>Sản phẩm không tồn tại</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-6">
          <a href="/admin/products" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-wine mb-4">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </a>
          <h1 className="text-3xl font-serif font-bold">{t('admin.products.editProduct', locale)}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
              <h2 className="font-semibold">Thông tin cơ bản</h2>
              <Input
                label="Slug"
                value={form.slug ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('admin.products.nameVi', locale)}
                  value={form.name_vi ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name_vi: e.target.value }))}
                  required
                />
                <Input
                  label={t('admin.products.nameEn', locale)}
                  value={form.name_en ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                  required
                />
              </div>
              <Input
                label={t('admin.products.shortDescVi', locale)}
                value={form.short_description_vi ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, short_description_vi: e.target.value }))}
              />
              <Input
                label={t('admin.products.shortDescEn', locale)}
                value={form.short_description_en ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, short_description_en: e.target.value }))}
              />
              <Textarea
                label={t('admin.products.descriptionVi', locale)}
                value={form.description_vi ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description_vi: e.target.value }))}
                rows={4}
              />
              <Textarea
                label={t('admin.products.descriptionEn', locale)}
                value={form.description_en ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
                <h2 className="font-semibold">Giá & Tồn kho</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('admin.products.price', locale)}
                    type="number"
                    value={form.price ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    min="0"
                  />
                  <Input
                    label={t('admin.products.salePrice', locale)}
                    type="number"
                    value={form.sale_price ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value || null }))}
                    min="0"
                  />
                </div>
                <Input
                  label={t('admin.products.stock', locale)}
                  type="number"
                  value={form.stock ?? '0'}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  min="0"
                />
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
                <h2 className="font-semibold">{t('shop.nutritionInfo', locale)}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label={t('admin.products.calories', locale)} type="number" value={form.calories ?? ''} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} min="0" />
                  <Input label={t('admin.products.protein', locale)} type="number" value={form.protein ?? ''} onChange={(e) => setForm((f) => ({ ...f, protein: e.target.value }))} min="0" step="0.1" />
                  <Input label={t('admin.products.carbs', locale)} type="number" value={form.carbs ?? ''} onChange={(e) => setForm((f) => ({ ...f, carbs: e.target.value }))} min="0" step="0.1" />
                  <Input label={t('admin.products.fat', locale)} type="number" value={form.fat ?? ''} onChange={(e) => setForm((f) => ({ ...f, fat: e.target.value }))} min="0" step="0.1" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
                <h2 className="font-semibold">{t('admin.products.image', locale)}</h2>
                {(form.image_url) && (
                  <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <Image src={form.image_url} alt="" fill className="object-cover" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: '' }))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{uploading ? 'Đang tải...' : t('admin.products.uploadImage', locale)}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-wine" />
                  <span className="text-sm font-medium">{t('admin.products.featured', locale)}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-wine" />
                  <span className="text-sm font-medium">{t('admin.products.active', locale)}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold mb-4">{t('admin.products.nutritionTags', locale)}</h2>
            <div className="flex flex-wrap gap-2">
              {NUTRITION_TAGS.map((tag) => {
                const selected = (form.nutrition_tags ?? []).includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const current = form.nutrition_tags ?? []
                      setForm((f) => ({
                        ...f,
                        nutrition_tags: selected
                          ? current.filter((t: string) => t !== tag)
                          : [...current, tag],
                      }))
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selected ? 'bg-wine text-white border-wine' : 'border-gray-200 hover:border-wine/50'}`}
                  >
                    {t(`nutritionTags.${tag}`, locale) ?? tag}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={saving}>{t('admin.products.save', locale)}</Button>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (confirm('Xóa sản phẩm này?')) {
                  await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
                  toast.success('Đã xóa')
                  router.push('/admin/products')
                }
              }}
            >
              {t('admin.products.delete', locale)}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
