import { useLocale } from 'next-intl';

export default function PrivacyPolicyPage() {
  const locale = useLocale();
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">
        {locale === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
      </h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '1. Εισαγωγή' : '1. Introduction'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Το Τινκερμπελ δεσμεύεται να προστατεύει την προσωπική σας ιδιωτικότητα. Η παρούσα Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε, κοινοποιούμε και προστατεύουμε τις προσωπικές σας πληροφορίες όταν χρησιμοποιείτε την ιστοσελίδα μας.' : 'Tinkerbell is committed to protecting your personal privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our website.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '2. Πληροφορίες που Συλλέγουμε' : '2. Information We Collect'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Συλλέγουμε τις ακόλουθες πληροφορίες:' : 'We collect the following information:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Στοιχεία επικοινωνίας (όνομα, email, τηλέφωνο)' : 'Contact details (name, email, phone)'}</li>
            <li>{locale === 'el' ? 'Διεύθυνση αποστολής και χρέωσης' : 'Shipping and billing address'}</li>
            <li>{locale === 'el' ? 'Πληροφορίες παραγγελίας και ιστορικό αγορών' : 'Order information and purchase history'}</li>
            <li>{locale === 'el' ? 'Πληροφορίες πλοήγησης (cookies, IP address)' : 'Browsing information (cookies, IP address)'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '3. Χρήση Πληροφοριών' : '3. Use of Information'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Χρησιμοποιούμε τις πληροφορίες σας για:' : 'We use your information to:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Επεξεργασία και εκτέλεση παραγγελιών' : 'Process and fulfill orders'}</li>
            <li>{locale === 'el' ? 'Επικοινωνία σχετικά με τις παραγγελίες σας' : 'Communicate about your orders'}</li>
            <li>{locale === 'el' ? 'Βελτίωση των υπηρεσιών μας' : 'Improve our services'}</li>
            <li>{locale === 'el' ? 'Αποστολή ενημερώσεων και προωθητικών προσφορών (με τη συγκατάθεσή σας)' : 'Send updates and promotional offers (with your consent)'}</li>
            <li>{locale === 'el' ? 'Προστασία από απάτες και ασφάλεια της πλατφόρμας' : 'Protect against fraud and ensure platform security'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '4. Κοινοποίηση Πληροφοριών' : '4. Sharing Information'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Δεν πουλάμε ούτε μισθώνουμε τα προσωπικά σας δεδομένα σε τρίτους. Μπορεί να κοινοποιήσουμε πληροφορίες με:' : 'We do not sell or rent your personal data to third parties. We may share information with:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Εταιρείες μεταφορών για την παράδοση των προϊόντων' : 'Shipping companies for product delivery'}</li>
            <li>{locale === 'el' ? 'Παρόχους υπηρεσιών πληρωμών για την επεξεργασία συναλλαγών' : 'Payment service providers for transaction processing'}</li>
            <li>{locale === 'el' ? 'Νομικές αρχές όταν απαιτείται από το νόμο' : 'Legal authorities when required by law'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '5. Cookies' : '5. Cookies'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας στην ιστοσελίδα μας. Τα cookies μας βοηθούν να απομνημονεύουμε τις προτιμήσεις σας και να αναλύουμε την κίνηση στην ιστοσελίδα. Μπορείτε να ρυθμίσετε τον browser σας να απορρίπτει cookies, αλλά αυτό μπορεί να περιορίσει κάποιες λειτουργίες.' : 'We use cookies to improve your experience on our website. Cookies help us remember your preferences and analyze website traffic. You can set your browser to reject cookies, but this may limit some functionality.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '6. Ασφάλεια Δεδομένων' : '6. Data Security'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Λαμβάνουμε κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των προσωπικών σας δεδομένων από μη εξουσιοδοτημένη πρόσβαση, απώλεια ή καταστροφή. Οι συναλλαγές πληρωμής γίνονται μέσω ασφαλών καναλιών με κρυπτογράφηση.' : 'We take appropriate technical and organizational measures to protect your personal data from unauthorized access, loss, or destruction. Payment transactions are conducted through secure channels with encryption.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '7. Τα Δικαιώματά Σας' : '7. Your Rights'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Σύμφωνα με τον GDPR, έχετε το δικαίωμα:' : 'Under GDPR, you have the right to:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Πρόσβασης στα προσωπικά σας δεδομένα' : 'Access your personal data'}</li>
            <li>{locale === 'el' ? 'Διόρθωσης ανακριβών δεδομένων' : 'Rectify inaccurate data'}</li>
            <li>{locale === 'el' ? 'Διαγραφής των δεδομένων σας' : 'Erase your data'}</li>
            <li>{locale === 'el' ? 'Περιορισμού της επεξεργασίας' : 'Restrict processing'}</li>
            <li>{locale === 'el' ? 'Φορητότητας δεδομένων' : 'Data portability'}</li>
            <li>{locale === 'el' ? 'Εναντίωσης στην επεξεργασία' : 'Object to processing'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '8. Διατήρηση Δεδομένων' : '8. Data Retention'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Διατηρούμε τα προσωπικά σας δεδομένα για όσο χρονικό διάστημα είναι απαραίτητο για την εκπλήρωση των σκοπών που περιγράφονται σε αυτή την πολιτική, εκτός εάν απαιτείται ή επιτρέπεται μεγαλύτερη περίοδος διατήρησης από το νόμο.' : 'We retain your personal data for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '9. Αλλαγές στην Πολιτική' : '9. Policy Changes'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Διατηρούμε το δικαίωμα να τροποποιήσουμε αυτή την Πολιτική Απορρήτου ανά πάσα στιγμή. Οι αλλαγές θα δημοσιεύονται σε αυτή τη σελίδα και θα ισχύουν αμέσως μετά τη δημοσίευσή τους.' : 'We reserve the right to modify this Privacy Policy at any time. Changes will be posted on this page and take effect immediately upon publication.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '10. Επικοινωνία' : '10. Contact'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Για ερωτήσεις σχετικά με την πολιτική απορρήτου, επικοινωνήστε μαζί μας:' : 'For questions about our privacy policy, please contact us:'}
          </p>
          <div className="text-muted-foreground">
            <p>Email: tinkerbellkalamatas@gmail.com</p>
            <p>{locale === 'el' ? 'Τηλέφωνο' : 'Phone'}: 2721 406303</p>
          </div>
        </section>

        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          <p>{locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}</p>
        </div>
      </div>
    </div>
  );
}
