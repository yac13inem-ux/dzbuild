'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';

export function AdminLoginButton() {
  const { locale, setUser } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        if (data.user.role !== 'ADMIN') {
          setError(
            locale === 'ar' 
              ? 'هذا الحساب ليس لديه صلاحيات المسؤول' 
              : locale === 'fr' 
              ? 'Ce compte n\'a pas les droits d\'administrateur'
              : 'This account does not have admin privileges'
          );
          return;
        }
        
        setUser(data.user);
        setShowLogin(false);
        setEmail('');
        setPassword('');
      } else {
        setError(
          data.error || 
          (locale === 'ar' 
            ? 'بيانات الدخول غير صحيحة' 
            : locale === 'fr' 
            ? 'Identifiants incorrects'
            : 'Invalid credentials')
        );
      }
    } catch (err) {
      setError(
        locale === 'ar' 
          ? 'خطأ في الاتصال' 
          : locale === 'fr' 
          ? 'Erreur de connexion'
          : 'Connection error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hidden Admin Icon */}
      <button
        onClick={() => setShowLogin(true)}
        className="fixed bottom-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors z-50 opacity-50 hover:opacity-100"
        title="Admin"
        aria-label="Admin Login"
      >
        <span className="text-lg">🔑</span>
      </button>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {locale === 'ar' ? 'دخول المسؤول' : locale === 'fr' ? 'Connexion Admin' : 'Admin Login'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'ar' 
                ? 'هذه المنطقة مخصصة للمسؤولين فقط' 
                : locale === 'fr' 
                ? 'Cette zone est réservée aux administrateurs'
                : 'This area is for administrators only'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-3 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-email">
                {locale === 'ar' ? 'البريد الإلكتروني' : locale === 'fr' ? 'Email' : 'Email'}
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">
                {locale === 'ar' ? 'كلمة المرور' : locale === 'fr' ? 'Mot de passe' : 'Password'}
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {locale === 'ar' ? 'جاري الدخول...' : locale === 'fr' ? 'Connexion...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  {locale === 'ar' ? 'دخول' : locale === 'fr' ? 'Connexion' : 'Sign In'}
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminLoginButton;
