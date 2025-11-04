import { redirect } from 'next/navigation';
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

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

