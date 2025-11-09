"use client"

import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const locale = useLocale()
  const [year] = useState(() => new Date().getFullYear())

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
          {/* Logo & Brand Section */}
          <div className="md:col-span-3">
            <Link href="/" className="inline-block mb-3 md:mb-4">
              <Image 
                src="/logo.webp" 
                alt="Τίνκερμπελ - Παιδικά ρούχα, βαπτιστικά, στολισμοί" 
                width={180} 
                height={40}
                style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-4 md:mb-6">
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
          
          {/* Links Grid - 2 columns on mobile, flexible on desktop */}
          <div className="col-span-1 md:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Shop Links */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                {locale === 'el' ? 'Κατάστημα' : 'Shop'}
              </h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                    {locale === 'el' ? 'Ρούχα' : 'Clothing'}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                    {locale === 'el' ? 'Παπούτσια' : 'Shoes'}
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Gallery Links */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                {locale === 'el' ? 'Γκαλερί' : 'Gallery'}
              </h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link href="/gallery/baptism" className="text-muted-foreground hover:text-primary transition-colors">
                    {locale === 'el' ? 'Βαπτιστικά' : 'Baptism'}
                  </Link>
                </li>
                <li>
                  <Link href="/gallery/decorations" className="text-muted-foreground hover:text-primary transition-colors">
                    {locale === 'el' ? 'Στολισμοί' : 'Decorations'}
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                {locale === 'el' ? 'Νομικά' : 'Legal'}
              </h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                    {locale === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary transition-colors">
                    {locale === 'el' ? 'Όροι και Προϋποθέσεις' : 'Terms and Conditions'}
                  </Link>
                </li>
                <li>
                  <Link href="/return-policy" className="text-muted-foreground hover:text-primary transition-colors">
                    {locale === 'el' ? 'Πολιτική Επιστροφών' : 'Return Policy'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-3">
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
              {locale === 'el' ? 'Επικοινωνία' : 'Contact'}
            </h4>
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <a 
                  href="mailto:tinkerbellkalamatas@gmail.com" 
                  className="text-muted-foreground hover:text-primary transition-colors break-all"
                >
                  tinkerbellkalamatas@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <a 
                  href="tel:+302721406303" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  2721 406303
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-0.5" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Γεωργούλη+8,+Καλαμάτα" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Γεωργούλη 8, Καλαμάτα
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 md:mt-12 pt-4 md:pt-6 border-t text-center text-xs md:text-sm text-muted-foreground">
          <p>
            &copy; {year} Tinkerbell. {locale === 'el' ? 'Με επιφύλαξη παντός δικαιώματος' : 'All rights reserved'}.
          </p>
        </div>
      </div>
    </footer>
  )
}

