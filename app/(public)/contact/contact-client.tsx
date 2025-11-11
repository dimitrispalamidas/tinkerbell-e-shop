'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Clock, MapPin, MessageCircle } from 'lucide-react';

interface ContactClientProps {
  locale: string;
}

export function ContactClient({ locale }: ContactClientProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-white to-cream-50/30">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Compact Premium Header */}
          <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Eyebrow with Icon */}
            <p className="text-sm md:text-base tracking-[0.3em] uppercase text-sage-600 mb-3 md:mb-4 font-light flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {locale === 'el' ? 'Ας Μιλήσουμε' : 'Let\'s Talk'}
            </p>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-sage-900 tracking-tight mb-4 md:mb-6">
              {locale === 'el' ? 'Επικοινωνία' : 'Contact Us'}
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base text-sage-700/80 max-w-2xl mx-auto font-light">
              {locale === 'el' 
                ? 'Έχετε ερωτήσεις; Θέλετε να κλείσετε ραντεβού; Επικοινωνήστε μαζί μας!'
                : 'Have questions? Want to book an appointment? Get in touch with us!'
              }
            </p>
          </div>

          {/* Content Grid */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Contact Information */}
            <div className="space-y-6">
              {/* Email Card */}
              <div className="group relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-sage-50/50 to-cream-100/50 border border-sage-200/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 backdrop-blur-sm cursor-pointer">
                <a 
                  href="mailto:tinkerbellkalamatas@gmail.com"
                  className="absolute inset-0 z-0"
                  aria-label="Send email"
                />
                <div className="flex items-start gap-4 md:gap-5 relative z-10">
                  <div className="flex-shrink-0 pointer-events-none">
                    <div className="p-3 rounded-full bg-sage-100 group-hover:bg-sage-200 transition-colors duration-300">
                      <Mail className="h-6 w-6 text-sage-700" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm md:text-base tracking-[0.15em] uppercase text-sage-600 mb-2 font-light pointer-events-none">
                      Email
                    </h3>
                    <p className="text-base md:text-lg text-sage-900 group-hover:text-sage-700 transition-colors break-all font-light select-text cursor-text">
                      tinkerbellkalamatas@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-sage-50/50 to-cream-100/50 border border-sage-200/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 backdrop-blur-sm cursor-pointer">
                <a 
                  href="tel:+302721406303"
                  className="absolute inset-0 z-0"
                  aria-label="Call phone"
                />
                <div className="flex items-start gap-4 md:gap-5 relative z-10">
                  <div className="flex-shrink-0 pointer-events-none">
                    <div className="p-3 rounded-full bg-sage-100 group-hover:bg-sage-200 transition-colors duration-300">
                      <Phone className="h-6 w-6 text-sage-700" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm md:text-base tracking-[0.15em] uppercase text-sage-600 mb-2 font-light pointer-events-none">
                      {locale === 'el' ? 'Τηλέφωνο' : 'Phone'}
                    </h3>
                    <p className="text-base md:text-lg text-sage-900 group-hover:text-sage-700 transition-colors font-light select-text cursor-text">
                      2721 406303
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours Card */}
              <div className="group relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-sage-50/50 to-cream-100/50 border border-sage-200/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 backdrop-blur-sm">
                <div className="flex items-start gap-4 md:gap-5">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-sage-100 group-hover:bg-sage-200 transition-colors duration-300">
                      <Clock className="h-6 w-6 text-sage-700" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm md:text-base tracking-[0.15em] uppercase text-sage-600 mb-3 font-light">
                      {locale === 'el' ? 'Ωράριο' : 'Hours'}
                    </h3>
                    <div className="space-y-2 text-sm md:text-base text-sage-700 font-light">
                      <p>{locale === 'el' ? 'Δευτέρα - Παρασκευή' : 'Monday - Friday'}: 9:00 - 17:00</p>
                      <p>{locale === 'el' ? 'Σάββατο' : 'Saturday'}: 10:00 - 14:00</p>
                      <p>{locale === 'el' ? 'Κυριακή' : 'Sunday'}: {locale === 'el' ? 'Κλειστά' : 'Closed'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="group relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-sage-50/50 to-cream-100/50 border border-sage-200/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 backdrop-blur-sm cursor-pointer">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Γεωργούλη+8,+Καλαμάτα"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-0"
                  aria-label="Open in Google Maps"
                />
                <div className="flex items-start gap-4 md:gap-5 relative z-10">
                  <div className="flex-shrink-0 pointer-events-none">
                    <div className="p-3 rounded-full bg-sage-100 group-hover:bg-sage-200 transition-colors duration-300">
                      <MapPin className="h-6 w-6 text-sage-700" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm md:text-base tracking-[0.15em] uppercase text-sage-600 mb-2 font-light pointer-events-none">
                      {locale === 'el' ? 'Διεύθυνση' : 'Address'}
                    </h3>
                    <p className="text-base md:text-lg text-sage-900 group-hover:text-sage-700 transition-colors font-light select-text cursor-text">
                      Γεωργούλη 8<br />
                      Καλαμάτα, Ελλάδα
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-4">
                <h3 className="text-sm md:text-base tracking-[0.15em] uppercase text-sage-600 mb-4 font-light text-center">
                  {locale === 'el' ? 'Ακολουθήστε μας' : 'Follow Us'}
                </h3>
                <div className="flex gap-4 justify-center">
                  {/* Facebook με brand χρώμα #1877F2 */}
                  <a 
                    href="https://www.facebook.com/profile.php?id=61567377324597" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1877F2] hover:bg-[#0C63D4] text-white transition-all duration-300 hover:scale-110 shadow-md cursor-pointer"
                    aria-label="Facebook"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  {/* Instagram με gradient brand χρώματα */}
                  <a 
                    href="https://www.instagram.com/mytinkerbell_events?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] hover:from-[#6A2C91] hover:via-[#C13584] hover:to-[#E95950] text-white transition-all duration-300 hover:scale-110 shadow-md cursor-pointer"
                    aria-label="Instagram"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl overflow-hidden border-2 border-sage-200/30 shadow-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3178.3!2d22.1143!3d37.0392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1360082dcbf45d87%3A0x8e4c8b8c8b8c8b8c!2sGeorgouli%208%2C%20Kalamata%20241%2000!5e0!3m2!1sen!2sgr!4v1699999999999"
                  width="100%"
                  height="500"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={locale === 'el' ? 'Χάρτης Tinkerbell' : 'Tinkerbell Map'}
                  className="w-full h-[400px] md:h-[500px]"
                />
              </div>
              <p className="text-sm md:text-base text-sage-700 mt-4 text-center font-light">
                {locale === 'el' ? 'Βρισκόμαστε στο κέντρο της Καλαμάτας' : 'We are located in the center of Kalamata'}
              </p>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className={`mt-16 md:mt-24 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-sage-50/80 to-cream-100/80 border border-sage-200/30 backdrop-blur-sm shadow-xl">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-4xl font-light mb-4 text-sage-900 tracking-tight">
                  {locale === 'el' ? 'Επισκεφτείτε μας' : 'Visit Us'}
                </h2>
                <p className="text-base md:text-lg text-sage-700 mb-6 font-light leading-relaxed">
                  {locale === 'el' 
                    ? 'Περάστε από το κατάστημά μας και θα χαρούμε να σας βοηθήσουμε με τις επιλογές σας για την ιδιαίτερη σας εκδήλωση.'
                    : 'Visit our store and we will be happy to help you with your choices for your special event.'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4">
                    <div className="inline-block p-3 rounded-full bg-sage-100 mb-3">
                      <svg className="h-6 w-6 text-sage-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-sm md:text-base text-sage-700 font-light">
                      {locale === 'el' ? 'Προσωποποιημένη εξυπηρέτηση' : 'Personalized service'}
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="inline-block p-3 rounded-full bg-sage-100 mb-3">
                      <svg className="h-6 w-6 text-sage-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm md:text-base text-sage-700 font-light">
                      {locale === 'el' ? 'Δοκιμή ρούχων και αξεσουάρ' : 'Try on clothes and accessories'}
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="inline-block p-3 rounded-full bg-sage-100 mb-3">
                      <svg className="h-6 w-6 text-sage-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-sm md:text-base text-sage-700 font-light">
                      {locale === 'el' ? 'Συμβουλές από έμπειρο προσωπικό' : 'Expert advice from our staff'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

