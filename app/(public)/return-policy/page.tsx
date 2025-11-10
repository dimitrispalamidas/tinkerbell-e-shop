"use client"

import { useLocale } from 'next-intl';

export default function ReturnPolicyPage() {
  const locale = useLocale();
  
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900 ">
            {locale === 'el' ? 'Πολιτική Επιστροφών' : 'Return Policy'}
          </h1>
          <p className="text-slate-600 ">
            {locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">
          
          <section className="mb-8 border-l-4 border-blue-500 pl-4 bg-blue-50  py-3">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? 'Δικαίωμα Υπαναχώρησης (Ν. 2251/1994)' : 'Right of Withdrawal (Law 2251/1994)'}
            </h2>
            <div className="text-slate-700  text-sm space-y-2">
              <p>
                {locale === 'el' 
                  ? 'Σύμφωνα με την Ελληνική και Ευρωπαϊκή νομοθεσία (Οδηγία 2011/83/ΕΕ), έχετε δικαίωμα ΑΝΑΙΤΙΟΛΟΓΗΤΗΣ υπαναχώρησης:'
                  : 'According to Greek and European legislation (Directive 2011/83/EU), you have the right to UNCONDITIONAL withdrawal:'}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>14 {locale === 'el' ? 'ημερολογιακές ημέρες' : 'calendar days'}</strong> {locale === 'el' ? 'από την παραλαβή' : 'from receipt'}</li>
                <li>{locale === 'el' ? 'Χωρίς να χρειάζεται αιτιολογία' : 'Without needing a reason'}</li>
                <li>{locale === 'el' ? 'Πλήρης επιστροφή χρημάτων εντός 14 ημερών' : 'Full refund within 14 days'}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '1. Προϋποθέσεις Επιστροφής' : '1. Return Conditions'}
            </h2>
            <div className="text-slate-700  text-sm space-y-2">
              <p>{locale === 'el' ? 'Για να γίνει δεκτή η επιστροφή, τα προϊόντα πρέπει:' : 'For a return to be accepted, products must:'}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{locale === 'el' ? 'Να είναι αχρησιμοποίητα και στην αρχική κατάσταση' : 'Be unused and in original condition'}</li>
                <li>{locale === 'el' ? 'Να διατηρούν όλες τις ετικέτες' : 'Retain all labels'}</li>
                <li>{locale === 'el' ? 'Να έχουν την αρχική συσκευασία' : 'Have original packaging'}</li>
                <li>{locale === 'el' ? 'Να συνοδεύονται από απόδειξη' : 'Be accompanied by receipt'}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '2. Εξαιρέσεις' : '2. Exceptions'}
            </h2>
            <div className="text-slate-700  text-sm space-y-2">
              <p>{locale === 'el' ? 'ΔΕΝ επιστρέφονται (εκτός ελαττώματος):' : 'NOT returnable (unless defective):'}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{locale === 'el' ? 'Εσώρουχα και ρούχα κολύμβησης' : 'Underwear and swimwear'}</li>
                <li>{locale === 'el' ? 'Βαπτιστικά με κέντημα/προσαρμογή' : 'Baptism items with embroidery'}</li>
                <li>{locale === 'el' ? 'Εξατομικευμένα προϊόντα' : 'Personalized products'}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '3. Διαδικασία Επιστροφής' : '3. Return Process'}
            </h2>
            <div className="text-slate-700  text-sm space-y-3">
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>{locale === 'el' ? 'Επικοινωνία:' : 'Contact:'}</strong> tinkerbellkalamatas@gmail.com ή 2721 406303 (εντός 14 ημερών)</li>
                <li><strong>{locale === 'el' ? 'Αριθμός RMA:' : 'RMA Number:'}</strong> {locale === 'el' ? 'Θα σας δώσουμε μοναδικό αριθμό' : 'We will provide a unique number'}</li>
                <li><strong>{locale === 'el' ? 'Συσκευασία:' : 'Packaging:'}</strong> {locale === 'el' ? 'Στην αρχική συσκευασία' : 'In original packaging'}</li>
                <li><strong>{locale === 'el' ? 'Αποστολή:' : 'Shipping:'}</strong> {locale === 'el' ? 'Στη διεύθυνση που θα υποδείξουμε' : 'To address we provide'}</li>
              </ol>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '4. Έξοδα Επιστροφής' : '4. Return Costs'}
            </h2>
            <div className="text-slate-700  text-sm space-y-2">
              <p><strong>{locale === 'el' ? 'Μεταγνώμηση:' : 'Change of mind:'}</strong> {locale === 'el' ? 'Τα έξοδα βαρύνουν τον πελάτη' : 'Customer pays shipping'}</p>
              <p><strong>{locale === 'el' ? 'Ελάττωμα:' : 'Defect:'}</strong> {locale === 'el' ? 'Τα έξοδα βαρύνουν εμάς' : 'We pay all costs'}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '5. Επιστροφή Χρημάτων' : '5. Refund'}
            </h2>
            <div className="text-slate-700  text-sm space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li>{locale === 'el' ? 'Ίδιος τρόπος πληρωμής (Viva Wallet)' : 'Same payment method (Viva Wallet)'}</li>
                <li><strong>{locale === 'el' ? 'Εντός 14 ημερών' : 'Within 14 days'}</strong> {locale === 'el' ? 'από παραλαβή' : 'from receipt'}</li>
                <li>{locale === 'el' ? 'Αφού ελεγχθεί η κατάσταση' : 'After condition check'}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 ">
              {locale === 'el' ? '6. Επικοινωνία' : '6. Contact'}
            </h2>
            <div className="text-slate-700  text-sm space-y-1">
              <p>Email: <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-blue-600 hover:underline">tinkerbellkalamatas@gmail.com</a></p>
              <p>Τηλ: 2721 406303 ({locale === 'el' ? 'Δευ-Παρ, 9:00-17:00' : 'Mon-Fri, 9:00-17:00'})</p>
              <p>Γεωργούλη 8, Καλαμάτα 24100</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-200  text-center text-xs text-slate-500">
          <p>{locale === 'el' ? 'Σύμφωνα με Ν. 2251/1994 & Οδηγία 2011/83/ΕΕ' : 'According to Law 2251/1994 & Directive 2011/83/EU'}</p>
        </div>

      </div>
    </div>
  );
}
