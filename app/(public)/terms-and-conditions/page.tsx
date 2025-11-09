"use client"

import { useLocale } from 'next-intl';

export default function TermsAndConditionsPage() {
  const locale = useLocale();
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">
        {locale === 'el' ? 'Όροι και Προϋποθέσεις' : 'Terms and Conditions'}
      </h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '1. Γενικοί Όροι' : '1. General Terms'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Καλώς ήρθατε στην ιστοσελίδα του Τινκερμπελ. Χρησιμοποιώντας την ιστοσελίδα μας, αποδέχεστε αυτούς τους όρους και προϋποθέσεις στο σύνολό τους. Εάν διαφωνείτε με οποιοδήποτε μέρος αυτών των όρων, παρακαλούμε μην χρησιμοποιείτε την ιστοσελίδα μας.' : 'Welcome to Tinkerbell\'s website. By using our website, you accept these terms and conditions in full. If you disagree with any part of these terms, please do not use our website.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '2. Προϊόντα και Τιμές' : '2. Products and Prices'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Όλα τα προϊόντα υπόκεινται σε διαθεσιμότητα. Διατηρούμε το δικαίωμα να περιορίσουμε την ποσότητα οποιουδήποτε προϊόντος που προσφέρουμε.' : 'All products are subject to availability. We reserve the right to limit the quantity of any product we offer.'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Οι τιμές υπόκεινται σε αλλαγή χωρίς προειδοποίηση' : 'Prices are subject to change without notice'}</li>
            <li>{locale === 'el' ? 'Όλες οι τιμές εμφανίζονται σε Ευρώ (€) και συμπεριλαμβάνουν ΦΠΑ' : 'All prices are displayed in Euros (€) and include VAT'}</li>
            <li>{locale === 'el' ? 'Οι φωτογραφίες των προϊόντων είναι ενδεικτικές' : 'Product photos are indicative'}</li>
            <li>{locale === 'el' ? 'Τα χρώματα μπορεί να διαφέρουν ελαφρώς από την πραγματικότητα' : 'Colors may vary slightly from actual appearance'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '3. Παραγγελίες' : '3. Orders'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Κάθε παραγγελία αποτελεί προσφορά αγοράς προϊόντων από εσάς. Διατηρούμε το δικαίωμα να αποδεχτούμε ή να απορρίψουμε την παραγγελία σας για οποιονδήποτε λόγο.' : 'Each order constitutes an offer to purchase products from you. We reserve the right to accept or reject your order for any reason.'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Θα λάβετε email επιβεβαίωσης μετά την ολοκλήρωση της παραγγελίας' : 'You will receive a confirmation email after completing your order'}</li>
            <li>{locale === 'el' ? 'Η επιβεβαίωση email δεν σημαίνει αποδοχή της παραγγελίας' : 'Email confirmation does not mean order acceptance'}</li>
            <li>{locale === 'el' ? 'Αποδεχόμαστε την παραγγελία όταν αποστείλουμε τα προϊόντα' : 'We accept the order when we ship the products'}</li>
            <li>{locale === 'el' ? 'Σε περίπτωση μη διαθεσιμότητας, θα επικοινωνήσουμε μαζί σας' : 'In case of unavailability, we will contact you'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '4. Πληρωμές' : '4. Payments'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Αποδεχόμαστε πληρωμές μέσω:' : 'We accept payments via:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Χρεωστικές/Πιστωτικές κάρτες (Visa, Mastercard)' : 'Debit/Credit cards (Visa, Mastercard)'}</li>
            <li>{locale === 'el' ? 'Ηλεκτρονική τραπεζική (μέσω Viva Wallet)' : 'Online banking (via Viva Wallet)'}</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            {locale === 'el' ? 'Όλες οι πληρωμές επεξεργάζονται με ασφάλεια μέσω της Viva Wallet. Δεν αποθηκεύουμε στοιχεία πιστωτικών καρτών στους servers μας.' : 'All payments are processed securely through Viva Wallet. We do not store credit card details on our servers.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '5. Αποστολή' : '5. Shipping'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Οι παραδόσεις πραγματοποιούνται σε όλη την Ελλάδα.' : 'Deliveries are made throughout Greece.'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Χρόνος παράδοσης: 1-3 εργάσιμες ημέρες' : 'Delivery time: 1-3 business days'}</li>
            <li>{locale === 'el' ? 'Διατίθεται αποστολή σε BOXNOW Locker' : 'BOXNOW Locker delivery available'}</li>
            <li>{locale === 'el' ? 'Τα μεταφορικά υπολογίζονται κατά την ολοκλήρωση της παραγγελίας' : 'Shipping costs are calculated at checkout'}</li>
            <li>{locale === 'el' ? 'Δωρεάν μεταφορικά για παραγγελίες άνω των 50€' : 'Free shipping for orders over €50'}</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            {locale === 'el' ? 'Δεν φέρουμε ευθύνη για καθυστερήσεις που οφείλονται στην εταιρεία μεταφορών ή ανωτέρα βία.' : 'We are not responsible for delays caused by the shipping company or force majeure.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '6. Εγγύηση και Ελαττώματα' : '6. Warranty and Defects'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Όλα τα προϊόντα μας διαθέτουν εγγύηση καλής λειτουργίας και ποιότητας. Εάν παραλάβετε ελαττωματικό προϊόν:' : 'All our products come with a quality warranty. If you receive a defective product:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Επικοινωνήστε μαζί μας εντός 7 ημερών από την παραλαβή' : 'Contact us within 7 days of receipt'}</li>
            <li>{locale === 'el' ? 'Στείλτε φωτογραφίες του ελαττώματος' : 'Send photos of the defect'}</li>
            <li>{locale === 'el' ? 'Θα αντικαταστήσουμε το προϊόν ή θα επιστρέψουμε τα χρήματά σας' : 'We will replace the product or refund your money'}</li>
            <li>{locale === 'el' ? 'Τα έξοδα επιστροφής βαρύνουν εμάς' : 'Return shipping costs are on us'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '7. Περιορισμός Ευθύνης' : '7. Limitation of Liability'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Το Τινκερμπελ δεν φέρει ευθύνη για:' : 'Tinkerbell is not responsible for:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Έμμεσες ή παρεπόμενες ζημίες' : 'Indirect or consequential damages'}</li>
            <li>{locale === 'el' ? 'Απώλεια κερδών ή δεδομένων' : 'Loss of profits or data'}</li>
            <li>{locale === 'el' ? 'Διακοπή υπηρεσιών' : 'Service interruption'}</li>
            <li>{locale === 'el' ? 'Λάθη στην ιστοσελίδα ή στις πληροφορίες προϊόντων' : 'Errors on the website or in product information'}</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            {locale === 'el' ? 'Η συνολική ευθύνη μας περιορίζεται στο ποσό που καταβάλατε για τη συγκεκριμένη παραγγελία.' : 'Our total liability is limited to the amount you paid for the specific order.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '8. Πνευματική Ιδιοκτησία' : '8. Intellectual Property'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Όλο το περιεχόμενο της ιστοσελίδας (κείμενα, εικόνες, λογότυπα, σχέδια) προστατεύεται από πνευματικά δικαιώματα και ανήκει στο Τινκερμπελ. Απαγορεύεται η αναπαραγωγή χωρίς γραπτή άδεια.' : 'All website content (texts, images, logos, designs) is protected by copyright and belongs to Tinkerbell. Reproduction without written permission is prohibited.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '9. Εφαρμοστέο Δίκαιο' : '9. Applicable Law'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Οι παρόντες όροι διέπονται από το Ελληνικό Δίκαιο. Για οποιαδήποτε διαφορά αρμόδια είναι τα Δικαστήρια της Αθήνας.' : 'These terms are governed by Greek Law. The courts of Athens have jurisdiction over any disputes.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '10. Τροποποιήσεις Όρων' : '10. Modifications to Terms'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Διατηρούμε το δικαίωμα να τροποποιούμε αυτούς τους όρους ανά πάσα στιγμή. Οι αλλαγές τίθενται σε ισχύ αμέσως μετά τη δημοσίευσή τους στην ιστοσελίδα.' : 'We reserve the right to modify these terms at any time. Changes take effect immediately upon publication on the website.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '11. Επικοινωνία' : '11. Contact'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Για ερωτήσεις σχετικά με τους όρους και προϋποθέσεις:' : 'For questions about the terms and conditions:'}
          </p>
          <div className="text-muted-foreground">
            <p>Email: tinkerbellkalamatas@gmail.com</p>
            <p>{locale === 'el' ? 'Τηλέφωνο' : 'Phone'}: 2721 406303</p>
            <p>{locale === 'el' ? 'Διεύθυνση' : 'Address'}: Γεωργούλη 8, Καλαμάτα</p>
          </div>
        </section>

        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          <p>{locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}</p>
        </div>
      </div>
    </div>
  );
}
