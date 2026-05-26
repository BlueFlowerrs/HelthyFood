import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const body = await req.json()
  const { order_id, amount } = body

  if (!order_id) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
  }

  const transactionId = `VNP${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      order_id,
      amount: parseFloat(amount) || 0,
      method: 'vnpay',
      status: 'pending',
      transaction_id: transactionId,
      payload: body,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    transaction_id: transactionId,
    payment_id: payment.id,
    amount: parseFloat(amount) || 0,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/vnpay/callback`,
  })
}
