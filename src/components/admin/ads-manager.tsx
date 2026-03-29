'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Target,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Save,
  X,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  position: string;
  ad_type: string;
  duration_days: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  clicks_count: number;
  views_count: number;
  target_audience: string;
  wilaya?: string;
  priority: number;
  created_at: string;
}

const positionLabelsAr: Record<string, string> = {
  sidebar: 'الشريط الجانبي',
  header: 'أعلى الصفحة',
  footer: 'أسفل الصفحة',
  feed: 'داخل المحتوى',
  popup: 'نافذة منبثقة',
};

const audienceLabelsAr: Record<string, string> = {
  all: 'الجميع',
  engineers: 'المهندسين',
  contractors: 'المقاولين',
  craftsmen: 'الحرفيين',
  companies: 'الشركات',
};

const positionColors: Record<string, string> = {
  sidebar: 'bg-blue-500',
  header: 'bg-green-500',
  footer: 'bg-amber-500',
  feed: 'bg-purple-500',
  popup: 'bg-red-500',
};

export function AdsManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 'sidebar',
    ad_type: 'image',
    duration_days: 30,
    start_date: new Date().toISOString().split('T')[0],
    target_audience: 'all',
    wilaya: '',
    priority: 0,
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ads');
      const data = await res.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      position: 'sidebar',
      ad_type: 'image',
      duration_days: 30,
      start_date: new Date().toISOString().split('T')[0],
      target_audience: 'all',
      wilaya: '',
      priority: 0,
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      position: ad.position,
      ad_type: ad.ad_type,
      duration_days: ad.duration_days,
      start_date: ad.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      target_audience: ad.target_audience,
      wilaya: ad.wilaya || '',
      priority: ad.priority,
    });
    setShowForm(true);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(isRTL ? 'نوع الملف غير مدعوم. استخدم JPG, PNG, GIF, أو WebP' : 'Invalid file type. Use JPG, PNG, GIF, or WebP');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(isRTL ? 'حجم الملف كبير جداً. الحد الأقصى 5MB' : 'File too large. Maximum 5MB');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error || (isRTL ? 'فشل تحميل الصورة' : 'Upload failed'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(isRTL ? 'حدث خطأ أثناء التحميل' : 'Upload error');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert(isRTL ? 'يرجى إدخال عنوان الإعلان' : 'Please enter ad title');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/ads';
      const method = editingAd ? 'PUT' : 'POST';
      const body = editingAd 
        ? { id: editingAd.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        await fetchAds();
        resetForm();
      } else {
        alert(data.error || (isRTL ? 'حدث خطأ' : 'Error occurred'));
      }
    } catch (error) {
      console.error('Error saving ad:', error);
      alert(isRTL ? 'حدث خطأ في الحفظ' : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Are you sure?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        await fetchAds();
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  const toggleActive = async (ad: Ad) => {
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ad.id,
          is_active: !ad.is_active,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchAds();
      }
    } catch (error) {
      console.error('Error toggling ad:', error);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            {isRTL ? 'إدارة الإعلانات' : 'Ads Management'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRTL ? `${ads.length} إعلان` : `${ads.length} ads`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAds}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {isRTL ? 'إعلان جديد' : 'New Ad'}
          </Button>
        </div>
      </div>

      {/* Ad Form */}
      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editingAd 
                  ? (isRTL ? 'تعديل الإعلان' : 'Edit Ad')
                  : (isRTL ? 'إعلان جديد' : 'New Ad')}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'عنوان الإعلان' : 'Ad Title'} *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isRTL ? 'أدخل العنوان' : 'Enter title'}
                />
              </div>

              {/* Position */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'مكان الإعلان' : 'Position'}
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full h-10 rounded-md border bg-background px-3"
                >
                  {Object.entries(positionLabelsAr).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {isRTL ? 'صورة الإعلان' : 'Ad Image'}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder={isRTL ? 'رابط الصورة أو حمّل من جهازك' : 'Image URL or upload from device'}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="ad-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="gap-2 shrink-0"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {isRTL ? 'تحميل صورة' : 'Upload'}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL 
                    ? 'JPG, PNG, GIF, WebP - الحد الأقصى 5MB'
                    : 'JPG, PNG, GIF, WebP - Max 5MB'}
                </p>
              </div>

              {/* Link URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {isRTL ? 'رابط الوجهة' : 'Destination Link'}
                </label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {isRTL ? 'المدة (أيام)' : 'Duration (days)'}
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })}
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {isRTL ? 'تاريخ البدء' : 'Start Date'}
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {isRTL ? 'الجمهور المستهدف' : 'Target Audience'}
                </label>
                <select
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full h-10 rounded-md border bg-background px-3"
                >
                  {Object.entries(audienceLabelsAr).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'الأولوية' : 'Priority'}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Wilaya (Region) */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {isRTL ? 'الولاية (اختياري)' : 'Wilaya (optional)'}
                </label>
                <Input
                  value={formData.wilaya}
                  onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                  placeholder={isRTL ? 'اتركه فارغاً لكل الولايات' : 'Leave empty for all regions'}
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2"
                  placeholder={isRTL ? 'وصف الإعلان...' : 'Ad description...'}
                />
              </div>

              {/* Image Preview */}
              {formData.image_url && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 flex items-center justify-between">
                    <span>{isRTL ? 'معاينة الصورة' : 'Image Preview'}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="h-6 text-xs text-destructive"
                    >
                      <X className="h-3 w-3" />
                      {isRTL ? 'إزالة' : 'Remove'}
                    </Button>
                  </label>
                  <div className="border rounded-lg p-2 bg-muted/30 max-w-md">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-auto rounded max-h-48 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={resetForm}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={saving || uploading}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ads List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : ads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => {
            const daysRemaining = ad.end_date ? getDaysRemaining(ad.end_date) : null;
            const isExpired = daysRemaining !== null && daysRemaining < 0;
            
            return (
              <Card key={ad.id} className={cn(
                'overflow-hidden',
                !ad.is_active && 'opacity-60',
                isExpired && 'border-destructive'
              )}>
                {/* Ad Image */}
                {ad.image_url && (
                  <div className="aspect-video bg-muted relative">
                    <img 
                      src={ad.image_url} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className={cn('absolute top-2 right-2', positionColors[ad.position])}
                    >
                      {positionLabelsAr[ad.position]}
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium line-clamp-1">{ad.title}</h4>
                    <Badge variant={ad.is_active && !isExpired ? 'default' : 'secondary'}>
                      {isExpired 
                        ? (isRTL ? 'منتهي' : 'Expired')
                        : ad.is_active 
                          ? (isRTL ? 'نشط' : 'Active')
                          : (isRTL ? 'متوقف' : 'Paused')}
                    </Badge>
                  </div>

                  {ad.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ad.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {audienceLabelsAr[ad.target_audience]}
                    </span>
                    {ad.wilaya && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ad.wilaya}
                      </span>
                    )}
                    {daysRemaining !== null && (
                      <span className={cn(
                        'flex items-center gap-1',
                        daysRemaining <= 7 && 'text-amber-500',
                        daysRemaining < 0 && 'text-destructive'
                      )}>
                        <Clock className="h-3 w-3" />
                        {daysRemaining > 0 
                          ? `${daysRemaining} ${isRTL ? 'يوم متبقي' : 'days left'}`
                          : isRTL ? 'منتهي' : 'Expired'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {ad.views_count} {isRTL ? 'مشاهدة' : 'views'}
                    <span className="mx-1">•</span>
                    <span>{ad.clicks_count} {isRTL ? 'نقر' : 'clicks'}</span>
                  </div>

                  <div className="flex items-center gap-1 pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleActive(ad)}
                    >
                      {ad.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {ad.link_url && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(ad.link_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {isRTL ? 'لا توجد إعلانات حالياً' : 'No ads yet'}
          </p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {isRTL ? 'أضف إعلان جديد' : 'Add New Ad'}
          </Button>
        </div>
      )}
    </div>
  );
}
