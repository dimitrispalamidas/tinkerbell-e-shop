"use client"

import { useLocale } from 'next-intl';

export default function ReturnPolicyPage() {
  const locale = useLocale();
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">
        {locale === 'el' ? 'Πολιτική Επιστροφών' : 'Return Policy'}
      </h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '1. Δικαίωμα Υπαναχώρησης' : '1. Right of Withdrawal'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Σύμφωνα με τον Ελληνικό και Ευρωπαϊκό Νόμο για την Προστασία του Καταναλωτή, έχετε το δικαίωμα να υπαναχωρήσετε από την αγορά σας εντός 14 ημερολογιακών ημερών από την ημερομηνία παραλαβής του προϊόντος, χωρίς να χρειάζεται να δώσετε αιτιολογία.' : 'According to Greek and European Consumer Protection Law, you have the right to withdraw from your purchase within 14 calendar days from the date of receipt of the product, without needing to provide a reason.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '2. Προϋποθέσεις Επιστροφής' : '2. Return Conditions'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Για να είναι αποδεκτή η επιστροφή, τα προϊόντα πρέπει:' : 'For a return to be accepted, products must:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Να είναι στην αρχική τους κατάσταση, αχρησιμοποίητα' : 'Be in their original condition, unused'}</li>
            <li>{locale === 'el' ? 'Να διατηρούν όλες τις ετικέτες και τη συσκευασία τους' : 'Retain all labels and packaging'}</li>
            <li>{locale === 'el' ? 'Να συνοδεύονται από την απόδειξη ή το τιμολόγιο αγοράς' : 'Be accompanied by the receipt or invoice'}</li>
            <li>{locale === 'el' ? 'Να μην έχουν χρησιμοποιηθεί, πλυθεί ή φορεθεί (εκτός από δοκιμή)' : 'Not have been used, washed, or worn (except for trying on)'}</li>
            <li>{locale === 'el' ? 'Να μην έχουν υποστεί φθορά ή ζημιά' : 'Not have suffered wear or damage'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '3. Προϊόντα που Εξαιρούνται' : '3. Excluded Products'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Για λόγους υγιεινής, τα παρακάτω προϊόντα δεν μπορούν να επιστραφούν εκτός αν είναι ελαττωματικά:' : 'For hygiene reasons, the following products cannot be returned unless defective:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Εσώρουχα και ρούχα κολύμβησης' : 'Underwear and swimwear'}</li>
            <li>{locale === 'el' ? 'Καλσόν και κάλτσες' : 'Tights and socks'}</li>
            <li>{locale === 'el' ? 'Βαπτιστικά ρούχα που έχουν προσαρμοστεί ή κεντηθεί' : 'Baptism clothing that has been customized or embroidered'}</li>
            <li>{locale === 'el' ? 'Προϊόντα με προσωποποίηση' : 'Personalized products'}</li>
            <li>{locale === 'el' ? 'Προϊόντα σε προσφορά/έκπτωση (εκτός ελαττωμάτων)' : 'Sale/discounted products (except defects)'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '4. Διαδικασία Επιστροφής' : '4. Return Process'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Για να προχωρήσετε σε επιστροφή:' : 'To proceed with a return:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Επικοινωνήστε μαζί μας: Στείλτε email στο tinkerbellkalamatas@gmail.com ή καλέστε στο 2721 406303 εντός 14 ημερών από την παραλαβή' : 'Contact us: Send email to tinkerbellkalamatas@gmail.com or call 2721 406303 within 14 days of receipt'}</li>
            <li>{locale === 'el' ? 'Λάβετε αριθμό εξουσιοδότησης: Θα σας δώσουμε έναν μοναδικό αριθμό επιστροφής (RMA)' : 'Get authorization number: We will give you a unique return number (RMA)'}</li>
            <li>{locale === 'el' ? 'Συσκευάστε προσεκτικά: Συσκευάστε τα προϊόντα στην αρχική συσκευασία με όλα τα εξαρτήματα' : 'Pack carefully: Pack the products in original packaging with all accessories'}</li>
            <li>{locale === 'el' ? 'Αποστολή: Στείλτε τα προϊόντα στη διεύθυνση που θα σας υποδείξουμε' : 'Shipping: Send the products to the address we will provide'}</li>
            <li>{locale === 'el' ? 'Επιστροφή χρημάτων: Μετά τον έλεγχο, θα επιστρέψουμε τα χρήματα εντός 14 ημερών' : 'Refund: After inspection, we will refund within 14 days'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '5. Έξοδα Επιστροφής' : '5. Return Costs'}
          </h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Επιστροφή χωρίς ελάττωμα (απλή μεταγνώμηση): Τα έξοδα αποστολής επιστροφής βαρύνουν τον πελάτη.' : 'Return without defect (simple change of mind): Return shipping costs are borne by the customer.'}</li>
            <li>{locale === 'el' ? 'Επιστροφή λόγω ελαττώματος ή λάθους: Τα έξοδα επιστροφής και αποστολής του νέου προϊόντος βαρύνουν εμάς.' : 'Return due to defect or error: Return and new product shipping costs are on us.'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '6. Επιστροφή Χρημάτων' : '6. Refund'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Η επιστροφή χρημάτων γίνεται:' : 'Refunds are made:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Με τον ίδιο τρόπο που πληρώσατε αρχικά' : 'In the same way you originally paid'}</li>
            <li>{locale === 'el' ? 'Εντός 14 ημερών από την παραλαβή των επιστρεφόμενων προϊόντων' : 'Within 14 days of receiving the returned products'}</li>
            <li>{locale === 'el' ? 'Αφού ελεγχθεί η κατάσταση των προϊόντων' : 'After checking the condition of the products'}</li>
            <li>{locale === 'el' ? 'Για το πλήρες ποσό της αγοράς (εκτός μεταφορικών αν ισχύουν)' : 'For the full purchase amount (excluding shipping if applicable)'}</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            {locale === 'el' ? 'Σημείωση: Εάν τα προϊόντα επιστραφούν σε μη αποδεκτή κατάσταση, διατηρούμε το δικαίωμα να παρακρατήσουμε μέρος ή το σύνολο του ποσού επιστροφής.' : 'Note: If products are returned in unacceptable condition, we reserve the right to withhold part or all of the refund amount.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '7. Αλλαγές Προϊόντων' : '7. Product Exchanges'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Εάν επιθυμείτε να αλλάξετε μέγεθος, χρώμα ή μοντέλο:' : 'If you wish to exchange size, color, or model:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Επικοινωνήστε μαζί μας το συντομότερο δυνατό' : 'Contact us as soon as possible'}</li>
            <li>{locale === 'el' ? 'Η αλλαγή υπόκειται σε διαθεσιμότητα του επιθυμητού προϊόντος' : 'Exchange is subject to availability of the desired product'}</li>
            <li>{locale === 'el' ? 'Δεν χρεώνουμε επιπλέον έξοδα για αλλαγή (μόνο μεταφορικά)' : 'We do not charge extra fees for exchange (shipping only)'}</li>
            <li>{locale === 'el' ? 'Η διαδικασία είναι η ίδια με την επιστροφή' : 'The process is the same as for returns'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '8. Ελαττωματικά Προϊόντα' : '8. Defective Products'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Εάν παραλάβετε ελαττωματικό ή λανθασμένο προϊόν:' : 'If you receive a defective or incorrect product:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Επικοινωνήστε άμεσα μαζί μας εντός 7 ημερών' : 'Contact us immediately within 7 days'}</li>
            <li>{locale === 'el' ? 'Στείλτε φωτογραφίες του προβλήματος' : 'Send photos of the problem'}</li>
            <li>{locale === 'el' ? 'Θα αντικαταστήσουμε το προϊόν δωρεάν' : 'We will replace the product free of charge'}</li>
            <li>{locale === 'el' ? 'Ή θα επιστρέψουμε τα χρήματά σας πλήρως' : 'Or we will fully refund your money'}</li>
            <li>{locale === 'el' ? 'Όλα τα έξοδα βαρύνουν εμάς' : 'All costs are on us'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '9. Καθυστερήσεις στην Παράδοση' : '9. Delivery Delays'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Εάν η παραγγελία σας δεν παραδοθεί εντός του αναμενόμενου χρονικού διαστήματος:' : 'If your order is not delivered within the expected timeframe:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Επικοινωνήστε μαζί μας για διερεύνηση' : 'Contact us for investigation'}</li>
            <li>{locale === 'el' ? 'Θα παρακολουθήσουμε τη αποστολή' : 'We will track the shipment'}</li>
            <li>{locale === 'el' ? 'Αν χαθεί το δέμα, θα αποστείλουμε νέο ή θα επιστρέψουμε τα χρήματα' : 'If the package is lost, we will send a new one or refund'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '10. Άρνηση Παραλαβής' : '10. Refusal of Receipt'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Εάν αρνηθείτε την παραλαβή της παραγγελίας χωρίς λόγο, διατηρούμε το δικαίωμα να χρεώσουμε τα έξοδα μεταφορικών και διαχείρισης πριν επιστρέψουμε το υπόλοιπο ποσό.' : 'If you refuse receipt of the order without reason, we reserve the right to charge shipping and handling costs before refunding the remaining amount.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '11. Επικοινωνία για Επιστροφές' : '11. Contact for Returns'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Για οποιαδήποτε ερώτηση σχετικά με επιστροφές:' : 'For any questions about returns:'}
          </p>
          <div className="text-muted-foreground space-y-1">
            <p>{locale === 'el' ? 'Email: tinkerbellkalamatas@gmail.com (προτιμώμενος τρόπος)' : 'Email: tinkerbellkalamatas@gmail.com (preferred method)'}</p>
            <p>{locale === 'el' ? 'Τηλέφωνο: 2721 406303 (Δευ-Παρ, 9:00-17:00)' : 'Phone: 2721 406303 (Mon-Fri, 9:00-17:00)'}</p>
            <p>{locale === 'el' ? 'Διεύθυνση Επιστροφών: [Διεύθυνση που θα υποδειχθεί κατά την επικοινωνία]' : 'Return Address: [Address to be provided upon contact]'}</p>
          </div>
          <p className="text-muted-foreground mt-4">
            {locale === 'el' ? 'Σημείωση: Μην αποστείλετε προϊόντα χωρίς να επικοινωνήσετε πρώτα μαζί μας και να λάβετε αριθμό RMA.' : 'Note: Do not send products without first contacting us and receiving an RMA number.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'el' ? '12. Συμβουλές για Δοκιμή Προϊόντων' : '12. Tips for Trying Products'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {locale === 'el' ? 'Για να διατηρήσετε το δικαίωμα επιστροφής:' : 'To maintain your right of return:'}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{locale === 'el' ? 'Δοκιμάστε τα ρούχα σε καθαρό περιβάλλον' : 'Try clothes in a clean environment'}</li>
            <li>{locale === 'el' ? 'Μην αφαιρείτε τις ετικέτες μέχρι να είστε σίγουροι' : 'Do not remove labels until you are sure'}</li>
            <li>{locale === 'el' ? 'Μην χρησιμοποιείτε αρώματα ή προϊόντα ομορφιάς κατά τη δοκιμή' : 'Do not use perfumes or beauty products when trying on'}</li>
            <li>{locale === 'el' ? 'Διατηρήστε την αρχική συσκευασία' : 'Keep the original packaging'}</li>
          </ul>
        </section>

        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          <p>{locale === 'el' ? 'Τελευταία ενημέρωση: Νοέμβριος 2025' : 'Last updated: November 2025'}</p>
        </div>
      </div>
    </div>
  );
}
