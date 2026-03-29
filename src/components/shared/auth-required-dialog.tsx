'use client';

import { useState } from 'react';
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
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Loader2,
  AlertCircle,
  LockKeyhole,
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

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string; // What action requires auth
}

export function AuthRequiredDialog({ open, onOpenChange, action }: AuthRequiredDialogProps) {
  const { locale, setUser } = useAppStore();
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

  const isRTL = locale === 'ar';

  const getActionText = () => {
    if (action === 'create_post') {
      return locale === 'ar' ? 'لإنشاء منشور' : locale === 'fr' ? 'pour créer une publication' : 'to create a post';
    }
    if (action === 'comment') {
      return locale === 'ar' ? 'للتعليق' : locale === 'fr' ? 'pour commenter' : 'to comment';
    }
    if (action === 'ask_question') {
      return locale === 'ar' ? 'لطرح سؤال' : locale === 'fr' ? 'pour poser une question' : 'to ask a question';
    }
    if (action === 'answer') {
      return locale === 'ar' ? 'للإجابة' : locale === 'fr' ? 'pour répondre' : 'to answer';
    }
    return '';
  };

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
      setError(locale === 'ar' ? 'يرجى ملء جميع الحقول' : locale === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
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
      setError(locale === 'ar' ? 'يرجى ملء جميع الحقول' : locale === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : locale === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError(locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : locale === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole || 'NORMAL_USER',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
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
    setMode('login');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LockKeyhole className="h-5 w-5 text-primary" />
            {locale === 'ar' ? 'تسجيل الدخول مطلوب' : locale === 'fr' ? 'Connexion requise' : 'Login Required'}
          </DialogTitle>
          <DialogDescription>
            {getActionText() && (
              <span className="text-primary font-medium">
                {getActionText()}{' '}
              </span>
            )}
            {locale === 'ar' 
              ? 'يرجى تسجيل الدخول أو إنشاء حساب للمتابعة'
              : locale === 'fr'
              ? 'Veuillez vous connecter ou créer un compte pour continuer'
              : 'Please sign in or create an account to continue'}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <div className="space-y-4 py-2">
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
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setMode('register');
                    setError(null);
                  }}
                  className={`p-3 rounded-lg border-2 text-start transition-all hover:border-primary ${
                    selectedRole === role.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${role.color} text-white mb-1`}>
                    <role.icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-medium text-sm">{getTitle(role)}</h4>
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
          <div className="space-y-3 py-2">
            {selectedRole && (
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">
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
      </DialogContent>
    </Dialog>
  );
}
