'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PromoteMePage() {
  const { locale } = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePromote = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/make-admin', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(t('admin.promoteMe.success', locale))
      router.push('/admin')
    } catch (err) {
      toast.error(t('admin.promoteMe.error', locale))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-wine" />
        </div>
        <h1 className="text-2xl font-serif font-bold mb-4">{t('admin.promoteMe.title', locale)}</h1>
        <p className="text-text-muted mb-6 text-sm">
          {t('admin.promoteMe.notice', locale)}
        </p>
        <Button onClick={handlePromote} loading={loading} className="gap-2">
          <Shield className="w-4 h-4" />
          {t('admin.promoteMe.button', locale)}
        </Button>
      </div>
    </div>
  )
}
