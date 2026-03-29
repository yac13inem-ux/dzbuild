'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAppStore, Locale } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Settings as SettingsIcon,
  Globe,
  Moon,
  Sun,
  Bell,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Key,
  Smartphone,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  Check,
  AlertTriangle,
  MessageSquare,
  MessageCircle,
  Heart,
  AtSign,
  Users,
  Info,
  Loader2,
} from 'lucide-react';

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'ar', name: 'العربية', flag: '🇩🇿' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const roleColors: Record<string, string> = {
  CIVIL_ENGINEER: 'bg-blue-500',
  CONTRACTOR: 'bg-orange-500',
  ENGINEERING_OFFICE: 'bg-purple-500',
  CRAFTSMAN: 'bg-amber-500',
  CONSTRUCTION_COMPANY: 'bg-green-500',
  STORE_FACTORY: 'bg-cyan-500',
  NORMAL_USER: 'bg-gray-500',
  ADMIN: 'bg-red-500',
};

const roleLabelsAr: Record<string, string> = {
  CIVIL_ENGINEER: 'مهندس مدني',
  CONTRACTOR: 'مقاول',
  ENGINEERING_OFFICE: 'مكتب دراسات',
  CRAFTSMAN: 'حرفي',
  CONSTRUCTION_COMPANY: 'شركة بناء',
  STORE_FACTORY: 'متجر / مصنع',
  NORMAL_USER: 'مستخدم',
  ADMIN: 'مدير',
};

