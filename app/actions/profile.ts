'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { validators } from '@/lib/validation'

interface ProfileFormData {
  full_name?: string
  phone?: string
  address?: string
  city?: string
}

function validateProfileData(data: unknown): { success: true; data: ProfileFormData } | { success: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Invalid input data' }
  }

  const input = data as Record<string, unknown>
  const errors: string[] = []
  const result: ProfileFormData = {}

  if (input.full_name !== undefined && input.full_name !== null && input.full_name !== '') {
    const r = validators.string.nonEmpty(input.full_name)
    if (!r.success) {
      errors.push(`full_name: ${r.error}`)
    } else {
      result.full_name = r.data
    }
  }

  if (input.phone !== undefined && input.phone !== null && input.phone !== '') {
    const r = validators.phone(input.phone)
    if (!r.success) {
      errors.push(`phone: ${r.error}`)
    } else {
      result.phone = r.data
    }
  }

  if (input.address !== undefined && input.address !== null && input.address !== '') {
    const r = validators.string.nonEmpty(input.address)
    if (!r.success) {
      errors.push(`address: ${r.error}`)
    } else {
      result.address = r.data
    }
  }

  if (input.city !== undefined && input.city !== null && input.city !== '') {
    const r = validators.string.nonEmpty(input.city)
    if (!r.success) {
      errors.push(`city: ${r.error}`)
    } else {
      result.city = r.data
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join('; ') }
  }

  return { success: true, data: result }
}

export async function updateProfileAction(
  formData: unknown
): Promise<{ success: true; message?: string } | { success: false; error: string }> {
  const validation = validateProfileData(formData)
  if (!validation.success) {
    return validation
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to update your profile.' }
  }

  const profileData = validation.data
  const hasUpdates = Object.keys(profileData).some(
    key => profileData[key as keyof ProfileFormData] !== undefined
  )

  if (!hasUpdates) {
    return { success: false, error: 'No fields to update' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: `Failed to update profile: ${error.message}` }
  }

  revalidatePath('/account')
  revalidatePath('/account/orders')

  return {
    success: true,
    message: 'Profile updated successfully'
  }
}
