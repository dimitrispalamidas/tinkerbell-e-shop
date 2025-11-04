"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  const t = useTranslations('nav')
  const [year, setYear] = useState(2024)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Logo & Brand Section */}
          <div className="md:col-span-3">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/logo.webp" 
                alt="Τίνκερμπελ - Παιδικά ρούχα, βαπτιστικά, στολισμοί" 
                width={180} 
                height={40}
                style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              Παιδικά & Εφηβικά Ρούχα και Παπούτσια
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61567377324597" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/mytinkerbell_events?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Shop Links */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">{t('shop')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('clothing')}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('shoes')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Gallery Links */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">{t('gallery')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gallery/baptism" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('baptism')}
                </Link>
              </li>
              <li>
                <Link href="/gallery/decorations" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('decorations')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal Links */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">{t('legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('privacy_policy')}
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('terms_and_conditions')}
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('return_policy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-3">
            <h4 className="font-semibold mb-4">{t('contact') || 'Επικοινωνία'}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: tinkerbellkalamatas@gmail.com</p>
              <p>{t('phone') || 'Τηλ'}: 2721 406303</p>
              <p className="pt-2">Γεωργούλη 8, Καλαμάτα</p>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {year} Tinkerbell. {t('rights') || 'Με επιφύλαξη παντός δικαιώματος'}.</p>
        </div>
      </div>
    </footer>
  )
}

