import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function verifySandboxToken(token: string, secret: string): { order_id: string; success: boolean } | null {
  try {
    const [encodedPayload, providedSig] = token.split('.')
    if (!encodedPayload || !providedSig) return null

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(providedSig))) {
      return null
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf8'))

    // Token expires after 10 minutes
    if (Date.now() - payload.ts > 10 * 60 * 1000) {
      return null
    }

    return { order_id: String(payload.order_id), success: Boolean(payload.success) }
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { token } = body

  const secret = process.env.VNPAY_SANDBOX_SECRET ?? ''
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfiguration: VNPAY_SANDBOX_SECRET not set' }, { status: 500 })
  }

  const payload = verifySandboxToken(token, secret)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired payment token' }, { status: 403 })
  }

  const supabase = createAdminClient()

  const newStatus = payload.success ? 'paid' : 'failed'

  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: newStatus,
      payment_status: newStatus,
    })
    .eq('id', payload.order_id)

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  // Insert payment record
  await supabase
    .from('payments')
    .insert({
      order_id: parseInt(payload.order_id),
      amount: 0,
      status: newStatus,
      method: 'vnpay_sandbox',
      transaction_id: `vnpay_sim_${payload.order_id}_${Date.now()}`,
      payload: { simulated: true, token },
    })

  return NextResponse.json({ success: true, status: newStatus })
}
