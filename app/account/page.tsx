'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, User, ChevronRight, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLocale } from '@/providers/LocaleProvider'
import { useUser } from '@/hooks/useUser'
import { t } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AccountPage() {
  const { locale } = useLocale()
  const { user, loading: userLoading } = useUser()
  const supabase = createClient()

  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '', city: '' })
  const [saving, setSaving] = useState(false)

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders')
      const data = await res.json()
      return data.orders ?? []
    },
  })

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
      return data
    },
    enabled: !!user,
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleUpdateProfile = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user?.id)

    if (error) {
      toast.error(t('common.error', locale))
    } else {
      toast.success(t('common.success', locale))
    }
    setSaving(false)
  }

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <p>{t('common.loading', locale)}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="bg-brand-green-dark text-white py-12">
        <div className="container-main">
          <h1 className="text-3xl font-serif font-bold">
            {t('account.welcome', locale)}, {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </h1>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Form */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-wine" />
                <h2 className="font-semibold">{t('account.profile', locale)}</h2>
              </div>

              {profileLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('account.fullName', locale)}</label>
                    <input
                      type="text"
                      value={profile.full_name || profileData?.full_name || ''}
                      onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('account.email', locale)}</label>
                    <input type="email" value={user.email ?? ''} disabled className="input-field opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('account.phone', locale)}</label>
                    <input
                      type="tel"
                      value={profile.phone || profileData?.phone || ''}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('account.city', locale)}</label>
                    <input
                      type="text"
                      value={profile.city || profileData?.city || ''}
                      onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium mb-1 block">{t('account.address', locale)}</label>
                    <input
                      type="text"
                      value={profile.address || profileData?.address || ''}
                      onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button onClick={handleUpdateProfile} loading={saving}>
                      {t('account.updateProfile', locale)}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-wine" />
                <h2 className="font-semibold">{t('account.orderHistory', locale)}</h2>
              </div>

              {ordersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-muted mb-4">{t('account.noOrders', locale)}</p>
                  <Link href="/shop">
                    <Button size="sm">{t('cart.shopNow', locale)}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-wine/30 hover:bg-wine/5 transition-colors"
                    >
                      <div>
                        <p className="font-mono font-semibold text-sm">{order.order_code}</p>
                        <p className="text-xs text-text-muted">
                          {formatDate(order.created_at)} · {formatPrice(order.total)}đ
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={order.status === 'paid' ? 'green' : order.status === 'pending' ? 'tan' : 'wine'}>
                          {t(`order.status.${order.status}`, locale)}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-serif font-bold text-wine">
                    {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                </div>
                <p className="font-semibold">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-wine/5 text-wine font-medium"
                >
                  <User className="w-4 h-4" />
                  {t('account.profile', locale)}
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  {t('account.orderHistory', locale)}
                </Link>
                <Link
                  href="/track"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  {t('nav.trackOrder', locale)}
                </Link>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-500 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('account.signout', locale)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
