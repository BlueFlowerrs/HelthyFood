'use server'

import { createClient } from '@/lib/supabase/server'
import { validators } from '@/lib/validation'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
}

function validateContactData(data: unknown): { success: true; data: ContactFormData } | { success: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Invalid input data' }
  }

  const input = data as Record<string, unknown>
  const errors: string[] = []
  const result: Partial<ContactFormData> = {}

  const nameResult = validators.string.nonEmpty(input.name)
  if (!nameResult.success) {
    errors.push(`name: ${nameResult.error}`)
  } else {
    result.name = nameResult.data
  }

  const emailResult = validators.email(input.email)
  if (!emailResult.success) {
    errors.push(`email: ${emailResult.error}`)
  } else {
    result.email = emailResult.data
  }

  if (input.phone !== undefined && input.phone !== null && input.phone !== '') {
    const phoneResult = validators.phone(input.phone)
    if (!phoneResult.success) {
      errors.push(`phone: ${phoneResult.error}`)
    } else {
      result.phone = phoneResult.data
    }
  }

  const messageResult = validators.string.min(10)(input.message)
  if (!messageResult.success) {
    errors.push(`message: ${messageResult.error}`)
  } else {
    const maxResult = validators.string.max(2000)(input.message)
    if (!maxResult.success) {
      errors.push(`message: ${maxResult.error}`)
    } else {
      result.message = maxResult.data
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join('; ') }
  }

  return { success: true, data: result as ContactFormData }
}

export async function createContactMessageAction(
  formData: unknown
): Promise<{ success: true; message?: string } | { success: false; error: string }> {
  const validation = validateContactData(formData)
  if (!validation.success) {
    return validation
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('contact_messages')
    .insert({
      name: validation.data.name,
      email: validation.data.email,
      phone: validation.data.phone || null,
      message: validation.data.message,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '42P01') {
      return {
        success: false,
        error: 'Contact form is temporarily unavailable. Please try again later or email us directly.'
      }
    }
    return { success: false, error: `Failed to submit contact form: ${error.message}` }
  }

  return {
    success: true,
    message: 'Thank you for your message! We will get back to you soon.',
  }
}
