import { redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/admin/admin-nav';
import { Toaster } from '@/components/ui/toaster';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin-login');
  }
  // User is authenticated, allow access to admin

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
      </div>
    </NextIntlClientProvider>
  );
}

