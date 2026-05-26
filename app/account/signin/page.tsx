'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'

export default function SignInPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const supabase = createClient()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError(t('auth.errors.invalidCredentials', locale))
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(t('auth.errors.invalidCredentials', locale))
    } else {
      toast.success(locale === 'vi' ? 'Đăng nhập thành công!' : 'Signed in successfully!')
      router.push('/account')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold">{t('auth.signin.title', locale)}</h1>
          <p className="text-text-muted mt-2">{t('auth.signin.subtitle', locale)}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">{t('auth.signin.email', locale)}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="input-label">{t('auth.signin.password', locale)}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-text-dark"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {t('auth.signin.submit', locale)}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-text-muted">
              {t('auth.signin.noAccount', locale)}{' '}
              <Link href="/account/signup" className="text-wine font-medium hover:text-wine-dark">
                {t('auth.signin.signupLink', locale)}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
