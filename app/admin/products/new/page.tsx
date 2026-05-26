'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Upload, Sparkles, X } from 'lucide-react'
import AdminSidebar from '../../_components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { t } from '@/lib/i18n/translations'
import { useLocale } from '@/providers/LocaleProvider'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const NUTRITION_TAGS = [
  'high-protein', 'low-carb', 'keto', 'vegan', 'gluten-free', 'organic',
  'low-fat', 'high-fiber', 'sugar-free', 'dairy-free', 'high-calorie', 'meal-prep',
]

export default function NewProductPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const supabase = createClient()

  const [form, setForm] = useState({
    slug: '', name_vi: '', name_en: '', description_vi: '', description_en: '',
    short_description_vi: '', short_description_en: '', price: '', sale_price: '',
    stock: '0', calories: '', protein: '', carbs: '', fat: '',
    category_id: '', featured: false, active: true,
    nutrition_tags: [] as string[], image_url: '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').eq('active', true).order('sort_order')
      return data ?? []
    },
  })

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleNameChange = (vi: string) => {
    setForm((f) => ({
      ...f,
      name_vi: vi,
      slug: slugify(vi),
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(data.path)

      setForm((f) => ({ ...f, image_url: publicUrl }))
      toast.success('Đã tải lên hình ảnh')
    } catch (err) {
      toast.error('Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleAISubmit = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/admin/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_vi: form.name_vi,
          name_en: form.name_en,
          calories: form.calories,
          protein: form.protein,
          carbs: form.carbs,
          fat: form.fat,
          nutrition_tags: form.nutrition_tags,
          category: categories?.find((c: any) => c.id === parseInt(form.category_id))?.name_vi,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setForm((f) => ({
        ...f,
        short_description_vi: data.short_vi ?? '',
        short_description_en: data.short_en ?? '',
        description_vi: data.desc_vi ?? '',
        description_en: data.desc_en ?? '',
      }))
      toast.success('Đã tạo mô tả bằng AI!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi AI')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
          stock: parseInt(form.stock),
          calories: form.calories ? parseInt(form.calories) : 0,
          protein: form.protein ? parseFloat(form.protein) : 0,
          carbs: form.carbs ? parseFloat(form.carbs) : 0,
          fat: form.fat ? parseFloat(form.fat) : 0,
          category_id: form.category_id ? parseInt(form.category_id) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Đã lưu sản phẩm!')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi')
    } finally {
      setSaving(false)
    }
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
          <h1 className="text-3xl font-serif font-bold">{t('admin.products.addProduct', locale)}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
              <h2 className="font-semibold">Thông tin cơ bản</h2>
              <Input
                label="Slug (URL)"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('admin.products.nameVi', locale)}
                  value={form.name_vi}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
                <Input
                  label={t('admin.products.nameEn', locale)}
                  value={form.name_en}
                  onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                  required
                />
              </div>
              <Input
                label={t('admin.products.shortDescVi', locale)}
                value={form.short_description_vi}
                onChange={(e) => setForm((f) => ({ ...f, short_description_vi: e.target.value }))}
              />
              <Input
                label={t('admin.products.shortDescEn', locale)}
                value={form.short_description_en}
                onChange={(e) => setForm((f) => ({ ...f, short_description_en: e.target.value }))}
              />
              <Textarea
                label={t('admin.products.descriptionVi', locale)}
                value={form.description_vi}
                onChange={(e) => setForm((f) => ({ ...f, description_vi: e.target.value }))}
                rows={4}
              />
              <Textarea
                label={t('admin.products.descriptionEn', locale)}
                value={form.description_en}
                onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
                rows={4}
              />

              {/* AI Generate */}
              {form.name_vi && (
                <button
                  type="button"
                  onClick={handleAISubmit}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiLoading ? t('admin.products.aiGenerating', locale) : t('admin.products.aiDescribe', locale)}
                </button>
              )}
            </div>

            {/* Pricing & Nutrition */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
                <h2 className="font-semibold">Giá & Tồn kho</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('admin.products.price', locale)}
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                    min="0"
                  />
                  <Input
                    label={t('admin.products.salePrice', locale)}
                    type="number"
                    value={form.sale_price}
                    onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value }))}
                    min="0"
                    helper="Để trống nếu không giảm giá"
                  />
                </div>
                <Input
                  label={t('admin.products.stock', locale)}
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  min="0"
                />
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
                <h2 className="font-semibold">{t('shop.nutritionInfo', locale)}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label={t('admin.products.calories', locale)} type="number" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} min="0" />
                  <Input label={t('admin.products.protein', locale)} type="number" value={form.protein} onChange={(e) => setForm((f) => ({ ...f, protein: e.target.value }))} min="0" step="0.1" />
                  <Input label={t('admin.products.carbs', locale)} type="number" value={form.carbs} onChange={(e) => setForm((f) => ({ ...f, carbs: e.target.value }))} min="0" step="0.1" />
                  <Input label={t('admin.products.fat', locale)} type="number" value={form.fat} onChange={(e) => setForm((f) => ({ ...f, fat: e.target.value }))} min="0" step="0.1" />
                </div>
              </div>

              {/* Image */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
                <h2 className="font-semibold">{t('admin.products.image', locale)}</h2>
                {form.image_url && (
                  <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <Image src={form.image_url} alt="" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
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

              {/* Flags */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="w-4 h-4 accent-wine"
                  />
                  <span className="text-sm font-medium">{t('admin.products.featured', locale)}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 accent-wine"
                  />
                  <span className="text-sm font-medium">{t('admin.products.active', locale)}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Nutrition Tags */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold mb-4">{t('admin.products.nutritionTags', locale)}</h2>
            <div className="flex flex-wrap gap-2">
              {NUTRITION_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({
                      ...f,
                      nutrition_tags: f.nutrition_tags.includes(tag)
                        ? f.nutrition_tags.filter((t) => t !== tag)
                        : [...f.nutrition_tags, tag],
                    }))
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.nutrition_tags.includes(tag)
                      ? 'bg-wine text-white border-wine'
                      : 'border-gray-200 hover:border-wine/50'
                  }`}
                >
                  {t(`nutritionTags.${tag}`, locale) ?? tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={saving}>{t('admin.products.save', locale)}</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
              {t('common.cancel', locale)}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
