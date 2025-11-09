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
    <header className="sticky top-0 z-50 w-full border-b border-sage-200/30 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 z-50 group">
          <Image 
            src="/logo.webp" 
            alt="Τίνκερμπελ - Παιδικά ρούχα, βαπτιστικά, στολισμοί" 
            width={240} 
            height={60}
            className="h-10 w-auto md:h-16 transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-8 text-base">
          <Link href="/" className="group flex items-center gap-2 text-sage-800 font-light tracking-wide transition-all duration-300 hover:text-sage-600">
            <Home className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            {locale === 'el' ? 'Αρχική' : 'Home'}
          </Link>
          <Link href="/shop" className="group flex items-center gap-2 text-sage-800 font-light tracking-wide transition-all duration-300 hover:text-sage-600">
            <Store className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            {locale === 'el' ? 'Κατάστημα' : 'Shop'}
          </Link>
          <div className="relative group">
            <button className="flex items-center gap-2 text-sage-800 font-light tracking-wide transition-all duration-300 hover:text-sage-600 py-2">
              <ImageIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              {locale === 'el' ? 'Γκαλερί' : 'Gallery'}
            </button>
            <div className="absolute left-0 top-full w-56 rounded-xl shadow-xl bg-white border border-sage-200/30 hidden group-hover:block mt-2 overflow-hidden">
              <div className="py-2">
                <Link href="/gallery/decorations" className="block px-4 py-3 text-base text-sage-800 hover:bg-sage-50 transition-colors flex items-center gap-3 font-light">
                  <BsBalloonHeart className="h-4 w-4" />
                  {locale === 'el' ? 'Στολισμοί' : 'Decorations'}
                </Link>
                <Link href="/gallery/baptism" className="block px-4 py-3 text-base text-sage-800 hover:bg-sage-50 transition-colors flex items-center gap-3 font-light">
                  <Baby className="h-4 w-4" />
                  {locale === 'el' ? 'Βαπτιστικά' : 'Baptism'}
                </Link>
              </div>
            </div>
          </div>
          <Link href="/contact" className="group flex items-center gap-2 text-sage-800 font-light tracking-wide transition-all duration-300 hover:text-sage-600">
            <Mail className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            {locale === 'el' ? 'Επικοινωνία' : 'Contact'}
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLocale}
            title={locale === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
            className="text-sage-700 hover:text-sage-900 hover:bg-sage-50 transition-all duration-300"
          >
            <Globe className="h-5 w-5" />
          </Button>

          <Link href="/admin-login">
            <Button variant="ghost" size="icon" title="Admin Login" className="text-sage-700 hover:text-sage-900 hover:bg-sage-50 transition-all duration-300">
              <LogIn className="h-5 w-5" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-sage-700 hover:text-sage-900 hover:bg-sage-50 transition-all duration-300"
            onClick={() => setIsCartOpen(true)}
            title={locale === 'el' ? 'Καλάθι' : 'Cart'}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-sage-600 text-xs flex items-center justify-center text-white font-light shadow-lg">
                {itemCount}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex md:hidden items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-sage-700 hover:text-sage-900 hover:bg-sage-50"
            onClick={() => setIsCartOpen(true)}
            title={locale === 'el' ? 'Καλάθι' : 'Cart'}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-sage-600 text-xs flex items-center justify-center text-white font-light shadow-lg">
                {itemCount}
              </span>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="text-sage-700 hover:text-sage-900 hover:bg-sage-50"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sage-200/30 bg-white/95 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-1">
            <Link 
              href="/" 
              className="text-base py-3 px-3 rounded-lg transition-all duration-300 text-sage-800 hover:bg-sage-50 hover:text-sage-900 flex items-center gap-3 font-light"
              onClick={closeMobileMenu}
            >
              <Home className="h-5 w-5" />
              {locale === 'el' ? 'Αρχική' : 'Home'}
            </Link>
            <Link 
              href="/shop" 
              className="text-base py-3 px-3 rounded-lg transition-all duration-300 text-sage-800 hover:bg-sage-50 hover:text-sage-900 flex items-center gap-3 font-light"
              onClick={closeMobileMenu}
            >
              <Store className="h-5 w-5" />
              {locale === 'el' ? 'Κατάστημα' : 'Shop'}
            </Link>
            <div className="flex flex-col space-y-1">
              <span className="text-base py-3 px-3 font-light text-sage-700 flex items-center gap-3">
                <ImageIcon className="h-5 w-5" />
                {locale === 'el' ? 'Γκαλερί' : 'Gallery'}
              </span>
              <Link 
                href="/gallery/decorations" 
                className="text-sm py-2 px-3 pl-12 rounded-lg transition-all duration-300 text-sage-700 hover:bg-sage-50 hover:text-sage-900 flex items-center gap-2 font-light"
                onClick={closeMobileMenu}
              >
                <BsBalloonHeart className="h-4 w-4" />
                {locale === 'el' ? 'Στολισμοί' : 'Decorations'}
              </Link>
              <Link 
                href="/gallery/baptism" 
                className="text-sm py-2 px-3 pl-12 rounded-lg transition-all duration-300 text-sage-700 hover:bg-sage-50 hover:text-sage-900 flex items-center gap-2 font-light"
                onClick={closeMobileMenu}
              >
                <Baby className="h-4 w-4" />
                {locale === 'el' ? 'Βαπτιστικά' : 'Baptism'}
              </Link>
            </div>
            <Link 
              href="/contact" 
              className="text-base py-3 px-3 rounded-lg transition-all duration-300 text-sage-800 hover:bg-sage-50 hover:text-sage-900 flex items-center gap-3 font-light"
              onClick={closeMobileMenu}
            >
              <Mail className="h-5 w-5" />
              {locale === 'el' ? 'Επικοινωνία' : 'Contact'}
            </Link>
            
            <div className="pt-4 mt-4 border-t border-sage-200/30 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleLocale()
                  closeMobileMenu()
                }}
                className="flex items-center gap-2 border-sage-300 text-sage-800 hover:bg-sage-50 font-light"
              >
                <Globe className="h-4 w-4" />
                {locale === 'el' ? 'English' : 'Ελληνικά'}
              </Button>

              <Link href="/admin-login" onClick={closeMobileMenu}>
                <Button variant="outline" size="sm" className="flex items-center gap-2 border-sage-300 text-sage-800 hover:bg-sage-50 font-light">
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

