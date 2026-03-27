'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Users, Trash2, Search, RefreshCw, Megaphone, Plus, 
  LogOut, Shield, Upload, Link2, Image, Calendar,
  MapPin, Eye, Play, Pause, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface Stats {
  users: { total: number };
  ads: { total: number; active: number };
}

interface Ad {
  id: string;
  title: string;
  type: string;
  position: string;
  imageUrl?: string;
  linkUrl?: string;
  content?: string;
  status: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
}

// Available ad positions
const AD_POSITIONS = [
  { id: 'home_top', labelAr: 'الرئيسية - أعلى الصفحة', labelFr: 'Accueil - Haut', labelEn: 'Home - Top' },
  { id: 'home_middle', labelAr: 'الرئيسية - وسط الصفحة', labelFr: 'Accueil - Milieu', labelEn: 'Home - Middle' },
  { id: 'home_bottom', labelAr: 'الرئيسية - أسفل الصفحة', labelFr: 'Accueil - Bas', labelEn: 'Home - Bottom' },
  { id: 'sidebar_top', labelAr: 'الشريط الجانبي - أعلى', labelFr: 'Barre latérale - Haut', labelEn: 'Sidebar - Top' },
  { id: 'sidebar_middle', labelAr: 'الشريط الجانبي - وسط', labelFr: 'Barre latérale - Milieu', labelEn: 'Sidebar - Middle' },
  { id: 'sidebar_bottom', labelAr: 'الشريط الجانبي - أسفل', labelFr: 'Barre latérale - Bas', labelEn: 'Sidebar - Bottom' },
  { id: 'guide_top', labelAr: 'دليل البناء - أعلى', labelFr: 'Guide - Haut', labelEn: 'Guide - Top' },
  { id: 'craftsmen_top', labelAr: 'الحرفيين - أعلى', labelFr: 'Artisans - Haut', labelEn: 'Craftsmen - Top' },
  { id: 'companies_top', labelAr: 'الشركات - أعلى', labelFr: 'Entreprises - Haut', labelEn: 'Companies - Top' },
  { id: 'jobs_top', labelAr: 'الوظائف - أعلى', labelFr: 'Emplois - Haut', labelEn: 'Jobs - Top' },
  { id: 'market_top', labelAr: 'السوق - أعلى', labelFr: 'Marché - Haut', labelEn: 'Market - Top' },
  { id: 'ai_top', labelAr: 'المساعد الذكي - أعلى', labelFr: 'IA - Haut', labelEn: 'AI - Top' },
];

const AD_TYPES = [
  { id: 'banner', labelAr: 'بانر', labelFr: 'Bannière', labelEn: 'Banner' },
  { id: 'sidebar', labelAr: 'جانبي', labelFr: 'Latéral', labelEn: 'Sidebar' },
  { id: 'popup', labelAr: 'منبثق', labelFr: 'Popup', labelEn: 'Popup' },
];

