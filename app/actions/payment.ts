'use server'

import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function generateSandboxToken(orderId: string, success: boolean, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({ order_id: orderId, success, ts: Date.now() })
  ).toString('base64url')
  const sig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return `${payload}.${sig}`
}

export type InitPaymentResult =
  | { success: true; successToken: string; failedToken: string; orderCode: string }
  | { success: false; error: string }

export async function initPaymentAction(orderId: number): Promise<InitPaymentResult> {
  const secret = process.env.VNPAY_SANDBOX_SECRET ?? ''

  const supabase = createAdminClient()

  // Fetch order to get order_code
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_code')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Order not found' }
  }

  // Generate both tokens (success and failure)
  const successToken = generateSandboxToken(String(orderId), true, secret)
  const failedToken = generateSandboxToken(String(orderId), false, secret)

  return {
    success: true,
    successToken,
    failedToken,
    orderCode: order.order_code,
  }
}
