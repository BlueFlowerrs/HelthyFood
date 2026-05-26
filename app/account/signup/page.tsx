'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'

export default function SignUpPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const supabase = createClient()

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.full_name.trim()) errs.full_name = t('auth.errors.nameRequired', locale)
    if (!form.email.trim()) errs.email = t('auth.errors.emailRequired', locale)
    if (form.password.length < 8) errs.password = t('auth.errors.weakPassword', locale)
    if (form.password !== form.confirmPassword) errs.confirmPassword = t('auth.errors.passwordsNotMatch', locale)
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
      },
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(locale === 'vi' ? 'Đăng ký thành công!' : 'Signed up successfully!')
      router.push('/account')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold">{t('auth.signup.title', locale)}</h1>
          <p className="text-text-muted mt-2">{t('auth.signup.subtitle', locale)}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">{t('auth.signup.fullName', locale)}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  required
                  className="pl-10"
                  error={errors.full_name}
                />
              </div>
            </div>

            <div>
              <label className="input-label">{t('auth.signup.email', locale)}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  className="pl-10"
                  error={errors.email}
                />
              </div>
            </div>

            <div>
              <label className="input-label">{t('auth.signup.password', locale)}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10"
                  error={errors.password}
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

            <div>
              <label className="input-label">{t('auth.signup.confirmPassword', locale)}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="pl-10"
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              {t('auth.signup.submit', locale)}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              {t('auth.signup.hasAccount', locale)}{' '}
              <Link href="/account/signin" className="text-wine font-medium hover:text-wine-dark">
                {t('auth.signup.signinLink', locale)}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
