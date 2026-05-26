'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { validators } from '@/lib/validation'

interface CartInput {
  productId: number
  quantity: number
}

function validateCartInput(data: unknown): { success: true; data: CartInput } | { success: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Invalid input data' }
  }

  const input = data as Record<string, unknown>

  const productIdResult = validators.number.positive(input.productId)
  if (!productIdResult.success) {
    return { success: false, error: productIdResult.error }
  }

  let quantity = 1
  if (input.quantity !== undefined) {
    const quantityResult = validators.number.positive(input.quantity)
    if (!quantityResult.success) {
      return { success: false, error: quantityResult.error }
    }
    quantity = quantityResult.data
  }

  return { success: true, data: { productId: productIdResult.data, quantity } }
}

export async function addToCartAction(
  input: unknown
): Promise<{ success: true; data?: { id: number; quantity: number } } | { success: false; error: string }> {
  const validation = validateCartInput(input)
  if (!validation.success) {
    return validation
  }

  const { productId, quantity } = validation.data

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to add items to cart.' }
  }

  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: user.id, product_id: productId, quantity },
      { onConflict: 'user_id,product_id' }
    )
    .select('id, quantity')
    .single()

  if (error) {
    return { success: false, error: `Failed to add item to cart: ${error.message}` }
  }

  revalidatePath('/cart')
  revalidatePath('/checkout')

  return { success: true, data: { id: data.id, quantity: data.quantity } }
}

export async function updateCartItemAction(
  input: unknown
): Promise<{ success: true; data?: { quantity: number } } | { success: false; error: string }> {
  const validation = validateCartInput(input)
  if (!validation.success) {
    return validation
  }

  const { productId, quantity } = validation.data

  if (quantity <= 0) {
    const removeResult = await removeCartItemAction(productId)
    return removeResult
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to update cart items.' }
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .select('quantity')
    .single()

  if (error) {
    return { success: false, error: `Failed to update cart item: ${error.message}` }
  }

  if (!data) {
    return { success: false, error: 'Cart item not found' }
  }

  revalidatePath('/cart')
  revalidatePath('/checkout')

  return { success: true, data: { quantity: data.quantity } }
}

export async function removeCartItemAction(
  productId: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  const productIdResult = validators.number.positive(productId)
  if (!productIdResult.success) {
    return { success: false, error: productIdResult.error }
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to remove cart items.' }
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productIdResult.data)

  if (error) {
    return { success: false, error: `Failed to remove cart item: ${error.message}` }
  }

  revalidatePath('/cart')
  revalidatePath('/checkout')

  return { success: true }
}

export async function clearCartAction(): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to clear cart.' }
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: `Failed to clear cart: ${error.message}` }
  }

  revalidatePath('/cart')
  revalidatePath('/checkout')

  return { success: true }
}
