'use client';

import { useState, useEffect } from 'react';
import { useAppStore, UserRole } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTheme } from 'next-themes';
import {
  Building2,
  User,
  HardHat,
  Users,
  Factory,
  Wrench,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const roles = [
  {
    id: 'CIVIL_ENGINEER' as UserRole,
    icon: HardHat,
    titleAr: 'مهندس مدني',
    titleFr: 'Ingénieur Civil',
    titleEn: 'Civil Engineer',
    descriptionAr: 'قدم استشاراتك الهندسية وشارك معرفتك',
    descriptionFr: 'Offrez vos conseils et partagez vos connaissances',
    descriptionEn: 'Provide consultations and share your knowledge',
    color: 'bg-blue-500',
  },
  {
    id: 'CONTRACTOR' as UserRole,
    icon: Users,
    titleAr: 'مقاول',
    titleFr: 'Entrepreneur',
    titleEn: 'Contractor',
    descriptionAr: 'أدر مشاريعك واعثر على فرص عمل جديدة',
    descriptionFr: 'Gérez vos projets et trouvez des opportunités',
    descriptionEn: 'Manage projects and find opportunities',
    color: 'bg-orange-500',
  },
  {
    id: 'ENGINEERING_OFFICE' as UserRole,
    icon: Building2,
    titleAr: 'مكتب دراسات',
    titleFr: "Bureau d'Études",
    titleEn: 'Engineering Office',
    descriptionAr: 'قدم خدماتك الهندسية للمستثمرين',
    descriptionFr: 'Offrez vos services aux clients',
    descriptionEn: 'Offer engineering services to clients',
    color: 'bg-purple-500',
  },
  {
    id: 'CRAFTSMAN' as UserRole,
    icon: Wrench,
    titleAr: 'حرفي',
    titleFr: 'Artisan',
    titleEn: 'Craftsman',
    descriptionAr: 'اعرض مهاراتك واحصل على طلبات العمل',
    descriptionFr: 'Présentez vos compétences',
    descriptionEn: 'Showcase your skills and get work requests',
    color: 'bg-amber-500',
  },
  {
    id: 'CONSTRUCTION_COMPANY' as UserRole,
    icon: Building2,
    titleAr: 'شركة بناء',
    titleFr: 'Entreprise de Construction',
    titleEn: 'Construction Company',
    descriptionAr: 'أدر شركتك واعثر على مشاريع جديدة',
    descriptionFr: 'Gérez votre entreprise',
    descriptionEn: 'Manage your company and find projects',
    color: 'bg-green-500',
  },
  {
    id: 'STORE_FACTORY' as UserRole,
    icon: Factory,
    titleAr: 'متجر / مصنع',
    titleFr: 'Magasin / Usine',
    titleEn: 'Store / Factory',
    descriptionAr: 'بع منتجاتك ومواد البناء',
    descriptionFr: 'Vendez vos produits et matériaux',
    descriptionEn: 'Sell your products and materials',
    color: 'bg-cyan-500',
  },
  {
    id: 'NORMAL_USER' as UserRole,
    icon: User,
    titleAr: 'مستخدم عادي',
    titleFr: 'Utilisateur Normal',
    titleEn: 'Normal User',
    descriptionAr: 'ابحث عن خدمات البناء واحصل على استشارات',
    descriptionFr: 'Recherchez des services',
    descriptionEn: 'Search for construction services',
    color: 'bg-gray-500',
  },
];

const languages = [
  { code: 'ar' as const, name: 'العربية', flag: '🇩🇿' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
];

interface Ad {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
}

export function AuthDialog({
  open,
  onOpenChange,
  externalError
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  externalError?: string | null;
}) {
  const { locale, setLocale, setUser } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register' | 'role'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [sidebarAd, setSidebarAd] = useState<Ad | null>(null);

  const isRTL = locale === 'ar';
  const displayError = externalError || error;

  // Clear error when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
      setMode('login');
      resetForm();
    }
  }, [open]);

  // Fetch sidebar ad
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch('/api/ads?position=sidebar');
        const data = await res.json();
        if (data.ads?.[0]) {
          setSidebarAd(data.ads[0]);
        }
      } catch (e) {
        // Ignore
      }
    };
    fetchAd();
  }, []);

  const getTitle = (role: typeof roles[0]) => {
    if (locale === 'ar') return role.titleAr;
    if (locale === 'fr') return role.titleFr;
    return role.titleEn;
  };

  const getDescription = (role: typeof roles[0]) => {
    if (locale === 'ar') return role.descriptionAr;
    if (locale === 'fr') return role.descriptionFr;
    return role.descriptionEn;
  };

  const handleLogin = async () => {
    setError(null);

    if (!formData.email || !formData.password) {
      setError(locale === 'ar'
        ? 'يرجى ملء جميع الحقول'
        : locale === 'fr'
          ? 'Veuillez remplir tous les champs'
          : 'Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || (locale === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
        return;
      }

      setUser(data.user);
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(locale === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);

    if (!formData.email || !formData.password || !formData.name) {
      setError(locale === 'ar'
        ? 'يرجى ملء جميع الحقول'
        : locale === 'fr'
          ? 'Veuillez remplir tous les champs'
          : 'Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'ar'
        ? 'كلمات المرور غير متطابقة'
        : locale === 'fr'
          ? 'Les mots de passe ne correspondent pas'
          : 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError(locale === 'ar'
        ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        : locale === 'fr'
          ? 'Le mot de passe doit contenir au moins 6 caractères'
          : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole || 'NORMAL_USER',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || (locale === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
        return;
      }

      setUser(data.user);
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(locale === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setSelectedRole(null);
    setError(null);
  };

  const handleAdClick = () => {
    if (sidebarAd?.linkUrl) {
      window.open(sidebarAd.linkUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex gap-4">
          {/* Main Form */}
          <div className="flex-1">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-6 w-6 text-primary" />
                DzBuild
              </DialogTitle>
              <DialogDescription>
                {mode === 'login' && (locale === 'ar' ? 'تسجيل الدخول إلى حسابك' : locale === 'fr' ? 'Connectez-vous à votre compte' : 'Sign in to your account')}
                {mode === 'register' && (locale === 'ar' ? 'إنشاء حساب جديد' : locale === 'fr' ? 'Créer un nouveau compte' : 'Create a new account')}
                {mode === 'role' && (locale === 'ar' ? 'اختر نوع الحساب' : locale === 'fr' ? 'Choisissez le type de compte' : 'Choose account type')}
              </DialogDescription>
            </DialogHeader>

            {/* Language & Theme Toggles */}
            <div className="flex items-center justify-between gap-2 py-2">
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={locale === lang.code ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLocale(lang.code)}
                  >
                    {lang.flag} {lang.name}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>

            <Separator />

            {/* Error Alert */}
            {displayError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <div className="space-y-4 py-4">
                {/* Email/Password Form */}
                <div className="space-y-2">
                  <Label>{locale === 'ar' ? 'البريد الإلكتروني' : locale === 'fr' ? 'Email' : 'Email'}</Label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={isRTL ? 'pr-10' : 'pl-10'}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ar' ? 'كلمة المرور' : locale === 'fr' ? 'Mot de passe' : 'Password'}</Label>
                  <div className="relative">
                    <Lock className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={isRTL ? 'pr-10' : 'pl-10'}
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleLogin} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4 me-2" />
                  )}
                  {locale === 'ar' ? 'تسجيل الدخول' : locale === 'fr' ? 'Se Connecter' : 'Sign In'}
                </Button>
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {locale === 'ar' ? 'ليس لديك حساب؟' : locale === 'fr' ? 'Pas de compte?' : "Don't have an account?"}
                  </span>
                  <Button variant="link" onClick={() => { setMode('role'); setError(null); }}>
                    {locale === 'ar' ? 'إنشاء حساب' : locale === 'fr' ? "S'inscrire" : 'Sign Up'}
                  </Button>
                </div>
              </div>
            )}

            {/* Role Selection */}
            {mode === 'role' && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setSelectedRole(role.id);
                        setMode('register');
                        setError(null);
                      }}
                      className={`p-4 rounded-lg border-2 text-start transition-all hover:border-primary ${
                        selectedRole === role.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role.color} text-white mb-2`}>
                        <role.icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-medium">{getTitle(role)}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{getDescription(role)}</p>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => { setMode('login'); setError(null); }} className="w-full">
                  {isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
                  {locale === 'ar' ? 'العودة لتسجيل الدخول' : locale === 'fr' ? 'Retour à la connexion' : 'Back to Login'}
                </Button>
              </div>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <div className="space-y-4 py-4">
                {selectedRole && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {getTitle(roles.find(r => r.id === selectedRole)!)}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{locale === 'ar' ? 'الاسم الكامل' : locale === 'fr' ? 'Nom Complet' : 'Full Name'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                <Button className="w-full" onClick={handleRegister} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 me-2" />
                  )}
                  {locale === 'ar' ? 'إنشاء الحساب' : locale === 'fr' ? 'Créer le Compte' : 'Create Account'}
                </Button>
                <Button variant="ghost" onClick={() => { setMode('role'); setError(null); }} className="w-full">
                  {isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
                  {locale === 'ar' ? 'تغيير نوع الحساب' : locale === 'fr' ? 'Changer le type' : 'Change Account Type'}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Ad */}
          {sidebarAd && sidebarAd.imageUrl && (
            <div className="hidden lg:block w-48 shrink-0">
              <div
                onClick={handleAdClick}
                className="cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-shadow"
              >
                <img
                  src={sidebarAd.imageUrl}
                  alt={sidebarAd.title}
                  className="w-full h-auto"
                />
                {sidebarAd.linkUrl && (
                  <div className="p-2 bg-muted text-center">
                    <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {sidebarAd.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