export function AdminDashboard() {
  const { locale, user, logout } = useAppStore();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'ads'>('users');
  const [showAdForm, setShowAdForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [adForm, setAdForm] = useState({
    title: '',
    type: 'banner',
    position: 'home_top',
    imageUrl: '',
    linkUrl: '',
    content: '',
    startDate: '',
    endDate: '',
    useImageUpload: true,
  });

  const isAdmin = user?.role === 'ADMIN';

  const t = {
    dashboard: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard',
    users: locale === 'ar' ? 'المستخدمين' : 'Users',
    ads: locale === 'ar' ? 'الإعلانات' : 'Ads',
    search: locale === 'ar' ? 'بحث...' : 'Search...',
    delete: locale === 'ar' ? 'حذف' : 'Delete',
    add: locale === 'ar' ? 'إضافة' : 'Add',
    save: locale === 'ar' ? 'حفظ' : 'Save',
    totalUsers: locale === 'ar' ? 'عدد المستخدمين' : 'Total Users',
    totalAds: locale === 'ar' ? 'عدد الإعلانات' : 'Total Ads',
    noUsers: locale === 'ar' ? 'لا يوجد مستخدمين' : 'No users',
    noAds: locale === 'ar' ? 'لا توجد إعلانات' : 'No ads',
    logout: locale === 'ar' ? 'خروج' : 'Logout',
    adTitle: locale === 'ar' ? 'عنوان الإعلان' : 'Ad Title',
    adType: locale === 'ar' ? 'نوع الإعلان' : 'Ad Type',
    adPosition: locale === 'ar' ? 'مكان الإعلان' : 'Ad Position',
    imageUrl: locale === 'ar' ? 'رابط الصورة' : 'Image URL',
    linkUrl: locale === 'ar' ? 'رابط الوجهة' : 'Link URL',
    orUpload: locale === 'ar' ? 'أو رفع صورة' : 'Or upload image',
    startDate: locale === 'ar' ? 'تاريخ البداية' : 'Start Date',
    endDate: locale === 'ar' ? 'تاريخ النهاية' : 'End Date',
    duration: locale === 'ar' ? 'مدة الإعلان' : 'Ad Duration',
    cancel: locale === 'ar' ? 'إلغاء' : 'Cancel',
    views: locale === 'ar' ? 'مشاهدات' : 'Views',
    clicks: locale === 'ar' ? 'نقرات' : 'Clicks',
    status: locale === 'ar' ? 'الحالة' : 'Status',
    active: locale === 'ar' ? 'نشط' : 'Active',
    pending: locale === 'ar' ? 'قيد الانتظار' : 'Pending',
    expired: locale === 'ar' ? 'منتهي' : 'Expired',
    activate: locale === 'ar' ? 'تفعيل' : 'Activate',
    deactivate: locale === 'ar' ? 'إيقاف' : 'Deactivate',
    imageOrUrl: locale === 'ar' ? 'صورة أو رابط' : 'Image or URL',
    description: locale === 'ar' ? 'وصف الإعلان (اختياري)' : 'Ad Description (optional)',
    selectPosition: locale === 'ar' ? 'اختر مكان الإعلان' : 'Select ad position',
    selectType: locale === 'ar' ? 'اختر نوع الإعلان' : 'Select ad type',
    confirmDelete: locale === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?',
    days: locale === 'ar' ? 'أيام' : 'days',
    preview: locale === 'ar' ? 'معاينة' : 'Preview',
  };

  const getPositionLabel = (positionId: string) => {
    const pos = AD_POSITIONS.find(p => p.id === positionId);
    if (!pos) return positionId;
    return locale === 'ar' ? pos.labelAr : locale === 'fr' ? pos.labelFr : pos.labelEn;
  };

  const getTypeLabel = (typeId: string) => {
    const type = AD_TYPES.find(t => t.id === typeId);
    if (!type) return typeId;
    return locale === 'ar' ? type.labelAr : locale === 'fr' ? type.labelFr : type.labelEn;
  };

  const getAdStatus = (ad: Ad) => {
    const now = new Date();
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);

    if (ad.status === 'pending') return 'pending';
    if (now > end) return 'expired';
    if (now >= start && now <= end && ad.status === 'active') return 'active';
    return ad.status;
  };

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [statsRes, usersRes, adsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/users?search=${searchQuery}`),
        fetch('/api/admin/ads'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (adsRes.ok) {
        const data = await adsRes.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(locale === 'ar' ? 'يرجى اختيار صورة' : 'Please select an image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(locale === 'ar' ? 'حجم الصورة كبير جداً (حد أقصى 5MB)' : 'Image too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      setAdForm({ ...adForm, imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleAddAd = async () => {
    if (!adForm.title || !adForm.startDate || !adForm.endDate) {
      alert(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const res = await fetch('/api/admin/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adForm),
    });

    if (res.ok) {
      setShowAdForm(false);
      setAdForm({
        title: '',
        type: 'banner',
        position: 'home_top',
        imageUrl: '',
        linkUrl: '',
        content: '',
        startDate: '',
        endDate: '',
        useImageUpload: true,
      });
      setPreviewImage('');
      fetchData();
    }
  };

  const handleUpdateAdStatus = async (id: string, status: string) => {
    await fetch('/api/admin/ads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  // Quick duration presets
  const setDuration = (days: number) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);
    setAdForm({
      ...adForm,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Simple Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold">DzBuild Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 me-2" />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.users.total || 0}</p>
                <p className="text-sm text-muted-foreground">{t.totalUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.ads.total || 0}</p>
                <p className="text-sm text-muted-foreground">{t.totalAds}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('users')}
          >
            <Users className="h-4 w-4 me-2" />
            {t.users}
          </Button>
          <Button
            variant={activeTab === 'ads' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ads')}
          >
            <Megaphone className="h-4 w-4 me-2" />
            {t.ads}
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Users List */}
        {activeTab === 'users' && (
          <Card>
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${locale === 'ar' ? 'right-3' : 'left-3'}`} />
                  <Input
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={locale === 'ar' ? 'pr-10' : 'pl-10'}
                  />
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t.noUsers}</div>
              ) : (
                <div className="divide-y">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      {u.role !== 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ads List */}
        {activeTab === 'ads' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setShowAdForm(true)}>
                  <Plus className="h-4 w-4 me-2" />
                  {t.add}
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">...</div>
              ) : ads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t.noAds}</div>
              ) : (
                <div className="divide-y">
                  {ads.map((ad) => {
                    const status = getAdStatus(ad);
                    return (
                      <div key={ad.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {ad.imageUrl && (
                              <img 
                                src={ad.imageUrl} 
                                alt={ad.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{ad.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {getPositionLabel(ad.position)} • {getTypeLabel(ad.type)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              status === 'active' ? 'bg-green-500/10 text-green-500' :
                              status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                              {status === 'active' ? t.active : status === 'pending' ? t.pending : t.expired}
                            </span>
                            {status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateAdStatus(ad.id, 'paused')}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : status !== 'expired' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateAdStatus(ad.id, 'active')}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteAd(ad.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{t.views}: {ad.impressions}</span>
                          <span>{t.clicks}: {ad.clicks}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add Ad Dialog */}
      <Dialog open={showAdForm} onOpenChange={setShowAdForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.add}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>{t.adTitle} *</Label>
              <Input
                value={adForm.title}
                onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                placeholder={t.adTitle}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>{t.adType}</Label>
              <Select value={adForm.type} onValueChange={(v) => setAdForm({ ...adForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {locale === 'ar' ? type.labelAr : locale === 'fr' ? type.labelFr : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label>{t.adPosition}</Label>
              <Select value={adForm.position} onValueChange={(v) => setAdForm({ ...adForm, position: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_POSITIONS.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {locale === 'ar' ? pos.labelAr : locale === 'fr' ? pos.labelFr : pos.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image - Toggle between URL and Upload */}
            <div className="space-y-2">
              <Label>{t.imageOrUrl}</Label>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={adForm.useImageUpload}
                    onCheckedChange={(checked) => setAdForm({ ...adForm, useImageUpload: checked })}
                  />
                  <span className="text-sm">{t.orUpload}</span>
                </div>
              </div>

              {adForm.useImageUpload ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full h-24 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="max-h-20 object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6" />
                        <span className="text-sm">{t.orUpload}</span>
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <Input
                  placeholder={t.imageUrl}
                  value={adForm.imageUrl}
                  onChange={(e) => {
                    setAdForm({ ...adForm, imageUrl: e.target.value });
                    setPreviewImage(e.target.value);
                  }}
                />
              )}
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label>{t.linkUrl}</Label>
              <Input
                placeholder="https://..."
                value={adForm.linkUrl}
                onChange={(e) => setAdForm({ ...adForm, linkUrl: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t.description}</Label>
              <Textarea
                value={adForm.content}
                onChange={(e) => setAdForm({ ...adForm, content: e.target.value })}
                rows={2}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>{t.duration}</Label>
              <div className="flex gap-2 mb-2">
                <Button size="sm" variant="outline" onClick={() => setDuration(7)}>7 {t.days}</Button>
                <Button size="sm" variant="outline" onClick={() => setDuration(14)}>14 {t.days}</Button>
                <Button size="sm" variant="outline" onClick={() => setDuration(30)}>30 {t.days}</Button>
                <Button size="sm" variant="outline" onClick={() => setDuration(90)}>90 {t.days}</Button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.startDate} *</Label>
                <Input
                  type="date"
                  value={adForm.startDate}
                  onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.endDate} *</Label>
                <Input
                  type="date"
                  value={adForm.endDate}
                  onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdForm(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleAddAd}>
              {t.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
