import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const supabase = createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_code', params.code)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}
