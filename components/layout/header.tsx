"use client"

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { ShoppingCart, Globe, LogIn, Menu, X, Home, Store, Image as ImageIcon, Mail, Baby } from 'lucide-react'
import { BsBalloonHeart } from 'react-icons/bs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { MiniCartSidebar } from '@/components/cart/mini-cart-sidebar'

export function Header() {
  const locale = useLocale()
  const router = useRouter()
  const [itemCount, setItemCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 z-50">
          <Image 
            src="/logo.webp" 
            alt="Τίνκερμπελ - Παιδικά ρούχα, βαπτιστικά, στολισμοί" 
            width={240} 
            height={60}
            className="h-10 w-auto md:h-14"
            priority
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-6 text-base font-medium">
          <Link href="/" className="transition-colors hover:text-primary flex items-center gap-2">
            <Home className="h-4 w-4" />
            {locale === 'el' ? 'Αρχική' : 'Home'}
          </Link>
          <Link href="/shop" className="transition-colors hover:text-primary flex items-center gap-2">
            <Store className="h-4 w-4" />
            {locale === 'el' ? 'Κατάστημα' : 'Shop'}
          </Link>
          <div className="relative group">
            <button className="transition-colors hover:text-primary py-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {locale === 'el' ? 'Γκαλερί' : 'Gallery'}
            </button>
            <div className="absolute left-0 top-full w-56 rounded-md shadow-lg bg-background border hidden group-hover:block">
              <div className="py-1">
                <Link href="/gallery/decorations" className="block px-4 py-2 text-base hover:bg-accent flex items-center gap-2">
                  <BsBalloonHeart className="h-4 w-4" />
                  {locale === 'el' ? 'Στολισμοί' : 'Decorations'}
                </Link>
                <Link href="/gallery/baptism" className="block px-4 py-2 text-base hover:bg-accent flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  {locale === 'el' ? 'Βαπτιστικά' : 'Baptism'}
                </Link>
              </div>
            </div>
          </div>
          <Link href="/contact" className="transition-colors hover:text-primary flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {locale === 'el' ? 'Επικοινωνία' : 'Contact'}
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-2">
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
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsCartOpen(true)}
            title={locale === 'el' ? 'Καλάθι' : 'Cart'}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex md:hidden items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsCartOpen(true)}
            title={locale === 'el' ? 'Καλάθι' : 'Cart'}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link 
              href="/" 
              className="text-base py-2 transition-colors hover:text-primary flex items-center gap-2"
              onClick={closeMobileMenu}
            >
              <Home className="h-5 w-5" />
              {locale === 'el' ? 'Αρχική' : 'Home'}
            </Link>
            <Link 
              href="/shop" 
              className="text-base py-2 transition-colors hover:text-primary flex items-center gap-2"
              onClick={closeMobileMenu}
            >
              <Store className="h-5 w-5" />
              {locale === 'el' ? 'Κατάστημα' : 'Shop'}
            </Link>
            <div className="flex flex-col space-y-2">
              <span className="text-base py-2 font-medium flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {locale === 'el' ? 'Γκαλερί' : 'Gallery'}
              </span>
              <Link 
                href="/gallery/decorations" 
                className="text-sm py-2 pl-4 transition-colors hover:text-primary flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <BsBalloonHeart className="h-4 w-4" />
                {locale === 'el' ? 'Στολισμοί' : 'Decorations'}
              </Link>
              <Link 
                href="/gallery/baptism" 
                className="text-sm py-2 pl-4 transition-colors hover:text-primary flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <Baby className="h-4 w-4" />
                {locale === 'el' ? 'Βαπτιστικά' : 'Baptism'}
              </Link>
            </div>
            <Link 
              href="/contact" 
              className="text-base py-2 transition-colors hover:text-primary flex items-center gap-2"
              onClick={closeMobileMenu}
            >
              <Mail className="h-5 w-5" />
              {locale === 'el' ? 'Επικοινωνία' : 'Contact'}
            </Link>
            
            <div className="pt-4 border-t flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleLocale()
                  closeMobileMenu()
                }}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {locale === 'el' ? 'English' : 'Ελληνικά'}
              </Button>

              <Link href="/admin-login" onClick={closeMobileMenu}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Mini Cart Sidebar - Rendered in Portal */}
      <MiniCartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}

