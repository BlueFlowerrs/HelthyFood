import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function verifyVNPayReturn(query: URLSearchParams, hashSecret: string): boolean {
  const receivedHash = query.get('vnp_SecureHash')
  if (!receivedHash) return false

  const fields: Record<string, string> = {}
  query.forEach((value, key) => {
    if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
      fields[key] = value
    }
  })

  const sortedKeys = Object.keys(fields).sort()
  const signData = sortedKeys
    .map((key) => {
      const encodedKey = encodeURIComponent(key)
      const encodedVal = encodeURIComponent(fields[key]).replace(/%20/g, '+')
      return `${encodedKey}=${encodedVal}`
    })
    .join('&')

  const calculatedHash = crypto
    .createHmac('sha512', hashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')

  return calculatedHash.toLowerCase() === receivedHash.toLowerCase()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const hashSecret = process.env.VNPAY_HASH_SECRET ?? ''

  if (!hashSecret) {
    return NextResponse.redirect(
      new URL('/checkout/payment?error=server_config', req.url)
    )
  }

  // Verify VNPAY signature
  const isValid = verifyVNPayReturn(searchParams, hashSecret)
  if (!isValid) {
    return NextResponse.redirect(
      new URL('/checkout/payment?error=invalid_signature', req.url)
    )
  }

  const responseCode = searchParams.get('vnp_ResponseCode')
  const transactionStatus = searchParams.get('vnp_TransactionStatus')
  const orderCode = searchParams.get('vnp_TxnRef')
  const amount = searchParams.get('vnp_Amount')

  const supabase = createAdminClient()

  // Find order by order_code
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_code')
    .eq('order_code', orderCode)
    .single()

  if (!order) {
    return NextResponse.redirect(
      new URL('/checkout/payment?error=order_not_found', req.url)
    )
  }

  // Update order based on payment result
  const isSuccess = responseCode === '00' && transactionStatus === '00'

  await supabase
    .from('orders')
    .update({
      status: isSuccess ? 'paid' : 'pending',
      payment_status: isSuccess ? 'paid' : 'failed',
    })
    .eq('id', order.id)

  // Record payment
  await supabase.from('payments').insert({
    order_id: order.id,
    amount: amount ? parseInt(amount) / 100 : 0,
    status: isSuccess ? 'paid' : 'failed',
    method: 'vnpay',
    transaction_id: searchParams.get('vnp_TransactionNo') ?? `vnpay_${orderCode}`,
    payload: Object.fromEntries(searchParams.entries()),
  })

  // Redirect to success or failure page
  if (isSuccess) {
    return NextResponse.redirect(
      new URL(`/checkout/success?order_code=${orderCode}`, req.url)
    )
  } else {
    return NextResponse.redirect(
      new URL(`/checkout/payment?error=payment_failed&order_code=${orderCode}&order_id=${order.id}`, req.url)
    )
  }
}
