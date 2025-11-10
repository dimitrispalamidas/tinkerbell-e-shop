"use client"

import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
  const locale = useLocale();
  
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900 ">
            {locale === 'el' ? 'Όροι & Προϋποθέσεις' : 'Terms & Conditions'}
          </h1>
          <p className="text-slate-600 ">
            {locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '1. Γενικές Πληροφορίες' : '1. General Information'}
            </h2>
            <div className="text-slate-700  text-sm space-y-1">
              <p><strong>Τινκερμπελ (Tinkerbell)</strong></p>
              <p>Γεωργούλη 8, Καλαμάτα 24100</p>
              <p>Email: <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-blue-600 hover:underline">tinkerbellkalamatas@gmail.com</a></p>
              <p>Τηλ: 2721 406303</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '2. Αποδοχή Όρων' : '2. Acceptance of Terms'}
            </h2>
            <p className="text-slate-700  text-sm">
              {locale === 'el' 
                ? 'Χρησιμοποιώντας την ιστοσελίδα και πραγματοποιώντας παραγγελίες, αποδέχεστε ανεπιφύλακτα τους παρόντες όρους.'
                : 'By using the website and placing orders, you unconditionally accept these terms.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '3. Προϊόντα & Τιμές' : '3. Products & Prices'}
            </h2>
            <ul className="text-slate-700  text-sm list-disc pl-5 space-y-1">
              <li>{locale === 'el' ? 'Όλες οι τιμές σε Ευρώ (€) με ΦΠΑ 24%' : 'All prices in Euros (€) with 24% VAT'}</li>
              <li>{locale === 'el' ? 'Υπόκεινται σε διαθεσιμότητα' : 'Subject to availability'}</li>
              <li>{locale === 'el' ? 'Δικαίωμα τροποποίησης τιμών' : 'Right to modify prices'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '4. Παραγγελίες' : '4. Orders'}
            </h2>
            <div className="text-slate-700  text-sm space-y-2">
              <p>{locale === 'el' ? 'Η παραγγελία ολοκληρώνεται μετά από:' : 'Order completes after:'}</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>{locale === 'el' ? 'Συμπλήρωση στοιχείων' : 'Form completion'}</li>
                <li>{locale === 'el' ? 'Επιτυχή πληρωμή (Viva Wallet)' : 'Successful payment (Viva Wallet)'}</li>
                <li>{locale === 'el' ? 'Email επιβεβαίωσης' : 'Confirmation email'}</li>
              </ol>
            </div>
          </section>

          <section className="mb-8 border-l-4 border-green-500 pl-4 bg-green-50  py-3">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '5. Πληρωμές' : '5. Payments'}
            </h2>
            <div className="text-slate-700  text-sm space-y-2">
              <p><strong>{locale === 'el' ? 'Τρόποι:' : 'Methods:'}</strong> Visa, Mastercard, Maestro, American Express, e-banking</p>
              <p><strong>{locale === 'el' ? 'Πάροχος:' : 'Provider:'}</strong> Viva Wallet (PCI-DSS Level 1, PSD2)</p>
              <p className="font-medium">{locale === 'el' ? '⚠️ ΔΕΝ αποθηκεύουμε στοιχεία καρτών' : '⚠️ We do NOT store card details'}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '6. Μεταφορικά' : '6. Shipping'}
            </h2>
            <div className="text-slate-700  text-sm space-y-1">
              <p><strong>BOXNOW Locker:</strong> {locale === 'el' ? 'Δωρεάν, 1-3 εργάσιμες' : 'Free, 1-3 business days'}</p>
              <p><strong>{locale === 'el' ? 'Κατ\' Οίκον:' : 'Home:'}</strong> €3.50, 1-3 {locale === 'el' ? 'εργάσιμες' : 'business days'}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '7. Επιστροφές' : '7. Returns'}
            </h2>
            <p className="text-slate-700  text-sm">
              {locale === 'el' ? 'Δείτε την ' : 'See '}
              <Link href={locale === 'el' ? '/el/return-policy' : '/en/return-policy'} className="text-blue-600 hover:underline font-medium">
                {locale === 'el' ? 'Πολιτική Επιστροφών' : 'Return Policy'}
              </Link>
              {locale === 'el' ? ' (14 ημέρες αναιτιολόγητη υπαναχώρηση)' : ' (14 days unconditional withdrawal)'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '8. Προστασία Δεδομένων' : '8. Data Protection'}
            </h2>
            <p className="text-slate-700  text-sm">
              {locale === 'el' ? 'Δείτε την ' : 'See '}
              <Link href={locale === 'el' ? '/el/privacy-policy' : '/en/privacy-policy'} className="text-blue-600 hover:underline font-medium">
                {locale === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
              </Link>
              {locale === 'el' ? ' (GDPR compliant)' : ' (GDPR compliant)'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '9. Εφαρμοστέο Δίκαιο' : '9. Applicable Law'}
            </h2>
            <p className="text-slate-700  text-sm">
              {locale === 'el' 
                ? 'Ελληνικό Δίκαιο και Ευρωπαϊκή νομοθεσία. Αρμόδια Δικαστήρια Καλαμάτας.'
                : 'Greek Law and European legislation. Kalamata Courts have jurisdiction.'}
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-200  text-center text-xs text-slate-500">
          <p>{locale === 'el' ? 'Σύμφωνα με Ν. 2251/1994 & GDPR' : 'According to Law 2251/1994 & GDPR'}</p>
        </div>

      </div>
    </div>
  );
}
