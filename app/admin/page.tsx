'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ShoppingCart, Package, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import AdminSidebar from './_components/Sidebar'
import { Skeleton } from '@/components/ui/Skeleton'

import { formatPrice } from '@/lib/format'

const STATUS_COLORS: Record<string, string> = {
  pending: '#d4a574',
  paid: '#405C36',
  failed: '#8B2C4C',
  shipped: '#3b82f6',
  delivered: '#059669',
  cancelled: '#6b7280',
}

const PIE_COLORS = ['#8B2C4C', '#405C36', '#d4a574', '#3b82f6', '#059669', '#6b7280']

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) return null
      return res.json()
    },
  })

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Bảng Điều Khiển</h1>
          <p className="text-text-muted">Tổng quan hoạt động cửa hàng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : (
            <>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-wine/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-wine" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-text-muted mb-1">Tổng doanh thu</p>
                <p className="text-2xl font-bold">{formatPrice(stats?.revenue ?? 0)}đ</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    +12%
                  </span>
                </div>
                <p className="text-sm text-text-muted mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold">{stats?.orderCount ?? 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <p className="text-sm text-text-muted mb-1">Sản phẩm</p>
                <p className="text-2xl font-bold">{stats?.productCount ?? 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-tan/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-tan" />
                  </div>
                </div>
                <p className="text-sm text-text-muted mb-1">Đơn chờ xử lý</p>
                <p className="text-2xl font-bold">{stats?.pendingCount ?? 0}</p>
              </div>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold mb-4">Doanh thu 30 ngày</h2>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats?.dailyRevenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => formatPrice(value) + 'đ'} />
                  <Bar dataKey="revenue" fill="#8B2C4C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold mb-4">Đơn hàng theo trạng thái</h2>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats?.ordersByStatus ?? []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {(stats?.ordersByStatus ?? []).map((entry: any, i: number) => (
                      <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold mb-4">Đơn hàng gần đây</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-text-muted">
                  <th className="pb-3 font-semibold">Mã đơn</th>
                  <th className="pb-3 font-semibold">Khách hàng</th>
                  <th className="pb-3 font-semibold">Tổng tiền</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.recentOrders ?? []).map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono text-sm">{order.order_code}</td>
                    <td className="py-3 text-sm">{order.shipping_name}</td>
                    <td className="py-3 text-sm font-semibold">{formatPrice(order.total)}đ</td>
                    <td className="py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: STATUS_COLORS[order.status] ?? '#6b7280' }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
