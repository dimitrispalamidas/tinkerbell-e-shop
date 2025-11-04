import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, locale: string = 'el'): string {
  // Map locale to valid Intl locale identifiers
  const localeMap: Record<string, string> = {
    'el': 'el-GR',
    'en': 'en-US',
  }
  
  const validLocale = localeMap[locale] || 'el-GR'
  
  return new Intl.NumberFormat(validLocale, {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

