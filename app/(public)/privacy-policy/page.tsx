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
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">
            {locale === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
          </h1>
          <p className="text-slate-600">
            {locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              {locale === 'el' ? '1. Υπεύθυνος Επεξεργασίας' : '1. Data Controller'}
            </h2>
            <div className="text-slate-700 space-y-1 text-sm">
              <p><strong>Τινκερμπελ (Tinkerbell)</strong></p>
              <p>Γεωργούλη 8, Καλαμάτα 24100, Ελλάδα</p>
              <p>Email: <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-blue-600 hover:underline">tinkerbellkalamatas@gmail.com</a></p>
              <p>Τηλ: 2721 406303</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              {locale === 'el' ? '2. Τι Δεδομένα Συλλέγουμε' : '2. What Data We Collect'}
            </h2>
            <div className="text-slate-700 text-sm space-y-3">
              <div>
                <p className="font-medium mb-1">{locale === 'el' ? 'Προσωπικά Στοιχεία:' : 'Personal Information:'}</p>
                <p>Όνομα, επώνυμο, email, τηλέφωνο, διεύθυνση παράδοσης</p>
              </div>
              <div>
                <p className="font-medium mb-1">{locale === 'el' ? 'Παραγγελίες:' : 'Orders:'}</p>
                <p>Ιστορικό αγορών, προϊόντα, τιμές, κατάσταση παραγγελίας</p>
              </div>
              <div>
                <p className="font-medium mb-1">{locale === 'el' ? 'Τεχνικά:' : 'Technical:'}</p>
                <p>IP address, browser, συσκευή, γλώσσα</p>
              </div>
            </div>
          </section>

          <section className="mb-8 border-l-4 border-amber-500 pl-4 bg-amber-50 py-3">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              {locale === 'el' ? '3. Πληρωμές & Viva Wallet' : '3. Payments & Viva Wallet'}
            </h2>
            <div className="text-slate-700 text-sm space-y-2">
              <p className="font-medium text-amber-900">
                {locale === 'el' ? '⚠️ ΔΕΝ αποθηκεύουμε στοιχεία καρτών' : '⚠️ We do NOT store card details'}
              </p>
              <p>
                {locale === 'el' 
                  ? 'Όλες οι πληρωμές επεξεργάζονται από τη Viva Wallet (PCI-DSS Level 1). Τα στοιχεία της κάρτας σας εισάγονται απευθείας στην ασφαλή πλατφόρμα της Viva μέσω SSL 256-bit.'
                  : 'All payments are processed by Viva Wallet (PCI-DSS Level 1). Your card details are entered directly into Viva\'s secure platform via SSL 256-bit.'}
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              {locale === 'el' ? '4. Γιατί Χρησιμοποιούμε τα Δεδομένα σας' : '4. Why We Use Your Data'}
            </h2>
            <ul className="text-slate-700 text-sm space-y-1 list-disc pl-5">
              <li>{locale === 'el' ? 'Επεξεργασία και εκτέλεση παραγγελιών' : 'Order processing and fulfillment'}</li>
              <li>{locale === 'el' ? 'Παράδοση προϊόντων (BOXNOW)' : 'Product delivery (BOXNOW)'}</li>
              <li>{locale === 'el' ? 'Επικοινωνία για παραγγελίες' : 'Order communication'}</li>
              <li>{locale === 'el' ? 'Νομικές υποχρεώσεις (φορολογικά)' : 'Legal obligations (tax)'}</li>
              <li>{locale === 'el' ? 'Προστασία από απάτες' : 'Fraud protection'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              {locale === 'el' ? '5. Με Ποιους Μοιραζόμαστε Δεδομένα' : '5. Who We Share Data With'}
            </h2>
            <div className="text-slate-700 text-sm space-y-2">
              <p className="font-medium">{locale === 'el' ? 'Δεν πουλάμε τα δεδομένα σας. Μοιραζόμαστε μόνο με:' : 'We don\'t sell your data. We only share with:'}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>BOXNOW:</strong> {locale === 'el' ? 'Για παράδοση' : 'For delivery'}</li>
                <li><strong>Viva Wallet:</strong> {locale === 'el' ? 'Για πληρωμές (χωρίς στοιχεία καρτών)' : 'For payments (without card details)'}</li>
                <li>{locale === 'el' ? 'Νομικές αρχές (μόνο αν απαιτείται)' : 'Legal authorities (only if required)'}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              {locale === 'el' ? '6. Cookies & Τοπική Αποθήκευση' : '6. Cookies & Local Storage'}
            </h2>
            <div className="text-slate-700 text-sm space-y-3">
              <p className="font-medium">{locale === 'el' ? 'ΔΕΝ χρησιμοποιούμε:' : 'We do NOT use:'}</p>
              <p className="text-xs">Tracking, Analytics, Διαφημίσεις, Google Analytics, Facebook Pixel</p>
              
              <p className="font-medium mt-3">{locale === 'el' ? 'Χρησιμοποιούμε ΜΟΝΟ:' : 'We ONLY use:'}</p>
              <ul className="text-xs space-y-1 list-disc pl-5">
                <li><code className="bg-slate-100 px-1 py-0.5 rounded">locale</code> - {locale === 'el' ? 'Γλώσσα' : 'Language'}</li>
                <li><code className="bg-slate-100 px-1 py-0.5 rounded">cart-storage</code> - {locale === 'el' ? 'Καλάθι' : 'Cart'}</li>
                <li><code className="bg-slate-100 px-1 py-0.5 rounded">checkout_data</code> - {locale === 'el' ? 'Φόρμα' : 'Form'}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8 border-l-4 border-blue-500 pl-4 bg-blue-50 py-3">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              {locale === 'el' ? '7. Τα Δικαιώματά σας (GDPR)' : '7. Your Rights (GDPR)'}
            </h2>
            <div className="text-slate-700 text-sm space-y-2">
              <p>{locale === 'el' ? 'Έχετε δικαίωμα:' : 'You have the right to:'}</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>{locale === 'el' ? 'Πρόσβασης στα δεδομένα σας' : 'Access your data'}</li>
                <li>{locale === 'el' ? 'Διόρθωσης ανακριβών δεδομένων' : 'Rectify inaccurate data'}</li>
                <li>{locale === 'el' ? 'Διαγραφής ("δικαίωμα στη λήθη")' : 'Erasure ("right to be forgotten")'}</li>
                <li>{locale === 'el' ? 'Καταγγελίας στην Αρχή Προστασίας Δεδομένων' : 'Lodge a complaint'}</li>
              </ul>
              <p className="text-xs mt-3">
                <strong>{locale === 'el' ? 'Επικοινωνία:' : 'Contact:'}</strong> tinkerbellkalamatas@gmail.com
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900">
              {locale === 'el' ? '8. Ασφάλεια & Διατήρηση' : '8. Security & Retention'}
            </h2>
            <div className="text-slate-700 text-sm space-y-2">
              <p><strong>{locale === 'el' ? 'Ασφάλεια:' : 'Security:'}</strong> SSL/TLS encryption, περιορισμένη πρόσβαση</p>
              <p><strong>{locale === 'el' ? 'Διατήρηση:' : 'Retention:'}</strong> Παραγγελίες 10 έτη, επικοινωνία 2 έτη</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>{locale === 'el' ? 'Συμμόρφωση με GDPR (ΕΕ) 2016/679' : 'GDPR (EU) 2016/679 Compliant'}</p>
        </div>

      </div>
    </div>
  );
}
