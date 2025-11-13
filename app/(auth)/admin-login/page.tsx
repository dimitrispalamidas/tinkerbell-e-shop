"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already logged in and load saved email
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (adminRecord) {
          router.push('/admin');
          return;
        }

        await supabase.auth.signOut();
      } else {
        // Load saved email if remember me was checked
        const savedEmail = localStorage.getItem('tinkerbell_admin_email');
        const savedRememberMe = localStorage.getItem('tinkerbell_remember_me') === 'true';
        
        if (savedEmail && savedRememberMe) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // User-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error(locale === 'el' ? 'Λάθος email ή password' : 'Wrong email or password');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error(locale === 'el' ? 'Το email δεν έχει επιβεβαιωθεί' : 'Email not confirmed');
        } else {
          toast.error(error.message || (locale === 'el' ? 'Αποτυχία σύνδεσης' : 'Login failed'));
        }
        return;
      }

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('tinkerbell_admin_email', email);
        localStorage.setItem('tinkerbell_remember_me', 'true');
      } else {
        localStorage.removeItem('tinkerbell_admin_email');
        localStorage.removeItem('tinkerbell_remember_me');
      }

      const userId = data.user?.id;
      if (!userId) {
        await supabase.auth.signOut();
        toast.error(locale === 'el' ? 'Αποτυχία σύνδεσης' : 'Login failed');
        return;
      }

      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!adminRecord) {
        await supabase.auth.signOut();
        toast.error(
          locale === 'el'
            ? 'Ο λογαριασμός δεν έχει δικαιώματα διαχειριστή'
            : 'This account is not authorized for admin access'
        );
        return;
      }

      toast.success(locale === 'el' ? 'Επιτυχής σύνδεση!' : 'Login successful!');
      router.push('/admin');
    } catch {
      toast.error(locale === 'el' ? 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.' : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unauthorized = searchParams.get('unauthorized');
    if (unauthorized) {
      toast.error(
        locale === 'el'
          ? 'Δεν έχετε δικαιώματα πρόσβασης στο admin.'
          : 'You are not authorized to access the admin panel.'
      );
    }
  }, [searchParams, locale]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink/10 to-lavender/10 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p>{locale === 'el' ? 'Έλεγχος ταυτοποίησης...' : 'Checking authentication...'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink/10 to-lavender/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {locale === 'el' ? 'Σύνδεση Διαχειριστή' : 'Admin Login'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {locale === 'el' ? 'Email' : 'Email'}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@tinkerbell.gr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {locale === 'el' ? 'Κωδικός' : 'Password'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="rememberMe" className="text-sm font-medium cursor-pointer">
                {locale === 'el' ? 'Να με θυμάσαι' : 'Remember me'}
              </label>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading 
                ? (locale === 'el' ? 'Σύνδεση...' : 'Logging in...') 
                : (locale === 'el' ? 'Σύνδεση' : 'Login')}
            </Button>
          </form>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              {locale === 'el' ? 'Πίσω στην Αρχική' : 'Back to Home'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
