import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  const [
    { data: revenueRow },
    { count: orderCount },
    { count: productCount },
    { count: pendingCount },
    { data: recentOrders },
    { data: allOrders },
  ] = await Promise.all([
    // @ts-ignore - Supabase doesn't know about custom RPC
    admin.rpc('get_total_revenue').maybeSingle(),
    admin.from('orders').select('*', { count: 'exact', head: true }),
    admin.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    admin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin
      .from('orders')
      .select('id, order_code, total, status, created_at, shipping_name')
      .order('created_at', { ascending: false })
      .limit(8),
    admin.from('orders').select('status, total, created_at').order('created_at', { ascending: false }),
  ])

  // Daily revenue
  // @ts-ignore
  const { data: dailyRevenue } = await admin.rpc('get_daily_revenue', { days: 30 })

  // Orders by status
  const statusCounts: Record<string, number> = {}
  allOrders?.forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })
  const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  // Top products
  // @ts-ignore
  const { data: topProducts } = await admin.rpc('get_top_products', { limit_n: 5 })

  return NextResponse.json({
    revenue: (revenueRow as any)?.get_total_revenue ?? 0,
    orderCount: orderCount ?? 0,
    productCount: productCount ?? 0,
    pendingCount: pendingCount ?? 0,
    recentOrders: recentOrders ?? [],
    dailyRevenue: dailyRevenue ?? [],
    ordersByStatus,
    topProducts: topProducts ?? [],
  })
}
