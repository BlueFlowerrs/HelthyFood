'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, User, ChevronRight, LogOut, Settings, ShieldCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLocale } from '@/providers/LocaleProvider'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { formatVND, cn } from '@/lib/cn'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-[#d4a574]/15 text-[#a07a3d] border-[#d4a574]/30',
  paid: 'bg-[#405C36]/15 text-[#405C36] border-[#405C36]/30',
  failed: 'bg-[#8B2C4C]/15 text-[#8B2C4C] border-[#8B2C4C]/30',
  shipped: 'bg-blue-500/15 text-blue-700 border-blue-300',
  delivered: 'bg-[#223D19]/15 text-[#223D19] border-[#223D19]/30',
  cancelled: 'bg-gray-200 text-gray-600 border-gray-300',
}

export default function AccountPage() {
  const { locale, t } = useLocale()
  const { user, loading: userLoading } = useUser()
  const supabase = createClient()

  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders')

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders')
      const data = await res.json()
      return data.orders ?? []
    },
    enabled: !!user,
  })

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
      return data
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (profileData) {
      setProfile({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
      })
    }
  }, [profileData])

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
      toast.error(t('common.error') || 'Đã có lỗi xảy ra')
    } else {
      toast.success(t('common.success') || 'Cập nhật thành công')
    }
    setSaving(false)
  }

  if (userLoading || !user) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen flex items-center justify-center">
          <div className="text-center">{t('common.loading') || 'Đang tải...'}</div>
        </main>
        <Footer />
      </>
    )
  }

  const isAdmin = profileData?.role === 'admin'

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium mb-2">
            {t('account.title') || 'Tài khoản của tôi'}
          </h1>
          <p className="text-[#070B06]/60">{user.email}</p>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B2C4C] to-[#405C36] mb-3 flex items-center justify-center text-white font-serif text-xl">
                {(profile.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="text-sm font-medium text-[#070B06]">
                {profile.full_name || user.email?.split('@')[0]}
              </div>
              <div className="text-xs text-[#070B06]/50 truncate">
                {user.email}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('orders')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors text-left',
                activeTab === 'orders'
                  ? 'bg-[#070B06] text-white'
                  : 'text-[#070B06]/70 hover:bg-white'
              )}
            >
              <Package className="w-4 h-4" />
              {t('account.orderHistory') || 'Lịch sử đơn hàng'}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors text-left',
                activeTab === 'profile'
                  ? 'bg-[#070B06] text-white'
                  : 'text-[#070B06]/70 hover:bg-white'
              )}
            >
              <User className="w-4 h-4" />
              {t('account.profile') || 'Thông tin cá nhân'}
            </button>

            {isAdmin && (
              <a
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors text-[#070B06]/70 hover:bg-white"
              >
                <ShieldCheck className="w-4 h-4" />
                {t('nav.admin') || 'Quản trị viên'}
              </a>
            )}

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              {t('account.signout') || 'Đăng xuất'}
            </button>
          </aside>

          {/* Main Content Area */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100">
            {activeTab === 'orders' ? (
              <div>
                <h2 className="font-serif text-2xl text-[#070B06] mb-6">
                  {t('account.orderHistory') || 'Lịch sử đơn hàng'}
                </h2>

                {ordersLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-10 h-10 text-[#070B06]/30 mx-auto mb-4" />
                    <p className="text-[#070B06]/60 mb-4">
                      {t('account.noOrders') || 'Bạn chưa có đơn hàng nào.'}
                    </p>
                    <a href="/shop">
                      <Button variant="primary" size="md">
                        {t('cart.shopNow') || 'Mua sắm ngay'}
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o: any) => (
                      <Link
                        key={o.id}
                        href={`/account/orders/${o.id}`}
                        className="flex items-center justify-between p-5 rounded-2xl bg-[#DAD6D6]/40 hover:bg-[#070B06] hover:text-white transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm font-medium">
                              {o.order_code}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border',
                                STATUS_COLORS[o.status] || 'bg-gray-200'
                              )}
                            >
                              {t(`order.status.${o.status}`) || o.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#070B06]/55 group-hover:text-white/60 transition-colors">
                            {new Date(o.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-lg">
                            {formatVND(o.total)}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-[#070B06]/50 group-hover:text-white/60 transition-colors flex items-center justify-end gap-1">
                            {t('account.viewDetail') || 'Chi tiết'} <ChevronRight className="w-3 h-3" />
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="font-serif text-2xl text-[#070B06] mb-6">
                  {t('account.profile') || 'Thông tin cá nhân'}
                </h2>

                {profileLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#070B06]/60 mb-2 font-medium">
                        {t('account.fullName') || 'Họ và tên'}
                      </label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                        className="w-full h-12 px-4 rounded-full border border-[#070B06]/15 bg-white text-sm focus:border-[#405C36] focus:outline-none focus:ring-2 focus:ring-[#405C36]/15 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#070B06]/60 mb-2 font-medium">
                        {t('account.email') || 'Email'}
                      </label>
                      <input
                        type="email"
                        value={user.email ?? ''}
                        disabled
                        className="w-full h-12 px-4 rounded-full border border-[#070B06]/15 bg-gray-50 text-sm opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#070B06]/60 mb-2 font-medium">
                        {t('account.phone') || 'Số điện thoại'}
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full h-12 px-4 rounded-full border border-[#070B06]/15 bg-white text-sm focus:border-[#405C36] focus:outline-none focus:ring-2 focus:ring-[#405C36]/15 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#070B06]/60 mb-2 font-medium">
                        {t('account.city') || 'Tỉnh / Thành phố'}
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                        className="w-full h-12 px-4 rounded-full border border-[#070B06]/15 bg-white text-sm focus:border-[#405C36] focus:outline-none focus:ring-2 focus:ring-[#405C36]/15 transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-[#070B06]/60 mb-2 font-medium">
                        {t('account.address') || 'Địa chỉ giao hàng'}
                      </label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                        className="w-full h-12 px-4 rounded-full border border-[#070B06]/15 bg-white text-sm focus:border-[#405C36] focus:outline-none focus:ring-2 focus:ring-[#405C36]/15 transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-2 pt-2">
                      <Button onClick={handleUpdateProfile} loading={saving} variant="primary" size="md">
                        {t('account.updateProfile') || 'Lưu thay đổi'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  )
}
