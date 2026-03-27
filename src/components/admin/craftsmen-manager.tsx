'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Wrench,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Grid,
  List,
  ArrowUpDown,
  Loader2,
  MapPin,
  Phone,
  CheckCircle,
  X,
  Hammer,
  Droplets,
  TreePine,
  Flame,
  Paintbrush,
  Shield,
  HardHat,
  User,
  TrendingUp,
  RefreshCw,
  Mail,
  Briefcase,
  DollarSign,
  Clock,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useRef } from 'react';

// Craftsman categories with icons
const CRAFTSMAN_CATEGORIES = [
  { id: 'builder', nameAr: 'بناء', nameFr: 'Maçon', icon: HardHat, gradient: 'from-amber-500 to-orange-500', color: 'bg-amber-500' },
  { id: 'plumber', nameAr: 'سباك', nameFr: 'Plombier', icon: Droplets, gradient: 'from-blue-500 to-cyan-500', color: 'bg-blue-500' },
  { id: 'electrician', nameAr: 'كهربائي', nameFr: 'Électricien', icon: Shield, gradient: 'from-yellow-500 to-amber-500', color: 'bg-yellow-500' },
  { id: 'carpenter', nameAr: 'نجار', nameFr: 'Menuisier', icon: TreePine, gradient: 'from-green-500 to-emerald-500', color: 'bg-green-500' },
  { id: 'tiler', nameAr: 'بلاط', nameFr: 'Carreleur', icon: Grid, gradient: 'from-cyan-500 to-blue-500', color: 'bg-cyan-500' },
  { id: 'painter', nameAr: 'دهان', nameFr: 'Peintre', icon: Paintbrush, gradient: 'from-purple-500 to-pink-500', color: 'bg-purple-500' },
  { id: 'welder', nameAr: 'لحام', nameFr: 'Soudeur', icon: Flame, gradient: 'from-orange-500 to-red-500', color: 'bg-orange-500' },
  { id: 'other', nameAr: 'أخرى', nameFr: 'Autre', icon: Wrench, gradient: 'from-gray-500 to-slate-500', color: 'bg-gray-500' },
];

// Algerian Wilayas (48)
const WILAYAS = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدينة', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان',
];

interface CraftsmanProfile {
  id: string;
  userId: string;
  categoryId: string;
  specializations?: string;
  experience?: number;
  portfolio?: string;
  availableAreas?: string;
  hourlyRate?: number;
  dailyRate?: number;
  isAvailable: boolean;
  responseTime?: number;
  completedJobs: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    city?: string;
    wilaya?: string;
  };
}

interface CraftsmanFormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  wilaya: string;
  experience: string;
  specializations: string;
  hourlyRate: string;
  dailyRate: string;
  isAvailable: boolean;
  verified: boolean;
  avatar: string;
}

const initialFormData: CraftsmanFormData = {
  name: '',
  email: '',
  phone: '',
  category: '',
  city: '',
  wilaya: '',
  experience: '',
  specializations: '',
  hourlyRate: '',
  dailyRate: '',
  isAvailable: true,
  verified: false,
  avatar: '',
};

