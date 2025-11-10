"use client"

import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
  const locale = useLocale();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {locale === 'el' ? 'Όροι & Προϋποθέσεις' : 'Terms & Conditions'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {locale === 'el' ? 'Όροι χρήσης και παραγγελίας' : 'Terms of use and ordering'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '1. Γενικές Πληροφορίες' : '1. General Information'}
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Τινκερμπελ (Tinkerbell)</strong></p>
              <p>Γεωργούλη 8, Καλαμάτα 24100</p>
              <p>Email: <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-primary hover:underline">tinkerbellkalamatas@gmail.com</a></p>
              <p>Τηλ: 2721 406303</p>
              <p>{locale === 'el' ? 'Ωράριο: Δευ-Παρ, 9:00-17:00' : 'Hours: Mon-Fri, 9:00-17:00'}</p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '2. Αποδοχή Όρων' : '2. Acceptance of Terms'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'el' 
                ? 'Χρησιμοποιώντας την ιστοσελίδα και πραγματοποιώντας παραγγελίες, αποδέχεστε ανεπιφύλακτα τους παρόντες όρους. Αν δεν συμφωνείτε, παρακαλούμε μην χρησιμοποιήσετε τις υπηρεσίες μας.'
                : 'By using the website and placing orders, you unconditionally accept these terms. If you disagree, please do not use our services.'}
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '3. Προϊόντα & Τιμές' : '3. Products & Prices'}
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• {locale === 'el' ? 'Όλες οι τιμές σε Ευρώ (€) με ΦΠΑ 24%' : 'All prices in Euros (€) with 24% VAT'}</li>
              <li>• {locale === 'el' ? 'Υπόκεινται σε διαθεσιμότητα' : 'Subject to availability'}</li>
              <li>• {locale === 'el' ? 'Δικαίωμα τροποποίησης τιμών χωρίς προειδοποίηση' : 'Right to modify prices without notice'}</li>
              <li>• {locale === 'el' ? 'Φωτογραφίες ενδεικτικές - χρώματα μπορεί να διαφέρουν' : 'Photos indicative - colors may vary'}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '4. Παραγγελίες' : '4. Orders'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{locale === 'el' ? 'Η παραγγελία ολοκληρώνεται μετά από:' : 'Order is complete after:'}</p>
              <ol className="space-y-2 list-decimal pl-6">
                <li>{locale === 'el' ? 'Συμπλήρωση στοιχείων' : 'Completing information'}</li>
                <li>{locale === 'el' ? 'Επιτυχή πληρωμή μέσω Viva Wallet' : 'Successful payment via Viva Wallet'}</li>
                <li>{locale === 'el' ? 'Email επιβεβαίωσης' : 'Confirmation email'}</li>
              </ol>
              <p className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg text-sm">
                <strong>⚠️</strong> {locale === 'el' ? 'Το email επιβεβαίωσης ΔΕΝ συνιστά αποδοχή. Αποδοχή γίνεται με την αποστολή.' : 'Confirmation email does NOT constitute acceptance. Acceptance occurs upon shipment.'}
              </p>
            </div>
          </section>

          {/* Section 5 - Payment */}
          <section className="bg-green-50 dark:bg-green-950/20 p-6 rounded-xl border-l-4 border-green-500">
            <h2 className="text-2xl font-bold mb-4">
              {locale === 'el' ? '5. Πληρωμές' : '5. Payments'}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-2">{locale === 'el' ? 'Τρόποι Πληρωμής:' : 'Payment Methods:'}</p>
                <p className="text-sm">Visa, Mastercard, Maestro, American Express, e-banking</p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>💳 {locale === 'el' ? 'Πάροχος:' : 'Provider:'}</strong> Viva Wallet (Viva Payment Services S.A.)</p>
                <p><strong>🔒 {locale === 'el' ? 'Ασφάλεια:' : 'Security:'}</strong> PCI-DSS Level 1, PSD2, 2FA/SCA</p>
                <p className="text-red-600 dark:text-red-400"><strong>⚠️ {locale === 'el' ? 'Σημαντικό:' : 'Important:'}</strong> {locale === 'el' ? 'ΔΕΝ αποθηκεύουμε στοιχεία καρτών. Εισάγονται απευθείας στη Viva.' : 'We do NOT store card details. Entered directly into Viva.'}</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '6. Μεταφορικά & Παράδοση' : '6. Shipping & Delivery'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">📦 BOXNOW Locker</h3>
                <p className="text-sm">• {locale === 'el' ? 'Δωρεάν' : 'Free'}</p>
                <p className="text-sm">• 1-3 {locale === 'el' ? 'εργάσιμες' : 'business days'}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">🏠 {locale === 'el' ? 'Κατ\' Οίκον' : 'Home Delivery'}</h3>
                <p className="text-sm">• €3.50</p>
                <p className="text-sm">• 1-3 {locale === 'el' ? 'εργάσιμες' : 'business days'}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              📍 {locale === 'el' ? 'Παράδοση σε όλη την Ελλάδα' : 'Delivery throughout Greece'}
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '7. Επιστροφές' : '7. Returns'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'el' ? 'Δείτε την αναλυτική ' : 'See detailed '}
              <Link href={locale === 'el' ? '/el/return-policy' : '/en/return-policy'} className="text-primary hover:underline font-semibold">
                {locale === 'el' ? 'Πολιτική Επιστροφών' : 'Return Policy'}
              </Link>
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mt-3 text-sm text-muted-foreground">
              <p><strong>{locale === 'el' ? 'Συνοπτικά:' : 'Summary:'}</strong></p>
              <ul className="space-y-1 ml-4 mt-2">
                <li>• {locale === 'el' ? '14 ημέρες αναιτιολόγητη υπαναχώρηση (νόμος)' : '14 days unconditional withdrawal (law)'}</li>
                <li>• {locale === 'el' ? 'Προϊόντα σε άριστη κατάσταση' : 'Products in excellent condition'}</li>
                <li>• {locale === 'el' ? 'Επικοινωνία για RMA' : 'Contact for RMA'}</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '8. Περιορισμός Ευθύνης' : '8. Limitation of Liability'}
            </h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• {locale === 'el' ? 'Δεν φέρουμε ευθύνη για καθυστερήσεις μεταφορικών/ανωτέρα βία' : 'Not responsible for shipping delays/force majeure'}</li>
              <li>• {locale === 'el' ? 'Δεν φέρουμε ευθύνη για τεχνικά προβλήματα ιστοσελίδας' : 'Not responsible for website technical issues'}</li>
              <li>• {locale === 'el' ? 'Συνολική ευθύνη περιορίζεται στο ποσό παραγγελίας' : 'Total liability limited to order amount'}</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '9. Προστασία Δεδομένων' : '9. Data Protection'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'el' ? 'Δείτε την ' : 'See our '}
              <Link href={locale === 'el' ? '/el/privacy-policy' : '/en/privacy-policy'} className="text-primary hover:underline font-semibold">
                {locale === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
              </Link>
              {locale === 'el' ? ' για πλήρη συμμόρφωση με GDPR' : ' for full GDPR compliance'}
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '10. Εφαρμοστέο Δίκαιο' : '10. Applicable Law'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'el' 
                ? 'Οι όροι διέπονται από το Ελληνικό Δίκαιο και την Ευρωπαϊκή νομοθεσία. Αρμόδια Δικαστήρια Καλαμάτας.'
                : 'Terms governed by Greek Law and European legislation. Kalamata Courts have jurisdiction.'}
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}</p>
          <p className="mt-2">
            {locale === 'el' ? 'Σύμφωνα με Ν. 2251/1994 & GDPR' : 'According to Law 2251/1994 & GDPR'}
          </p>
        </div>
      </div>
    </div>
  );
}
