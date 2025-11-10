import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  
  return {
    title: locale === 'el' ? 'Πολιτική Απορρήτου & Προστασίας Προσωπικών Δεδομένων' : 'Privacy & Personal Data Protection Policy',
    description: locale === 'el' 
      ? 'Η πολιτική απορρήτου της Τινκερμπελ σύμφωνα με τον GDPR. Μάθετε πώς προστατεύουμε τα προσωπικά σας δεδομένα.'
      : 'Tinkerbell\'s privacy policy in accordance with GDPR. Learn how we protect your personal data.',
    openGraph: {
      title: locale === 'el' ? 'Πολιτική Απορρήτου | Τινκερμπελ' : 'Privacy Policy | Tinkerbell',
      description: locale === 'el' 
        ? 'Η πολιτική απορρήτου της Τινκερμπελ σύμφωνα με τον GDPR.'
        : 'Tinkerbell\'s privacy policy in accordance with GDPR.',
    },
  };
}

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {locale === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {locale === 'el' ? 'Πώς προστατεύουμε τα προσωπικά σας δεδομένα' : 'How we protect your personal data'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '1. Υπεύθυνος Επεξεργασίας' : '1. Data Controller'}
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Τινκερμπελ (Tinkerbell)</strong></p>
              <p>Γεωργούλη 8, Καλαμάτα 24100</p>
              <p>Email: <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-primary hover:underline">tinkerbellkalamatas@gmail.com</a></p>
              <p>Τηλ: 2721 406303</p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '2. Τι Δεδομένα Συλλέγουμε' : '2. What Data We Collect'}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Προσωπικά Στοιχεία:</h3>
                <p>Όνομα, επώνυμο, email, τηλέφωνο, διεύθυνση παράδοσης</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Παραγγελίες:</h3>
                <p>Ιστορικό αγορών, προϊόντα, τιμές, κατάσταση παραγγελίας</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Τεχνικά:</h3>
                <p>IP address, browser, συσκευή, γλώσσα</p>
              </div>
            </div>
          </section>

          {/* Section 3 - Payment */}
          <section className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-xl border-l-4 border-amber-500">
            <h2 className="text-2xl font-bold mb-4">
              {locale === 'el' ? '3. Πληρωμές & Viva Wallet' : '3. Payments & Viva Wallet'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-semibold text-amber-900 dark:text-amber-400">
                ⚠️ {locale === 'el' ? 'ΔΕΝ αποθηκεύουμε στοιχεία καρτών' : 'We do NOT store card details'}
              </p>
              <p>
                {locale === 'el' 
                  ? 'Όλες οι πληρωμές επεξεργάζονται από τη Viva Wallet (PCI-DSS Level 1 certified). Τα στοιχεία της κάρτας σας εισάγονται απευθείας στην ασφαλή πλατφόρμα της Viva μέσω κρυπτογραφημένης σύνδεσης SSL 256-bit.'
                  : 'All payments are processed by Viva Wallet (PCI-DSS Level 1 certified). Your card details are entered directly into Viva\'s secure platform via encrypted SSL 256-bit connection.'}
              </p>
              <p className="text-sm">
                <a href="https://www.viva.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {locale === 'el' ? 'Πολιτική Απορρήτου Viva Wallet →' : 'Viva Wallet Privacy Policy →'}
                </a>
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '4. Γιατί Χρησιμοποιούμε τα Δεδομένα σας' : '4. Why We Use Your Data'}
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• {locale === 'el' ? 'Επεξεργασία και εκτέλεση παραγγελιών' : 'Order processing and fulfillment'}</li>
              <li>• {locale === 'el' ? 'Παράδοση προϊόντων (BOXNOW)' : 'Product delivery (BOXNOW)'}</li>
              <li>• {locale === 'el' ? 'Επικοινωνία για παραγγελίες' : 'Order-related communication'}</li>
              <li>• {locale === 'el' ? 'Νομικές υποχρεώσεις (φορολογικά)' : 'Legal obligations (tax)'}</li>
              <li>• {locale === 'el' ? 'Προστασία από απάτες' : 'Fraud protection'}</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '5. Με Ποιους Μοιραζόμαστε Δεδομένα' : '5. Who We Share Data With'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-semibold text-foreground">{locale === 'el' ? 'Δεν πουλάμε τα δεδομένα σας. Μοιραζόμαστε μόνο με:' : 'We don\'t sell your data. We only share with:'}</p>
              <ul className="space-y-2">
                <li>• <strong>BOXNOW:</strong> {locale === 'el' ? 'Για παράδοση προϊόντων' : 'For product delivery'}</li>
                <li>• <strong>Viva Wallet:</strong> {locale === 'el' ? 'Για επεξεργασία πληρωμών (χωρίς στοιχεία καρτών)' : 'For payment processing (without card details)'}</li>
                <li>• <strong>{locale === 'el' ? 'Νομικές Αρχές:' : 'Legal Authorities:'}</strong> {locale === 'el' ? 'Μόνο αν απαιτείται από το νόμο' : 'Only if required by law'}</li>
              </ul>
            </div>
          </section>

          {/* Section 6 - Cookies */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '6. Cookies & Τοπική Αποθήκευση' : '6. Cookies & Local Storage'}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  ✓ {locale === 'el' ? 'ΔΕΝ χρησιμοποιούμε:' : 'We do NOT use:'}
                </p>
                <p className="text-sm">{locale === 'el' ? 'Tracking, Analytics, Διαφημίσεις, Google Analytics, Facebook Pixel' : 'Tracking, Analytics, Ads, Google Analytics, Facebook Pixel'}</p>
              </div>
              
              <div>
                <p className="font-semibold text-foreground mb-2">{locale === 'el' ? 'Χρησιμοποιούμε ΜΟΝΟ:' : 'We ONLY use:'}</p>
                <ul className="space-y-1 text-sm">
                  <li>• <code className="bg-muted px-2 py-1 rounded">locale</code> - {locale === 'el' ? 'Επιλογή γλώσσας' : 'Language preference'}</li>
                  <li>• <code className="bg-muted px-2 py-1 rounded">cart-storage</code> - {locale === 'el' ? 'Καλάθι αγορών' : 'Shopping cart'}</li>
                  <li>• <code className="bg-muted px-2 py-1 rounded">checkout_data</code> - {locale === 'el' ? 'Στοιχεία φόρμας' : 'Form data'}</li>
                  <li>• <code className="bg-muted px-2 py-1 rounded">cookie_consent</code> - {locale === 'el' ? 'Επιλογή banner' : 'Banner choice'}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 - Rights */}
          <section className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">
              {locale === 'el' ? '7. Τα Δικαιώματά σας (GDPR)' : '7. Your Rights (GDPR)'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{locale === 'el' ? 'Έχετε δικαίωμα:' : 'You have the right to:'}</p>
              <ul className="space-y-1">
                <li>• {locale === 'el' ? 'Πρόσβασης στα δεδομένα σας' : 'Access your data'}</li>
                <li>• {locale === 'el' ? 'Διόρθωσης ανακριβών δεδομένων' : 'Rectify inaccurate data'}</li>
                <li>• {locale === 'el' ? 'Διαγραφής ("δικαίωμα στη λήθη")' : 'Erasure ("right to be forgotten")'}</li>
                <li>• {locale === 'el' ? 'Φορητότητας δεδομένων' : 'Data portability'}</li>
                <li>• {locale === 'el' ? 'Καταγγελίας στην Αρχή Προστασίας Δεδομένων' : 'Lodge a complaint with the Data Protection Authority'}</li>
              </ul>
              <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">{locale === 'el' ? 'Επικοινωνήστε μαζί μας:' : 'Contact us:'}</p>
                <p className="text-sm">Email: <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-primary hover:underline">tinkerbellkalamatas@gmail.com</a></p>
                <p className="text-sm">{locale === 'el' ? 'Απάντηση εντός 30 ημερών' : 'Response within 30 days'}</p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '8. Ασφάλεια & Διατήρηση' : '8. Security & Retention'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>{locale === 'el' ? 'Ασφάλεια:' : 'Security:'}</strong> SSL/TLS encryption, Supabase (certified), περιορισμένη πρόσβαση</p>
              <p><strong>{locale === 'el' ? 'Διατήρηση:' : 'Retention:'}</strong></p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• {locale === 'el' ? 'Παραγγελίες: 10 έτη (φορολογικές υποχρεώσεις)' : 'Orders: 10 years (tax obligations)'}</li>
                <li>• {locale === 'el' ? 'Επικοινωνία: 2 έτη ή μέχρι αίτημα διαγραφής' : 'Communication: 2 years or until deletion request'}</li>
                <li>• {locale === 'el' ? 'Τεχνικά logs: 90 ημέρες' : 'Technical logs: 90 days'}</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}</p>
          <p className="mt-2">
            {locale === 'el' ? 'Συμμόρφωση με GDPR (ΕΕ) 2016/679' : 'GDPR (EU) 2016/679 Compliant'}
          </p>
        </div>
      </div>
    </div>
  );
}
