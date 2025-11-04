import { useTranslations } from 'next-intl';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacyPolicy');
  const tLegal = useTranslations('legal');
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('intro_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('intro_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('collection_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('collection_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('collection_contact')}</li>
            <li>{t('collection_address')}</li>
            <li>{t('collection_orders')}</li>
            <li>{t('collection_browsing')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('usage_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('usage_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('usage_orders')}</li>
            <li>{t('usage_communication')}</li>
            <li>{t('usage_improvement')}</li>
            <li>{t('usage_marketing')}</li>
            <li>{t('usage_security')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sharing_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('sharing_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('sharing_shipping')}</li>
            <li>{t('sharing_payment')}</li>
            <li>{t('sharing_legal')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('cookies_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('cookies_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('security_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('security_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('rights_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('rights_text')}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t('rights_access')}</li>
            <li>{t('rights_rectification')}</li>
            <li>{t('rights_erasure')}</li>
            <li>{t('rights_restriction')}</li>
            <li>{t('rights_portability')}</li>
            <li>{t('rights_objection')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('retention_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('retention_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('changes_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('changes_text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('contact_title')}</h2>
          <p className="text-muted-foreground mb-4">
            {tLegal('contactInfo', { topic: t('title') })}
          </p>
          <div className="text-muted-foreground">
            <p>{tLegal('contactEmail')}</p>
            <p>{tLegal('contactPhone')}</p>
          </div>
        </section>

        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          <p>{tLegal('lastUpdated')}</p>
        </div>
      </div>
    </div>
  );
}