export function CraftsmenManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [craftsmen, setCraftsmen] = useState<CraftsmanProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'jobs'>('newest');
  
  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  
  // Selected craftsman for actions
  const [selectedCraftsman, setSelectedCraftsman] = useState<CraftsmanProfile | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CraftsmanFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchCraftsmen();
  }, []);

  const fetchCraftsmen = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/craftsmen');
      if (res.ok) {
        const data = await res.json();
        setCraftsmen(data.craftsmen || []);
      }
    } catch (error) {
      console.error('Error fetching craftsmen:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort craftsmen
  const filteredCraftsmen = craftsmen.filter(craftsman => {
    const name = craftsman.user?.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      craftsman.user?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      craftsman.user?.wilaya?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || craftsman.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'jobs':
        return b.completedJobs - a.completedJobs;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getCategoryInfo = (categoryId: string) => {
    return CRAFTSMAN_CATEGORIES.find(c => c.id === categoryId) || CRAFTSMAN_CATEGORIES[7];
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const res = await fetch('/api/upload/craftsmen', {
        method: 'POST',
        body: formDataUpload,
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, avatar: data.url }));
        toast.success(isRTL ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
      } else {
        const error = await res.json();
        toast.error(error.error || (isRTL ? 'خطأ في رفع الصورة' : 'Upload error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(isRTL ? 'خطأ في رفع الصورة' : 'Error uploading image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle form submission for adding new craftsman
  const handleAddCraftsman = async () => {
    if (!formData.name || !formData.category) {
      toast.error(isRTL ? 'الاسم والفئة مطلوبان' : 'Name and category are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/craftsmen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          category: formData.category,
          city: formData.city || null,
          wilaya: formData.wilaya || null,
          experience: formData.experience || null,
          specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()) : null,
          hourlyRate: formData.hourlyRate || null,
          dailyRate: formData.dailyRate || null,
          isAvailable: formData.isAvailable,
          verified: formData.verified,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCraftsmen([data.craftsman, ...craftsmen]);
        setAddDialog(false);
        setFormData(initialFormData);
        toast.success(isRTL ? 'تم إضافة الحرفي بنجاح' : 'Craftsman added successfully');
      } else {
        const error = await res.json();
        toast.error(error.error || (isRTL ? 'خطأ في إضافة الحرفي' : 'Error adding craftsman'));
      }
    } catch (error) {
      console.error('Error adding craftsman:', error);
      toast.error(isRTL ? 'خطأ في إضافة الحرفي' : 'Error adding craftsman');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submission for editing craftsman
  const handleEditCraftsman = async () => {
    if (!selectedCraftsman || !formData.name || !formData.category) {
      toast.error(isRTL ? 'الاسم والفئة مطلوبان' : 'Name and category are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/craftsmen/${selectedCraftsman.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          category: formData.category,
          city: formData.city || null,
          wilaya: formData.wilaya || null,
          experience: formData.experience || null,
          specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()) : null,
          hourlyRate: formData.hourlyRate || null,
          dailyRate: formData.dailyRate || null,
          isAvailable: formData.isAvailable,
          verified: formData.verified,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCraftsmen(craftsmen.map(c => c.id === selectedCraftsman.id ? data.craftsman : c));
        setEditDialog(false);
        setSelectedCraftsman(null);
        setFormData(initialFormData);
        toast.success(isRTL ? 'تم تحديث الحرفي بنجاح' : 'Craftsman updated successfully');
      } else {
        const error = await res.json();
        toast.error(error.error || (isRTL ? 'خطأ في تحديث الحرفي' : 'Error updating craftsman'));
      }
    } catch (error) {
      console.error('Error updating craftsman:', error);
      toast.error(isRTL ? 'خطأ في تحديث الحرفي' : 'Error updating craftsman');
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit dialog with craftsman data
  const openEditDialog = (craftsman: CraftsmanProfile) => {
    setSelectedCraftsman(craftsman);
    setFormData({
      name: craftsman.user?.name || '',
      email: craftsman.user?.email || '',
      phone: craftsman.user?.phone || '',
      category: craftsman.categoryId,
      city: craftsman.user?.city || '',
      wilaya: craftsman.user?.wilaya || '',
      experience: craftsman.experience?.toString() || '',
      specializations: craftsman.specializations ? JSON.parse(craftsman.specializations).join(', ') : '',
      hourlyRate: craftsman.hourlyRate?.toString() || '',
      dailyRate: craftsman.dailyRate?.toString() || '',
      isAvailable: craftsman.isAvailable,
      verified: craftsman.verified,
      avatar: craftsman.user?.avatar || '',
    });
    setEditDialog(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCraftsman) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/craftsmen/${selectedCraftsman.id}`, { method: 'DELETE' });
      if (res.ok) {
        setCraftsmen(craftsmen.filter(c => c.id !== selectedCraftsman.id));
        setDeleteDialog(false);
        setSelectedCraftsman(null);
        toast.success(isRTL ? 'تم حذف الحرفي بنجاح' : 'Craftsman deleted successfully');
      } else {
        toast.error(isRTL ? 'خطأ في حذف الحرفي' : 'Error deleting craftsman');
      }
    } catch (error) {
      console.error('Error deleting craftsman:', error);
      toast.error(isRTL ? 'خطأ في حذف الحرفي' : 'Error deleting craftsman');
    } finally {
      setDeleting(false);
    }
  };

  const t = {
    title: isRTL ? 'إدارة الحرفيين' : 'Craftsmen Management',
    search: isRTL ? 'بحث عن حرفي...' : 'Search craftsmen...',
    allCategories: isRTL ? 'الكل' : 'All',
    newest: isRTL ? 'الأحدث' : 'Newest',
    rating: isRTL ? 'التقييم' : 'Rating',
    jobs: isRTL ? 'الأعمال' : 'Jobs',
    add: isRTL ? 'إضافة حرفي' : 'Add Craftsman',
    noResults: isRTL ? 'لا توجد نتائج' : 'No results',
    noResultsDesc: isRTL ? 'لم يتم العثور على حرفيين' : 'No craftsmen found',
    total: isRTL ? 'حرفي' : 'craftsmen',
    confirmDelete: isRTL ? 'تأكيد الحذف' : 'Confirm Delete',
    deleteWarning: isRTL ? 'هل أنت متأكد من حذف هذا الحرفي؟' : 'Are you sure you want to delete this craftsman?',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    delete: isRTL ? 'حذف' : 'Delete',
    yearsExp: isRTL ? 'سنة خبرة' : 'years exp',
    completedJobs: isRTL ? 'عمل مكتمل' : 'completed jobs',
    verified: isRTL ? 'موثق' : 'Verified',
    available: isRTL ? 'متاح' : 'Available',
    // Form labels
    nameLabel: isRTL ? 'الاسم الكامل' : 'Full Name',
    emailLabel: isRTL ? 'البريد الإلكتروني' : 'Email',
    phoneLabel: isRTL ? 'رقم الهاتف' : 'Phone Number',
    categoryLabel: isRTL ? 'الفئة' : 'Category',
    cityLabel: isRTL ? 'المدينة' : 'City',
    wilayaLabel: isRTL ? 'الولاية' : 'Wilaya',
    experienceLabel: isRTL ? 'سنوات الخبرة' : 'Years of Experience',
    specializationsLabel: isRTL ? 'التخصصات (مفصولة بفواصل)' : 'Specializations (comma separated)',
    hourlyRateLabel: isRTL ? 'السعر بالساعة (دج)' : 'Hourly Rate (DZD)',
    dailyRateLabel: isRTL ? 'السعر باليوم (دج)' : 'Daily Rate (DZD)',
    availableLabel: isRTL ? 'متاح للعمل' : 'Available for Work',
    verifiedLabel: isRTL ? 'موثق' : 'Verified',
    addTitle: isRTL ? 'إضافة حرفي جديد' : 'Add New Craftsman',
    editTitle: isRTL ? 'تعديل الحرفي' : 'Edit Craftsman',
    save: isRTL ? 'حفظ' : 'Save',
    selectCategory: isRTL ? 'اختر الفئة' : 'Select Category',
    selectWilaya: isRTL ? 'اختر الولاية' : 'Select Wilaya',
  };

  const stats = [
    { label: isRTL ? 'إجمالي الحرفيين' : 'Total Craftsmen', value: craftsmen.length, icon: Wrench, color: 'from-amber-500 to-orange-500' },
    { label: isRTL ? 'موثقين' : 'Verified', value: craftsmen.filter(c => c.verified).length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: isRTL ? 'متاحين' : 'Available', value: craftsmen.filter(c => c.isAvailable).length, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  ];

  // Form Dialog Component
  const renderFormDialog = (isEdit: boolean) => (
    <Dialog open={isEdit ? editDialog : addDialog} onOpenChange={isEdit ? setEditDialog : setAddDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl bg-gradient-to-br",
              isEdit ? "from-blue-500 to-cyan-500" : "from-amber-500 to-orange-500"
            )}>
              {isEdit ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
            </div>
            {isEdit ? t.editTitle : t.addTitle}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isRTL 
              ? 'أدخل بيانات الحرفي في النموذج أدناه' 
              : 'Enter the craftsman details in the form below'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {/* Name */}
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t.nameLabel} *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-800 border-white/10 text-white"
              placeholder={isRTL ? 'أدخل الاسم الكامل' : 'Enter full name'}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t.emailLabel}
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-slate-800 border-white/10 text-white"
              placeholder={isRTL ? 'example@email.com' : 'example@email.com'}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t.phoneLabel}
            </Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-slate-800 border-white/10 text-white"
              placeholder="0555 00 00 00"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {t.categoryLabel} *
            </Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                <SelectValue placeholder={t.selectCategory} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                {CRAFTSMAN_CATEGORIES.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {isRTL ? cat.nameAr : cat.nameFr}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {t.experienceLabel}
            </Label>
            <Input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="bg-slate-800 border-white/10 text-white"
              placeholder="5"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t.cityLabel}
            </Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-slate-800 border-white/10 text-white"
              placeholder={isRTL ? 'أدخل المدينة' : 'Enter city'}
            />
          </div>

          {/* Wilaya */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t.wilayaLabel}
            </Label>
            <Select value={formData.wilaya} onValueChange={(v) => setFormData({ ...formData, wilaya: v })}>
              <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                <SelectValue placeholder={t.selectWilaya} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10 max-h-60">
                {WILAYAS.map((w) => (
                  <SelectItem key={w} value={w} className="text-white hover:bg-white/10">
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specializations */}
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {t.specializationsLabel}
            </Label>
            <Input
              value={formData.specializations}
              onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
              className="bg-slate-800 border-white/10 text-white"
              placeholder={isRTL ? 'بناء, تشطيب, عزل...' : 'masonry, finishing, insulation...'}
            />
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t.hourlyRateLabel}
            </Label>
            <Input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              className="bg-slate-800 border-white/10 text-white"
              placeholder="2000"
            />
          </div>

          {/* Daily Rate */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t.dailyRateLabel}
            </Label>
            <Input
              type="number"
              value={formData.dailyRate}
              onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
              className="bg-slate-800 border-white/10 text-white"
              placeholder="15000"
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {isRTL ? 'صورة الحرفي' : 'Craftsman Photo'}
            </Label>
            
            {/* Image Preview */}
            {formData.avatar ? (
              <div className="relative inline-block">
                <img 
                  src={formData.avatar + (formData.avatar.startsWith('/') ? '?t=' + Date.now() : '')} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -end-2 h-6 w-6 rounded-full p-0"
                  onClick={() => setFormData({ ...formData, avatar: '' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-white/20 flex items-center justify-center">
                <User className="h-8 w-8 text-slate-500" />
              </div>
            )}
            
            {/* Upload Button */}
            <div className="mt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-white/20 text-white hover:bg-white/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {isRTL ? 'رفع صورة' : 'Upload Photo'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Available Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-400" />
              <Label className="text-slate-300">{t.availableLabel}</Label>
            </div>
            <Switch
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            />
          </div>

          {/* Verified Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <Label className="text-slate-300">{t.verifiedLabel}</Label>
            </div>
            <Switch
              checked={formData.verified}
              onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              if (isEdit) {
                setEditDialog(false);
              } else {
                setAddDialog(false);
              }
              setFormData(initialFormData);
            }} 
            disabled={submitting}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {t.cancel}
          </Button>
          <Button 
            onClick={isEdit ? handleEditCraftsman : handleAddCraftsman} 
            disabled={submitting}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {submitting 
              ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
              : (isEdit ? t.save : t.add)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl bg-gradient-to-br", stat.color)}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={cn(
                "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400",
                isRTL ? "right-4" : "left-4"
              )} />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-12 bg-slate-700 border-white/10 text-white placeholder:text-slate-400",
                  isRTL ? "pr-12" : "pl-12"
                )}
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full lg:w-40 h-12 bg-slate-700 border-white/10 text-white">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="newest" className="text-white hover:bg-white/10">{t.newest}</SelectItem>
                <SelectItem value="rating" className="text-white hover:bg-white/10">{t.rating}</SelectItem>
                <SelectItem value="jobs" className="text-white hover:bg-white/10">{t.jobs}</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Button */}
            <Button 
              onClick={() => {
                setFormData(initialFormData);
                setAddDialog(true);
              }}
              className="h-12 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
            >
              <Plus className="h-5 w-5" />
              {t.add}
            </Button>

            {/* View Mode */}
            <div className="flex gap-1 border border-white/10 rounded-xl p-1 h-12 items-center bg-slate-700">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-lg"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-lg"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex justify-center gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            "flex flex-col items-center gap-2 min-w-[70px]",
            selectedCategory === 'all' && "scale-110"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            selectedCategory === 'all' 
              ? "bg-gradient-to-br from-primary to-primary/70 ring-2 ring-primary/50" 
              : "bg-slate-700 hover:bg-slate-600"
          )}>
            <User className={cn(
              "h-6 w-6",
              selectedCategory === 'all' ? "text-white" : "text-slate-300"
            )} />
          </div>
          <span className={cn(
            "text-xs font-medium",
            selectedCategory === 'all' ? "text-primary" : "text-slate-400"
          )}>
            {t.allCategories}
          </span>
        </button>
        
        {CRAFTSMAN_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isSelected = selectedCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 min-w-[70px]",
                isSelected && "scale-110"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                isSelected 
                  ? `bg-gradient-to-br ${cat.gradient} ring-2 ring-white/30` 
                  : "bg-slate-700 hover:bg-slate-600"
              )}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <span className={cn(
                "text-xs font-medium text-center",
                isSelected ? "text-white" : "text-slate-400"
              )}>
                {isRTL ? cat.nameAr : cat.nameFr}
              </span>
            </button>
          );
        })}
      </div>

      {/* Craftsmen Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredCraftsmen.length === 0 ? (
        <Card className="bg-slate-800 border-white/10">
          <CardContent className="py-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-300 font-medium">{t.noResults}</p>
            <p className="text-sm text-slate-400 mt-2">{t.noResultsDesc}</p>
            <Button 
              onClick={() => setAddDialog(true)}
              className="mt-4 gap-2 bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Plus className="h-4 w-4" />
              {t.add}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredCraftsmen.map((craftsman) => {
            const categoryInfo = getCategoryInfo(craftsman.categoryId);
            const IconComponent = categoryInfo.icon;
            
            return (
              <Card 
                key={craftsman.id} 
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 overflow-hidden hover:border-primary/30 transition-all"
              >
                <div className={cn(
                  "h-20 relative bg-gradient-to-r",
                  categoryInfo.gradient
                )}>
                  <div className="absolute inset-0 bg-black/10" />
                  {craftsman.verified && (
                    <Badge className="absolute top-3 right-3 bg-green-500/90 text-white border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t.verified}
                    </Badge>
                  )}
                  <div className="absolute -bottom-7 right-4 w-14 h-14 rounded-2xl bg-slate-800 shadow-lg flex items-center justify-center border-4 border-slate-800">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <CardContent className="pt-10 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{craftsman.user?.name || '---'}</h3>
                      <p className="text-xs text-slate-400">{craftsman.user?.email}</p>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="mb-2 text-xs bg-slate-700">
                    {isRTL ? categoryInfo.nameAr : categoryInfo.nameFr}
                  </Badge>
                  
                  {craftsman.user?.city && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                      <MapPin className="h-3 w-3" />
                      {craftsman.user.city}, {craftsman.user.wilaya}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-white font-medium">{craftsman.rating.toFixed(1)}</span>
                    </span>
                    <span>{craftsman.completedJobs} {t.completedJobs}</span>
                    {craftsman.experience && (
                      <span>{craftsman.experience} {t.yearsExp}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant={craftsman.isAvailable ? 'default' : 'secondary'} className="text-xs">
                      {craftsman.isAvailable ? t.available : '---'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-white/20 text-white hover:bg-white/10 hover:text-white"
                      onClick={() => openEditDialog(craftsman)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {isRTL ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => {
                        setSelectedCraftsman(craftsman);
                        setDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      {renderFormDialog(false)}

      {/* Edit Dialog */}
      {renderFormDialog(true)}

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{t.confirmDelete}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {t.deleteWarning}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog(false)} 
              disabled={deleting}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {t.cancel}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {deleting ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CraftsmenManager;
