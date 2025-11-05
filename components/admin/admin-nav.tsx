"use client"

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingCart, Image as ImageIcon, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(tCommon('logout'));
    router.push('/admin-login');
  };

  const navItems = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/products', label: t('products'), icon: Package },
    { href: '/admin/orders', label: t('orders'), icon: ShoppingCart },
    { href: '/admin/gallery', label: t('gallery'), icon: ImageIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/admin" className="mr-6 flex items-center gap-2">
          <Image 
            src="/logo.webp" 
            alt="Tinkerbell Admin" 
            width={200} 
            height={42}
            style={{ objectFit: 'contain', height: '42px', width: 'auto' }}
            priority
          />
          <span className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-primary/10 rounded">
            Admin
          </span>
        </Link>
        
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 transition-colors hover:text-primary ${
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          {tCommon('logout')}
        </Button>
      </div>
    </header>
  );
}
