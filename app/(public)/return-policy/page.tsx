import { useTranslations } from 'next-intl';

export default function ReturnPolicyPage() {
  const t = useTranslations('returnPolicy');
  const tLegal = useTranslations('legal');
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('withdrawal_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('withdrawal_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('conditions_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('conditions_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('conditions_original')}</li>
            <li>{t('conditions_labels')}</li>
            <li>{t('conditions_receipt')}</li>
            <li>{t('conditions_unused')}</li>
            <li>{t('conditions_damage')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('exceptions_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('exceptions_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('exceptions_underwear')}</li>
            <li>{t('exceptions_socks')}</li>
            <li>{t('exceptions_baptism')}</li>
            <li>{t('exceptions_personalized')}</li>
            <li>{t('exceptions_sale')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('process_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('process_text')}
          </p>
          <ol className="list-decimal pl-6 text-muted-foreground space-y-3">
            <li>{t('process_contact')}</li>
            <li>{t('process_rma')}</li>
            <li>{t('process_pack')}</li>
            <li>{t('process_ship')}</li>
            <li>{t('process_refund')}</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('costs_title')}</h2>
          <div className="text-muted-foreground space-y-3">
            <p><strong>{t('costs_change_mind')}</strong></p>
            <p><strong>{t('costs_defect')}</strong></p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('refund_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('refund_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('refund_method')}</li>
            <li>{t('refund_time')}</li>
            <li>{t('refund_check')}</li>
            <li>{t('refund_amount')}</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            {t('refund_note')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('exchange_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('exchange_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('exchange_contact')}</li>
            <li>{t('exchange_availability')}</li>
            <li>{t('exchange_cost')}</li>
            <li>{t('exchange_process')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('defects_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('defects_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('defects_contact')}</li>
            <li>{t('defects_photos')}</li>
            <li>{t('defects_replace')}</li>
            <li>{t('defects_refund')}</li>
            <li>{t('defects_cost')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('delays_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('delays_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('delays_contact')}</li>
            <li>{t('delays_tracking')}</li>
            <li>{t('delays_lost')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('refusal_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('refusal_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('contact_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('contact_text')}
          </p>
          <div className="text-muted-foreground space-y-2">
            <p>{t('contact_email')}</p>
            <p>{t('contact_phone')}</p>
            <p>{t('contact_address')}</p>
          </div>
          <p className="text-muted-foreground mt-4">
            {t('contact_note')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('tips_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('tips_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('tips_clean')}</li>
            <li>{t('tips_labels')}</li>
            <li>{t('tips_products')}</li>
            <li>{t('tips_packaging')}</li>
          </ul>
        </section>

        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          <p>{tLegal('lastUpdated')}</p>
        </div>
      </div>
    </div>
  );
}
