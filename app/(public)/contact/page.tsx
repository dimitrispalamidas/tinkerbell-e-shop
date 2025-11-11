import { getLocale } from 'next-intl/server'
import { ContactClient } from './contact-client'
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  
  return {
    title: locale === 'el' ? 'Επικοινωνία' : 'Contact Us',
    description: locale === 'el' 
      ? 'Επικοινωνήστε με το Τινκερμπελ. Γεωργούλη 8, Καλαμάτα. Τηλ: 2721 406303. Email: tinkerbellkalamatas@gmail.com'
      : 'Contact Tinkerbell. Georgouli 8, Kalamata. Tel: 2721 406303. Email: tinkerbellkalamatas@gmail.com',
    openGraph: {
      title: locale === 'el' ? 'Επικοινωνία | Τινκερμπελ' : 'Contact Us | Tinkerbell',
      description: locale === 'el' 
        ? 'Επικοινωνήστε μαζί μας για ερωτήσεις ή ραντεβού.'
        : 'Get in touch with us for questions or appointments.',
    },
  };
}

export default async function ContactPage() {
  const locale = await getLocale()
  
  return <ContactClient locale={locale} />
}
