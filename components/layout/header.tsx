"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { ShoppingCart, Globe, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const [itemCount, setItemCount] = useState(0)
  
  useEffect(() => {
    setItemCount(useCartStore.getState().getItemCount())
    const unsubscribe = useCartStore.subscribe((state) => {
      setItemCount(state.getItemCount())
    })
    return unsubscribe
  }, [])

  const toggleLocale = async () => {
    const newLocale = locale === 'el' ? 'en' : 'el'
    
    // Set locale in cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
    
    // Refresh to apply new locale
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image 
            src="/logo.webp" 
            alt="Τίνκερμπελ - Παιδικά ρούχα, βαπτιστικά, στολισμοί" 
            width={240} 
            height={50}
            style={{ objectFit: 'contain', height: '50px', width: 'auto' }}
            priority
          />
        </Link>
        
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            {t('home')}
          </Link>
          <Link href="/shop" className="transition-colors hover:text-primary">
            {t('shop')}
          </Link>
          <div className="relative group">
            <button className="transition-colors hover:text-primary py-2">
              {t('gallery')}
            </button>
            <div className="absolute left-0 top-full w-48 rounded-md shadow-lg bg-background border hidden group-hover:block">
              <div className="py-1">
                <Link href="/gallery/baptism" className="block px-4 py-2 text-sm hover:bg-accent">
                  {t('baptism')}
                </Link>
                <Link href="/gallery/decorations" className="block px-4 py-2 text-sm hover:bg-accent">
                  {t('decorations')}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLocale}
            title={locale === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
          >
            <Globe className="h-5 w-5" />
          </Button>

          <Link href="/admin-login">
            <Button variant="ghost" size="icon" title="Admin Login">
              <LogIn className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

