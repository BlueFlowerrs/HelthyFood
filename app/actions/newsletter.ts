'use server'

import { createClient } from '@/lib/supabase/server'
import { validators } from '@/lib/validation'

function validateEmailInput(email: unknown): { success: true; email: string } | { success: false; error: string } {
  const result = validators.email(email)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, email: result.data }
}

export async function subscribeNewsletterAction(
  email: unknown
): Promise<{ success: true; message?: string } | { success: false; error: string }> {
  const validation = validateEmailInput(email)
  if (!validation.success) {
    return validation
  }

  const supabase = createClient()

  const { data: existing, error: checkError } = await supabase
    .from('newsletter_subscribers')
    .select('id, email')
    .eq('email', validation.email)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    if (checkError.code === '42P01') {
      return {
        success: false,
        error: 'Newsletter subscription is temporarily unavailable. Please try again later.'
      }
    }
    return { success: false, error: `Failed to check subscription status: ${checkError.message}` }
  }

  if (existing) {
    return {
      success: true,
      message: 'You are already subscribed to our newsletter!'
    }
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email: validation.email,
      active: true,
    })

  if (error) {
    if (error.code === '23505') {
      return {
        success: true,
        message: 'You are already subscribed to our newsletter!'
      }
    }
    if (error.code === '42P01') {
      return {
        success: false,
        error: 'Newsletter subscription is temporarily unavailable. Please try again later.'
      }
    }
    return { success: false, error: `Failed to subscribe: ${error.message}` }
  }

  return {
    success: true,
    message: 'Thank you for subscribing to our newsletter!'
  }
}

export async function unsubscribeNewsletterAction(
  email: unknown
): Promise<{ success: true; message?: string } | { success: false; error: string }> {
  const validation = validateEmailInput(email)
  if (!validation.success) {
    return validation
  }

  const supabase = createClient()

  const { data: existing, error: checkError } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .eq('email', validation.email)
    .single()

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      return {
        success: false,
        error: 'This email is not subscribed to our newsletter.'
      }
    }
    return { success: false, error: `Failed to unsubscribe: ${checkError.message}` }
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ active: false })
    .eq('id', existing.id)

  if (error) {
    return { success: false, error: `Failed to unsubscribe: ${error.message}` }
  }

  return {
    success: true,
    message: 'You have been successfully unsubscribed from our newsletter.'
  }
}
