// Validation helpers for Server Actions
// Provides type-safe validation without requiring Zod

type ValidationResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

const validators = {
  string: {
    nonEmpty: (value: unknown): ValidationResult<string> => {
      if (typeof value !== 'string') {
        return { success: false, error: 'Must be a string' }
      }
      if (value.trim().length === 0) {
        return { success: false, error: 'Field is required' }
      }
      return { success: true, data: value.trim() }
    },
    min: (min: number) => (value: unknown): ValidationResult<string> => {
      if (typeof value !== 'string') {
        return { success: false, error: 'Must be a string' }
      }
      if (value.trim().length < min) {
        return { success: false, error: `Must be at least ${min} characters` }
      }
      return { success: true, data: value.trim() }
    },
    max: (max: number) => (value: unknown): ValidationResult<string> => {
      if (typeof value !== 'string') {
        return { success: false, error: 'Must be a string' }
      }
      if (value.trim().length > max) {
        return { success: false, error: `Must be at most ${max} characters` }
      }
      return { success: true, data: value.trim() }
    },
  },
  number: {
    positive: (value: unknown): ValidationResult<number> => {
      const num = typeof value === 'number' ? value : parseInt(String(value), 10)
      if (isNaN(num)) {
        return { success: false, error: 'Must be a valid number' }
      }
      if (num <= 0) {
        return { success: false, error: 'Must be a positive number' }
      }
      return { success: true, data: num }
    },
    nonNegative: (value: unknown): ValidationResult<number> => {
      const num = typeof value === 'number' ? value : parseInt(String(value), 10)
      if (isNaN(num)) {
        return { success: false, error: 'Must be a valid number' }
      }
      if (num < 0) {
        return { success: false, error: 'Must be a non-negative number' }
      }
      return { success: true, data: num }
    },
  },
  email: (value: unknown): ValidationResult<string> => {
    if (typeof value !== 'string') {
      return { success: false, error: 'Must be a string' }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value.trim())) {
      return { success: false, error: 'Invalid email address' }
    }
    return { success: true, data: value.trim().toLowerCase() }
  },
  phone: (value: unknown): ValidationResult<string> => {
    if (typeof value !== 'string') {
      return { success: false, error: 'Must be a string' }
    }
    const cleaned = value.replace(/[\s\-\.\(\)]/g, '')
    const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/
    if (!phoneRegex.test(cleaned)) {
      return { success: false, error: 'Invalid phone number' }
    }
    return { success: true, data: value.trim() }
  },
}

function validateForm<T extends Record<string, unknown>>(
  schema: Record<string, (v: unknown) => ValidationResult>,
  data: T
): { success: true; data: T } | { success: false; error: string } {
  const errors: string[] = []
  const result: Record<string, unknown> = {}

  for (const [key, validator] of Object.entries(schema)) {
    const res = validator(data[key])
    if (res.success) {
      result[key] = res.data
    } else {
      errors.push(`${key}: ${res.error}`)
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join('; ') }
  }

  return { success: true, data: result as T }
}

export { validators, validateForm }
export type { ValidationResult }
