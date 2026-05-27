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
  | { success: true; vnpUrl: string; orderCode: string; isSandbox: boolean }
  | { success: false; error: string }

export async function initPaymentAction(orderId: number): Promise<InitPaymentResult> {
  const supabase = createAdminClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_code, total, payment_status')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Order not found' }
  }

  if (order.payment_status === 'paid') {
    return { success: false, error: 'Order already paid' }
  }

  const tmnCode = process.env.VNPAY_TMN_CODE ?? ''
  const hashSecret = process.env.VNPAY_HASH_SECRET ?? ''
  const vnpUrl = process.env.VNPAY_URL ?? ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!tmnCode || !hashSecret || !vnpUrl) {
    return { success: false, error: 'VNPAY not configured' }
  }

  // Build VNPAY parameters
  const vnpVersion = '2.1.0'
  const vnpCommand = 'pay'
  const vnpOrderType = 'other'
  const vnpTxnRef = order.order_code
  const vnpAmount = Math.round(order.total * 100) // VNPAY expects amount in centiseconds
  const vnpIpAddr = '127.0.0.1'
  const vnpLocale = 'vn'
  const vnpCurrCode = 'VND'
  const formatGMT7Date = (date: Date): string => {
    const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000)
    const iso = gmt7.toISOString()
    const yyyymmdd = iso.slice(0, 10).replace(/-/g, '')
    const hhmmss = iso.slice(11, 19).replace(/:/g, '')
    return yyyymmdd + hhmmss
  }

  const vnpCreateDate = formatGMT7Date(new Date())
  const vnpExpireDate = formatGMT7Date(new Date(Date.now() + 15 * 60 * 1000))


  const vnpParams: Record<string, string> = {
    vnp_Version: vnpVersion,
    vnp_Command: vnpCommand,
    vnp_TmnCode: tmnCode,
    vnp_TxnRef: vnpTxnRef,
    vnp_OrderInfo: `Thanh toan don hang ${order.order_code}`,
    vnp_OrderType: vnpOrderType,
    vnp_Amount: String(vnpAmount),
    vnp_Locale: vnpLocale,
    vnp_CurrCode: vnpCurrCode,
    vnp_IpAddr: vnpIpAddr,
    vnp_CreateDate: vnpCreateDate,
    vnp_ExpireDate: vnpExpireDate,
    vnp_ReturnUrl: `${appUrl}/api/payments/vnpay/return`,
  }

  // Sort keys alphabetically
  const sortedKeys = Object.keys(vnpParams).sort()

  // Build the signing query string using URL-encoded values
  // spaces must be encoded as "+" instead of "%20" to match VNPAY's signature rules
  const signData = sortedKeys
    .map((key) => {
      const encodedKey = encodeURIComponent(key)
      const encodedVal = encodeURIComponent(vnpParams[key]).replace(/%20/g, '+')
      return `${encodedKey}=${encodedVal}`
    })
    .join('&')

  const vnpSecureHash = crypto
    .createHmac('sha512', hashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')

  // Build the final query string for the URL using the exact same encoding
  const queryParts = sortedKeys.map((key) => {
    const encodedKey = encodeURIComponent(key)
    const encodedVal = encodeURIComponent(vnpParams[key]).replace(/%20/g, '+')
    return `${encodedKey}=${encodedVal}`
  })
  queryParts.push(`vnp_SecureHash=${vnpSecureHash}`)

  const paymentUrl = `${vnpUrl}?${queryParts.join('&')}`

  return {
    success: true,
    vnpUrl: paymentUrl,
    orderCode: order.order_code,
    isSandbox: true,
  }
}
