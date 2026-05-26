'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/account/signin')
      return
    }

    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.role !== 'admin') {
          router.push('/account')
        }
      })
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
