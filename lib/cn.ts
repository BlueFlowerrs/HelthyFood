import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVND(value: number | string | null | undefined) {
  if (value === null || value === undefined) return ""
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ""
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + '₫'
}

