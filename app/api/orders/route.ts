import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateOrderCode() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `HF${ts}${rand}`
}

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const isAdmin = searchParams.get('admin') === 'true'

  if (isAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    return NextResponse.json({ orders: orders ?? [] })
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ orders: orders ?? [] })
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json()
  const {
    items = [],
    shipping_name,
    shipping_phone,
    shipping_address,
    shipping_city,
    payment_method = 'vnpay',
    notes,
  } = body

  if (!items?.length) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const productIds = items.map((i: any) => i.product_id)
  const { data: products } = await supabase
    .from('products')
    .select('id, name_vi, name_en, price, sale_price, image_url, stock')
    .in('id', productIds)

  const productMap = new Map(products?.map((p: any) => [p.id, p]))
  let total = 0
  const orderItems = []

  for (const item of items) {
    const p = productMap.get(item.product_id) as any
    if (!p) continue
    const price = parseFloat(p.sale_price ?? p.price)
    const subtotal = price * item.quantity
    total += subtotal
    orderItems.push({
      product_id: p.id,
      product_name_snapshot: p.name_vi,
      product_image_snapshot: p.image_url,
      price_snapshot: price,
      quantity: item.quantity,
      subtotal,
    })
  }

  const orderCode = generateOrderCode()

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      order_code: orderCode,
      total,
      status: 'pending',
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city: shipping_city ?? null,
      payment_method,
      payment_status: 'pending',
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('order_items').insert(
    orderItems.map((oi) => ({ ...oi, order_id: order.id }))
  )

  if (user?.id) {
    await supabase.from('cart_items').delete().eq('user_id', user.id)
  }

  return NextResponse.json({ order })
}
