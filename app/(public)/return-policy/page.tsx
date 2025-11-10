"use client"

import { useLocale } from 'next-intl';

export default function ReturnPolicyPage() {
  const locale = useLocale();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {locale === 'el' ? 'Πολιτική Επιστροφών' : 'Return Policy'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {locale === 'el' ? 'Δικαίωμα υπαναχώρησης & επιστροφές προϊόντων' : 'Right of withdrawal & product returns'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          
          {/* Important Notice */}
          <section className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-xl border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-400">
              {locale === 'el' ? '📋 Δικαίωμα Υπαναχώρησης (Ν. 2251/1994)' : '📋 Right of Withdrawal (Law 2251/1994)'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-semibold text-foreground">
                {locale === 'el' 
                  ? 'Σύμφωνα με την Ελληνική και Ευρωπαϊκή νομοθεσία (Οδηγία 2011/83/ΕΕ), έχετε δικαίωμα ΑΝΑΙΤΙΟΛΟΓΗΤΗΣ υπαναχώρησης:'
                  : 'According to Greek and European legislation (Directive 2011/83/EU), you have the right to UNCONDITIONAL withdrawal:'}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>14 {locale === 'el' ? 'ημερολογιακές ημέρες' : 'calendar days'}</strong> {locale === 'el' ? 'από την παραλαβή' : 'from receipt'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{locale === 'el' ? 'Χωρίς να χρειάζεται να δώσετε αιτιολογία' : 'Without needing to provide a reason'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{locale === 'el' ? 'Πλήρης επιστροφή χρημάτων εντός 14 ημερών' : 'Full refund within 14 days'}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '1. Προϋποθέσεις Επιστροφής' : '1. Return Conditions'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{locale === 'el' ? 'Για να γίνει δεκτή η επιστροφή, τα προϊόντα πρέπει:' : 'For a return to be accepted, products must:'}</p>
              <ul className="space-y-2">
                <li>• {locale === 'el' ? 'Να είναι αχρησιμοποίητα και στην αρχική κατάσταση' : 'Be unused and in original condition'}</li>
                <li>• {locale === 'el' ? 'Να διατηρούν όλες τις ετικέτες' : 'Retain all labels'}</li>
                <li>• {locale === 'el' ? 'Να έχουν την αρχική συσκευασία' : 'Have original packaging'}</li>
                <li>• {locale === 'el' ? 'Να συνοδεύονται από απόδειξη/τιμολόγιο' : 'Be accompanied by receipt/invoice'}</li>
                <li>• {locale === 'el' ? 'Να μην έχουν φθορά ή ζημιά' : 'Not have wear or damage'}</li>
              </ul>
              <p className="text-sm bg-muted/50 p-3 rounded-lg mt-4">
                <strong>{locale === 'el' ? '💡 Σημείωση:' : '💡 Note:'}</strong> {locale === 'el' ? 'Μπορείτε να δοκιμάσετε το προϊόν, αλλά όχι να το χρησιμοποιήσετε' : 'You can try the product, but not use it'}
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '2. Εξαιρέσεις (Ν. 2251/1994)' : '2. Exceptions (Law 2251/1994)'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{locale === 'el' ? 'Για λόγους υγιεινής και ασφάλειας, ΔΕΝ επιστρέφονται (εκτός ελαττώματος):' : 'For hygiene and safety reasons, the following are NOT returnable (unless defective):'}</p>
              <ul className="space-y-2">
                <li>• {locale === 'el' ? 'Εσώρουχα και ρούχα κολύμβησης' : 'Underwear and swimwear'}</li>
                <li>• {locale === 'el' ? 'Καλσόν, κάλτσες' : 'Tights, socks'}</li>
                <li>• {locale === 'el' ? 'Βαπτιστικά με κέντημα/προσαρμογή' : 'Baptism items with embroidery/customization'}</li>
                <li>• {locale === 'el' ? 'Εξατομικευμένα προϊόντα' : 'Personalized products'}</li>
                <li>• {locale === 'el' ? 'Προϊόντα με σφραγισμένη συσκευασία που ανοίχτηκε' : 'Sealed products that were opened'}</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '3. Διαδικασία Επιστροφής' : '3. Return Process'}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                    <h3 className="font-semibold text-foreground">{locale === 'el' ? 'Επικοινωνία' : 'Contact'}</h3>
                  </div>
                  <p className="text-sm">
                    Email: <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-primary hover:underline">tinkerbellkalamatas@gmail.com</a><br />
                    Τηλ: 2721 406303<br />
                    {locale === 'el' ? 'Εντός 14 ημερών από παραλαβή' : 'Within 14 days of receipt'}
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                    <h3 className="font-semibold text-foreground">{locale === 'el' ? 'Αριθμός RMA' : 'RMA Number'}</h3>
                  </div>
                  <p className="text-sm">
                    {locale === 'el' 
                      ? 'Θα σας δώσουμε μοναδικό αριθμό επιστροφής (RMA) για παρακολούθηση'
                      : 'We will provide a unique return number (RMA) for tracking'}
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                    <h3 className="font-semibold text-foreground">{locale === 'el' ? 'Συσκευασία' : 'Packaging'}</h3>
                  </div>
                  <p className="text-sm">
                    {locale === 'el' 
                      ? 'Συσκευάστε προσεκτικά στην αρχική συσκευασία'
                      : 'Pack carefully in original packaging'}
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</span>
                    <h3 className="font-semibold text-foreground">{locale === 'el' ? 'Αποστολή' : 'Shipping'}</h3>
                  </div>
                  <p className="text-sm">
                    {locale === 'el' 
                      ? 'Αποστολή στη διεύθυνση που θα σας υποδείξουμε'
                      : 'Ship to the address we provide'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '4. Έξοδα Επιστροφής' : '4. Return Costs'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                <p className="font-semibold text-red-800 dark:text-red-400 mb-2">
                  {locale === 'el' ? '❌ Απλή Μεταγνώμηση:' : '❌ Simple Change of Mind:'}
                </p>
                <p className="text-sm">{locale === 'el' ? 'Τα έξοδα επιστροφής βαρύνουν τον πελάτη' : 'Return shipping costs are borne by the customer'}</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  {locale === 'el' ? '✓ Ελάττωμα ή Λάθος:' : '✓ Defect or Error:'}
                </p>
                <p className="text-sm">{locale === 'el' ? 'Όλα τα έξοδα βαρύνουν εμάς (επιστροφή + νέα αποστολή)' : 'All costs are on us (return + new shipment)'}</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '5. Επιστροφή Χρημάτων' : '5. Refund'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-semibold text-foreground">
                {locale === 'el' 
                  ? 'Σύμφωνα με το νόμο, επιστρέφουμε τα χρήματα:'
                  : 'According to law, we refund:'}
              </p>
              <ul className="space-y-2">
                <li>• {locale === 'el' ? 'Με τον ίδιο τρόπο πληρωμής (Viva Wallet)' : 'Same payment method (Viva Wallet)'}</li>
                <li>• <strong>{locale === 'el' ? 'Εντός 14 ημερών' : 'Within 14 days'}</strong> {locale === 'el' ? 'από την παραλαβή των προϊόντων' : 'from receiving the products'}</li>
                <li>• {locale === 'el' ? 'Αφού ελεγχθεί η κατάσταση' : 'After condition inspection'}</li>
                <li>• {locale === 'el' ? 'Πλήρες ποσό (εκτός μεταφορικών σε μεταγνώμηση)' : 'Full amount (excluding shipping for change of mind)'}</li>
              </ul>
              <p className="text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg mt-4 border-l-4 border-amber-500">
                <strong>⚠️ {locale === 'el' ? 'Προσοχή:' : 'Attention:'}</strong> {locale === 'el' ? 'Αν τα προϊόντα επιστραφούν χρησιμοποιημένα ή φθαρμένα, διατηρούμε το δικαίωμα να παρακρατήσουμε μέρος ή το σύνολο του ποσού' : 'If products are returned used or damaged, we reserve the right to withhold part or all of the amount'}
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '6. Ελαττωματικά Προϊόντα' : '6. Defective Products'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{locale === 'el' ? 'Αν παραλάβατε ελαττωματικό ή λανθασμένο προϊόν:' : 'If you received a defective or incorrect product:'}</p>
              <ul className="space-y-2">
                <li>• {locale === 'el' ? 'Επικοινωνήστε ΑΜΕΣΑ εντός 7 ημερών' : 'Contact IMMEDIATELY within 7 days'}</li>
                <li>• {locale === 'el' ? 'Στείλτε φωτογραφίες του προβλήματος' : 'Send photos of the problem'}</li>
                <li>• {locale === 'el' ? 'Αντικατάσταση ΔΩΡΕΑΝ ή πλήρης επιστροφή χρημάτων' : 'FREE replacement or full refund'}</li>
                <li>• {locale === 'el' ? 'Όλα τα έξοδα (αποστολή πίσω + νέα αποστολή) βαρύνουν εμάς' : 'All costs (return + new shipment) are on us'}</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">
              {locale === 'el' ? '7. Αλλαγές Προϊόντων' : '7. Product Exchanges'}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{locale === 'el' ? 'Για αλλαγή μεγέθους, χρώματος ή μοντέλου:' : 'For size, color or model exchange:'}</p>
              <ul className="space-y-2">
                <li>• {locale === 'el' ? 'Επικοινωνήστε το συντομότερο δυνατό' : 'Contact us as soon as possible'}</li>
                <li>• {locale === 'el' ? 'Υπόκειται σε διαθεσιμότητα' : 'Subject to availability'}</li>
                <li>• {locale === 'el' ? 'Δεν χρεώνουμε επιπλέον (μόνο μεταφορικά)' : 'No extra charges (shipping only)'}</li>
                <li>• {locale === 'el' ? 'Ίδια διαδικασία με την επιστροφή' : 'Same process as return'}</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-muted/30 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">
              {locale === 'el' ? '📞 Επικοινωνία για Επιστροφές' : '📞 Contact for Returns'}
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email (προτιμώμενο):</strong> <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-primary hover:underline">tinkerbellkalamatas@gmail.com</a></p>
              <p><strong>{locale === 'el' ? 'Τηλέφωνο:' : 'Phone:'}</strong> 2721 406303 ({locale === 'el' ? 'Δευ-Παρ, 9:00-17:00' : 'Mon-Fri, 9:00-17:00'})</p>
              <p><strong>{locale === 'el' ? 'Διεύθυνση:' : 'Address:'}</strong> Γεωργούλη 8, Καλαμάτα 24100</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              <strong>⚠️</strong> {locale === 'el' ? 'Μην αποστείλετε προϊόντα χωρίς πρώτα να λάβετε αριθμό RMA' : 'Do not send products without first receiving an RMA number'}
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}</p>
          <p className="mt-2">
            {locale === 'el' ? 'Σύμφωνα με Ν. 2251/1994 & Οδηγία 2011/83/ΕΕ' : 'According to Law 2251/1994 & Directive 2011/83/EU'}
          </p>
        </div>
      </div>
    </div>
  );
}
