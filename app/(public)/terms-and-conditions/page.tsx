import { useTranslations } from 'next-intl';

export default function TermsAndConditionsPage() {
  const t = useTranslations('termsConditions');
  const tLegal = useTranslations('legal');
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('general_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('general_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('products_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('products_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('products_prices')}</li>
            <li>{t('products_vat')}</li>
            <li>{t('products_photos')}</li>
            <li>{t('products_colors')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('orders_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('orders_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('orders_confirmation')}</li>
            <li>{t('orders_acceptance')}</li>
            <li>{t('orders_shipping')}</li>
            <li>{t('orders_unavailable')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('payment_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('payment_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('payment_cards')}</li>
            <li>{t('payment_banking')}</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            {t('payment_security')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('shipping_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('shipping_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('shipping_time')}</li>
            <li>{t('shipping_boxnow')}</li>
            <li>{t('shipping_cost')}</li>
            <li>{t('shipping_free')}</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            {t('shipping_disclaimer')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('warranty_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('warranty_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('warranty_contact')}</li>
            <li>{t('warranty_photos')}</li>
            <li>{t('warranty_replacement')}</li>
            <li>{t('warranty_shipping')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('liability_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('liability_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('liability_indirect')}</li>
            <li>{t('liability_profits')}</li>
            <li>{t('liability_interruption')}</li>
            <li>{t('liability_errors')}</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            {t('liability_limit')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('ip_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('ip_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('law_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('law_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('modifications_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('modifications_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('contact_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('contact_text')}
          </p>
          <div className="text-muted-foreground">
            <p>{tLegal('contactEmail')}</p>
            <p>{tLegal('contactPhone')}</p>
            <p>{tLegal('contactAddress')}</p>
          </div>
        </section>

        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          <p>{tLegal('lastUpdated')}</p>
        </div>
      </div>
    </div>
  );
}
