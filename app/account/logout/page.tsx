'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.push('/')
      router.refresh()
    })
  }, [])

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center">
      <p className="text-text-muted">Đang đăng xuất...</p>
    </div>
  )
}
