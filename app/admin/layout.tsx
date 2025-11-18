import { redirect } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from '@/components/admin/admin-nav'
import { Toaster } from '@/components/ui/toaster'
import { OneSignalProvider } from '@/components/admin/onesignal-provider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin-login')
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminRecord) {
    redirect('/admin-login?unauthorized=1')
  }

  const locale = await getLocale()
  const messages = await getMessages()

  // Get OneSignal App ID (dev or prod)
  const onesignalAppId = process.env.NODE_ENV === 'development' 
    ? (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID_DEV || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID)
    : (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID_PROD || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* OneSignal Web Push SDK - Only for admin pages */}
      {onesignalAppId && (
        <>
          <Script
            src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
            strategy="afterInteractive"
          />
          <Script
            id="onesignal-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                OneSignalDeferred.push(async function(OneSignal) {
                  await OneSignal.init({
                    appId: "${onesignalAppId}",
                    notifyButton: {
                      enable: false,
                    },
                    allowLocalhostAsSecureOrigin: ${process.env.NODE_ENV === 'development' ? 'true' : 'false'},
                    serviceWorkerParam: {
                      scope: '/'
                    },
                    serviceWorkerPath: 'OneSignalSDKWorker.js'
                  });
                });
              `,
            }}
          />
        </>
      )}
      <OneSignalProvider />
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-4 md:py-8">
          {children}
        </main>
        <Toaster />
      </div>
    </NextIntlClientProvider>
  )
}