export function UserSettings() {
  const { theme, setTheme } = useTheme();
  const { user, locale, setLocale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    specialization: user?.specialization || '',
    bio: user?.bio || '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    messages: true,
    comments: true,
    likes: true,
    replies: true,
    mentions: true,
    followers: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showActivity: true,
    allowMessages: true,
    showEmail: false,
    showPhone: false,
  });

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/user/settings?userId=${user.id}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            if (data.settings.profile) {
              setProfileData(prev => ({
                ...prev,
                ...data.settings.profile,
                email: user.email || data.settings.profile.email,
              }));
            }
            if (data.settings.notifications) {
              setNotificationSettings(data.settings.notifications);
            }
            if (data.settings.privacy) {
              setPrivacySettings(data.settings.privacy);
            }
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [user?.id]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          profile: profileData,
          notifications: notificationSettings,
          privacy: privacySettings,
        }),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const t = {
    settings: locale === 'ar' ? 'الإعدادات' : locale === 'fr' ? 'Paramètres' : 'Settings',
    language: locale === 'ar' ? 'اللغة' : locale === 'fr' ? 'Langue' : 'Language',
    languageDesc: locale === 'ar' ? 'اختر لغة عرض التطبيق' : locale === 'fr' ? "Choisissez la langue d'affichage" : 'Choose your display language',
    theme: locale === 'ar' ? 'المظهر' : locale === 'fr' ? 'Thème' : 'Theme',
    themeDesc: locale === 'ar' ? 'اختر مظهر التطبيق' : locale === 'fr' ? "Choisissez le thème de l'application" : 'Choose the application theme',
    light: locale === 'ar' ? 'فاتح' : locale === 'fr' ? 'Clair' : 'Light',
    dark: locale === 'ar' ? 'داكن' : locale === 'fr' ? 'Sombre' : 'Dark',
    system: locale === 'ar' ? 'تلقائي' : locale === 'fr' ? 'Système' : 'System',
    profile: locale === 'ar' ? 'الملف الشخصي' : locale === 'fr' ? 'Profil' : 'Profile',
    profileDesc: locale === 'ar' ? 'تعديل بياناتك الشخصية' : locale === 'fr' ? 'Modifier vos informations personnelles' : 'Edit your personal information',
    notifications: locale === 'ar' ? 'الإشعارات' : locale === 'fr' ? 'Notifications' : 'Notifications',
    notificationsDesc: locale === 'ar' ? 'إدارة إعدادات الإشعارات' : locale === 'fr' ? 'Gérer les paramètres de notification' : 'Manage notification settings',
    privacy: locale === 'ar' ? 'الخصوصية' : locale === 'fr' ? 'Confidentialité' : 'Privacy',
    privacyDesc: locale === 'ar' ? 'تحكم في خصوصية حسابك' : locale === 'fr' ? 'Contrôlez la confidentialité de votre compte' : 'Control your account privacy',
    security: locale === 'ar' ? 'الأمان' : locale === 'fr' ? 'Sécurité' : 'Security',
    changePassword: locale === 'ar' ? 'تغيير كلمة المرور' : locale === 'fr' ? 'Changer le mot de passe' : 'Change Password',
    currentPassword: locale === 'ar' ? 'كلمة المرور الحالية' : locale === 'fr' ? 'Mot de passe actuel' : 'Current Password',
    newPassword: locale === 'ar' ? 'كلمة المرور الجديدة' : locale === 'fr' ? 'Nouveau mot de passe' : 'New Password',
    confirmPassword: locale === 'ar' ? 'تأكيد كلمة المرور' : locale === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password',
    save: locale === 'ar' ? 'حفظ' : locale === 'fr' ? 'Enregistrer' : 'Save',
    saved: locale === 'ar' ? 'تم الحفظ!' : locale === 'fr' ? 'Enregistré!' : 'Saved!',
    dangerZone: locale === 'ar' ? 'منطقة الخطر' : locale === 'fr' ? 'Zone de danger' : 'Danger Zone',
    deleteAccount: locale === 'ar' ? 'حذف الحساب' : locale === 'fr' ? 'Supprimer le compte' : 'Delete Account',
    deleteDesc: locale === 'ar' ? 'حذف حسابك وجميع بياناتك نهائياً' : locale === 'fr' ? 'Supprimer définitivement votre compte' : 'Permanently delete your account',
    delete: locale === 'ar' ? 'حذف' : locale === 'fr' ? 'Supprimer' : 'Delete',
    fullName: locale === 'ar' ? 'الاسم الكامل' : locale === 'fr' ? 'Nom complet' : 'Full Name',
    email: locale === 'ar' ? 'البريد الإلكتروني' : locale === 'fr' ? 'Email' : 'Email',
    phone: locale === 'ar' ? 'رقم الهاتف' : locale === 'fr' ? 'Téléphone' : 'Phone',
    city: locale === 'ar' ? 'المدينة' : locale === 'fr' ? 'Ville' : 'City',
    specialization: locale === 'ar' ? 'التخصص' : locale === 'fr' ? 'Spécialisation' : 'Specialization',
    bio: locale === 'ar' ? 'نبذة عنك' : locale === 'fr' ? 'Biographie' : 'Bio',
    // Notification settings
    emailNotif: locale === 'ar' ? 'إشعارات البريد الإلكتروني' : locale === 'fr' ? 'Notifications par email' : 'Email Notifications',
    emailNotifDesc: locale === 'ar' ? 'استلم تحديثات عبر البريد الإلكتروني' : locale === 'fr' ? 'Recevez des mises à jour par email' : 'Receive updates via email',
    pushNotif: locale === 'ar' ? 'الإشعارات الفورية' : locale === 'fr' ? 'Notifications push' : 'Push Notifications',
    pushNotifDesc: locale === 'ar' ? 'إشعارات على جهازك' : locale === 'fr' ? 'Notifications sur votre appareil' : 'Notifications on your device',
    messageNotif: locale === 'ar' ? 'إشعارات الرسائل' : locale === 'fr' ? 'Notifications de messages' : 'Message Notifications',
    messageNotifDesc: locale === 'ar' ? 'إشعارات عند استلام رسائل جديدة' : locale === 'fr' ? 'Notifications pour les nouveaux messages' : 'Get notified for new messages',
    commentNotif: locale === 'ar' ? 'إشعارات التعليقات' : locale === 'fr' ? 'Notifications de commentaires' : 'Comment Notifications',
    commentNotifDesc: locale === 'ar' ? 'عند التعليق على منشوراتك' : locale === 'fr' ? 'Quand quelqu\'un commente vos publications' : 'When someone comments on your posts',
    likeNotif: locale === 'ar' ? 'إشعارات الإعجابات' : locale === 'fr' ? 'Notifications de likes' : 'Like Notifications',
    likeNotifDesc: locale === 'ar' ? 'عند الإعجاب بمنشوراتك' : locale === 'fr' ? 'Quand quelqu\'un aime vos publications' : 'When someone likes your posts',
    replyNotif: locale === 'ar' ? 'إشعارات الردود' : locale === 'fr' ? 'Notifications de réponses' : 'Reply Notifications',
    replyNotifDesc: locale === 'ar' ? 'عند الرد على تعليقاتك' : locale === 'fr' ? 'Quand quelqu\'un répond à vos commentaires' : 'When someone replies to your comments',
    mentionNotif: locale === 'ar' ? 'إشعارات الإشارات' : locale === 'fr' ? 'Notifications de mentions' : 'Mention Notifications',
    mentionNotifDesc: locale === 'ar' ? 'عند الإشارة إليك' : locale === 'fr' ? 'Quand quelqu\'un vous mentionne' : 'When someone mentions you',
    followerNotif: locale === 'ar' ? 'إشعارات المتابعين' : locale === 'fr' ? 'Notifications d\'abonnés' : 'Follower Notifications',
    followerNotifDesc: locale === 'ar' ? 'عند متابعة حسابك' : locale === 'fr' ? 'Quand quelqu\'un vous suit' : 'When someone follows you',
    // Privacy settings
    publicProfile: locale === 'ar' ? 'الملف الشخصي العام' : locale === 'fr' ? 'Profil public' : 'Public Profile',
    publicProfileDesc: locale === 'ar' ? 'السماح للجميع برؤية ملفك الشخصي' : locale === 'fr' ? 'Permettre à tous de voir votre profil' : 'Allow everyone to see your profile',
    showActivity: locale === 'ar' ? 'إظهار النشاط' : locale === 'fr' ? 'Afficher l\'activité' : 'Show Activity',
    showActivityDesc: locale === 'ar' ? 'إظهار نشاطك للآخرين' : locale === 'fr' ? 'Afficher votre activité aux autres' : 'Show your activity to others',
    allowMessages: locale === 'ar' ? 'السماح بالرسائل' : locale === 'fr' ? 'Autoriser les messages' : 'Allow Messages',
    allowMessagesDesc: locale === 'ar' ? 'السماح للآخرين بإرسال رسائل لك' : locale === 'fr' ? 'Permettre aux autres de vous envoyer des messages' : 'Allow others to send you messages',
    showEmail: locale === 'ar' ? 'إظهار البريد الإلكتروني' : locale === 'fr' ? 'Afficher l\'email' : 'Show Email',
    showEmailDesc: locale === 'ar' ? 'إظهار بريدك الإلكتروني في ملفك الشخصي' : locale === 'fr' ? 'Afficher votre email sur votre profil' : 'Show your email on your profile',
    showPhone: locale === 'ar' ? 'إظهار رقم الهاتف' : locale === 'fr' ? 'Afficher le téléphone' : 'Show Phone',
    showPhoneDesc: locale === 'ar' ? 'إظهار رقم هاتفك في ملفك الشخصي' : locale === 'fr' ? 'Afficher votre téléphone sur votre profil' : 'Show your phone on your profile',
  };

  if (!user) return null;

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t.settings}</h1>
          <p className="text-muted-foreground text-sm">
            {locale === 'ar' ? 'تحكم كامل في التطبيق' : locale === 'fr' ? 'Contrôle complet de l\'application' : 'Full control of the application'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t.profile}
              </CardTitle>
              <CardDescription>{t.profileDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className={cn('text-2xl text-white', roleColors[user.role])}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    {locale === 'ar' ? 'تغيير الصورة' : locale === 'fr' ? 'Changer la photo' : 'Change Photo'}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Profile Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {t.fullName}
                  </Label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t.fullName}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {t.email}
                  </Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                    placeholder={t.email}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {t.phone}
                  </Label>
                  <Input
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t.phone}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {t.city}
                  </Label>
                  <Input
                    value={profileData.city || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder={t.city}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {t.specialization}
                  </Label>
                  <Input
                    value={profileData.specialization || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder={t.specialization}
                  />
                </div>
              </div>

              <Button className="gap-2" onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : saved ? t.saved : t.save}
              </Button>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t.language}
              </CardTitle>
              <CardDescription>{t.languageDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={locale === lang.code ? 'default' : 'outline'}
                    className={cn(
                      "justify-start gap-2 h-auto py-3",
                      locale === lang.code && "ring-2 ring-primary ring-offset-2"
                    )}
                    onClick={() => setLocale(lang.code)}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {locale === lang.code && <Check className="h-4 w-4 ml-auto" />}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                {t.theme}
              </CardTitle>
              <CardDescription>{t.themeDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className={cn(
                    "justify-start gap-2 h-auto py-3",
                    theme === 'light' && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-5 w-5" />
                  <span className="font-medium">{t.light}</span>
                  {theme === 'light' && <Check className="h-4 w-4 ml-auto" />}
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className={cn(
                    "justify-start gap-2 h-auto py-3",
                    theme === 'dark' && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-5 w-5" />
                  <span className="font-medium">{t.dark}</span>
                  {theme === 'dark' && <Check className="h-4 w-4 ml-auto" />}
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className={cn(
                    "justify-start gap-2 h-auto py-3",
                    theme === 'system' && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setTheme('system')}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">{t.system}</span>
                  {theme === 'system' && <Check className="h-4 w-4 ml-auto" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                {t.notifications}
              </CardTitle>
              <CardDescription>{t.notificationsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* General Notifications */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="font-medium">{t.emailNotif}</Label>
                    <p className="text-sm text-muted-foreground">{t.emailNotifDesc}</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10 text-purple-500">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="font-medium">{t.pushNotif}</Label>
                    <p className="text-sm text-muted-foreground">{t.pushNotifDesc}</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.push}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, push: checked }))}
                />
              </div>

              <Separator />

              {/* Activity Notifications */}
              <h4 className="font-medium text-muted-foreground text-sm">
                {locale === 'ar' ? 'إشعارات النشاط' : locale === 'fr' ? 'Notifications d\'activité' : 'Activity Notifications'}
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-cyan-500" />
                    <Label className="text-sm">{t.messageNotif}</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.messages}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, messages: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <Label className="text-sm">{t.commentNotif}</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.comments}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, comments: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <Label className="text-sm">{t.likeNotif}</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.likes}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, likes: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <Label className="text-sm">{t.replyNotif}</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.replies}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, replies: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <AtSign className="h-4 w-4 text-orange-500" />
                    <Label className="text-sm">{t.mentionNotif}</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.mentions}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, mentions: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-500" />
                    <Label className="text-sm">{t.followerNotif}</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.followers}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, followers: checked }))}
                  />
                </div>
              </div>
              
              <Button className="gap-2 mt-4" onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t.save}
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t.privacy}
              </CardTitle>
              <CardDescription>{t.privacyDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="font-medium">{t.publicProfile}</Label>
                    <p className="text-sm text-muted-foreground">{t.publicProfileDesc}</p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.showProfile}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showProfile: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="font-medium">{t.showActivity}</Label>
                    <p className="text-sm text-muted-foreground">{t.showActivityDesc}</p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.showActivity}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showActivity: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-cyan-500/10 text-cyan-500">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="font-medium">{t.allowMessages}</Label>
                    <p className="text-sm text-muted-foreground">{t.allowMessagesDesc}</p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.allowMessages}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowMessages: checked }))}
                />
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">{t.showEmail}</Label>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showEmail: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">{t.showPhone}</Label>
                  </div>
                  <Switch
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showPhone: checked }))}
                  />
                </div>
              </div>
              
              <Button className="gap-2 mt-4" onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t.save}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {t.security}
              </CardTitle>
              <CardDescription>{t.changePassword}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">{t.currentPassword}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block">{t.newPassword}</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">{t.confirmPassword}</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button className="gap-2">
                <Key className="h-4 w-4" />
                {t.changePassword}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t.dangerZone}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <Label className="font-medium">{t.deleteAccount}</Label>
                  <p className="text-sm text-muted-foreground">{t.deleteDesc}</p>
                </div>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  {t.delete}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
