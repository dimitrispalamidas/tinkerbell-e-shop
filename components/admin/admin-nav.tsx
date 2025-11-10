"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingCart, Image as ImageIcon, LogOut, Menu, X, BarChart3, Palette } from 'lucide-react';
import { toast } from 'sonner';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(locale === 'el' ? 'Αποσύνδεση' : 'Logout');
    router.push('/admin-login');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/admin', label: locale === 'el' ? 'Πίνακας Ελέγχου' : 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: locale === 'el' ? 'Πωλήσεις' : 'Sales', icon: BarChart3 },
    { href: '/admin/products', label: locale === 'el' ? 'Προϊόντα' : 'Products', icon: Package },
    { href: '/admin/colors', label: locale === 'el' ? 'Χρώματα' : 'Colors', icon: Palette },
    { href: '/admin/orders', label: locale === 'el' ? 'Παραγγελίες' : 'Orders', icon: ShoppingCart },
    { href: '/admin/gallery', label: locale === 'el' ? 'Γκαλερί' : 'Gallery', icon: ImageIcon },
  ];

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2 flex-shrink-0">
          <Image 
            src="/logo.webp" 
            alt="Tinkerbell Admin" 
            width={140} 
            height={30}
            className="h-[30px] w-auto"
            priority
          />
          <span className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-primary/10 rounded">
            Admin
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-6 text-sm font-medium mx-6">
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
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Logout */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout} 
          className="hidden md:flex gap-2 flex-shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden lg:inline">
            {locale === 'el' ? 'Αποσύνδεση' : 'Logout'}
          </span>
        </Button>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex-shrink-0"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-4 py-3 h-auto text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">
                {locale === 'el' ? 'Αποσύνδεση' : 'Logout'}
              </span>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
