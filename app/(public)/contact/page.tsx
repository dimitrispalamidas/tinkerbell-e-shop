import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Mail, Phone, Clock, MapPin } from 'lucide-react'

export async function generateMetadata() {
  const t = await getTranslations('contact')
  
  return {
    title: t('title') + ' | Tinkerbell',
    description: t('description')
  }
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <ContactContent />
    </div>
  )
}

async function ContactContent() {
  const t = await getTranslations('contact')
  
  return (
    <>
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">{t('title')}</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Contact Information */}
        <div className="space-y-6 md:space-y-8">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">{t('get_in_touch')}</h2>
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="mt-1">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('email')}</h3>
                  <a 
                    href="mailto:tinkerbellkalamatas@gmail.com" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    tinkerbellkalamatas@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="mt-1">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('phone')}</h3>
                  <a 
                    href="tel:+302721406303" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    2721 406303
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="mt-1">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('hours')}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{t('hours_weekdays')}: 9:00 - 17:00</p>
                    <p>{t('hours_saturday')}: 10:00 - 14:00</p>
                    <p>{t('hours_sunday')}: {t('closed')}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="mt-1">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('address')}</h3>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Γεωργούλη+8,+Καλαμάτα"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Γεωργούλη 8<br />
                    Καλαμάτα, Ελλάδα
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">{t('follow_us')}</h2>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61567377324597" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
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
                className="flex items-center justify-center w-12 h-12 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:sticky lg:top-24 h-fit">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">{t('find_us')}</h2>
          <div className="rounded-lg overflow-hidden border shadow-sm aspect-[4/3]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3178.3!2d22.1143!3d37.0392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1360082dcbf45d87%3A0x8e4c8b8c8b8c8b8c!2sGeorgouli%208%2C%20Kalamata%20241%2000!5e0!3m2!1sen!2sgr!4v1699999999999"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('map_title')}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {t('map_note')}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-12 md:mt-16 p-6 md:p-8 rounded-lg bg-muted/50 border">
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">{t('visit_us_title')}</h2>
        <p className="text-sm md:text-base text-muted-foreground mb-4">
          {t('visit_us_text')}
        </p>
        <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-2">
          <li>{t('visit_benefit_1')}</li>
          <li>{t('visit_benefit_2')}</li>
          <li>{t('visit_benefit_3')}</li>
        </ul>
      </div>
    </>
  )
}

