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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/logo.webp" 
                alt="Τίνκερμπελ - Παιδικά ρούχα, βαπτιστικά, στολισμοί" 
                width={180} 
                height={40}
                style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Παιδικά & Εφηβικά Ρούχα και Παπούτσια
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('shop')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary">
                  {t('clothing')}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary">
                  {t('shoes')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('gallery')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gallery/baptism" className="text-muted-foreground hover:text-primary">
                  {t('baptism')}
                </Link>
              </li>
              <li>
                <Link href="/gallery/decorations" className="text-muted-foreground hover:text-primary">
                  {t('decorations')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('contact') || 'Επικοινωνία'}</h4>
            <p className="text-sm text-muted-foreground">
              Email: info@tinkerbell.gr<br />
              {t('phone') || 'Τηλ'}: +30 123 456 7890
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {year} Tinkerbell. {t('rights') || 'Με επιφύλαξη παντός δικαιώματος'}.</p>
        </div>
      </div>
    </footer>
  )
}

