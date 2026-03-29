'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';

// localStorage keys for tracking user's items
const MY_ITEMS_KEYS: Record<string, string> = {
  product: 'dzbuild_my_products',
  craftsman: 'dzbuild_my_craftsmen',
  company: 'dzbuild_my_companies',
  job: 'dzbuild_my_jobs',
  project: 'dzbuild_my_projects',
};

function getMyItems(type: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(MY_ITEMS_KEYS[type] || `dzbuild_my_${type}s`);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveMyItem(type: string, itemId: string, editToken: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = MY_ITEMS_KEYS[type] || `dzbuild_my_${type}s`;
    const items = getMyItems(type);
    items[itemId] = editToken;
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    console.error('Failed to save item token');
  }
}

function removeMyItem(type: string, itemId: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = MY_ITEMS_KEYS[type] || `dzbuild_my_${type}s`;
    const items = getMyItems(type);
    delete items[itemId];
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    console.error('Failed to remove item token');
  }
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, Upload, Image as ImageIcon, X, Trash2, Pencil, Send } from 'lucide-react';
import { Captcha, useCaptcha } from '@/components/shared/captcha';

// Wilayas
const WILAYAS = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'عين الدفلى', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'تيبازة', 'ميلة', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان'
];

// Categories for each type
export const MARKET_CATEGORIES = [
  { id: 'materials', nameAr: 'مواد البناء', nameFr: 'Matériaux' },
  { id: 'tools', nameAr: 'أدوات البناء', nameFr: 'Outils' },
  { id: 'equipment', nameAr: 'معدات ثقيلة', nameFr: 'Équipements' },
  { id: 'safety', nameAr: 'معدات السلامة', nameFr: 'Sécurité' },
  { id: 'electrical', nameAr: 'مواد كهربائية', nameFr: 'Électrique' },
  { id: 'plumbing', nameAr: 'مواد السباكة', nameFr: 'Plomberie' },
];

export const CRAFTSMAN_CATEGORIES = [
  { id: 'builder', nameAr: 'بناء', nameFr: 'Maçonnerie' },
  { id: 'plumber', nameAr: 'سباكة', nameFr: 'Plomberie' },
  { id: 'electrician', nameAr: 'كهربائي', nameFr: 'Électricité' },
  { id: 'painter', nameAr: 'دهان', nameFr: 'Peinture' },
  { id: 'carpenter', nameAr: 'نجارة', nameFr: 'Menuiserie' },
  { id: 'tiler', nameAr: 'بلاط', nameFr: 'Carrelage' },
  { id: 'welder', nameAr: 'لحام', nameFr: 'Soudure' },
  { id: 'other', nameAr: 'أخرى', nameFr: 'Autre' },
];

export const COMPANY_TYPES = [
  { id: 'BET', nameAr: 'مكتب دراسات', nameFr: "Bureau d'Études" },
  { id: 'CONSTRUCTION', nameAr: 'شركة مقاولات', nameFr: 'Construction' },
  { id: 'MATERIALS', nameAr: 'مورد مواد بناء', nameFr: 'Fournisseur' },
  { id: 'SURVEY', nameAr: 'مسح طوبوغرافي', nameFr: 'Topographie' },
  { id: 'ELECTRICAL_MECHANICAL', nameAr: 'كهرباء وميكانيك', nameFr: 'Électromécanique' },
];

export const JOB_CATEGORIES = [
  { id: 'engineering', nameAr: 'هندسة', nameFr: 'Ingénierie' },
  { id: 'architecture', nameAr: 'عمارة', nameFr: 'Architecture' },
  { id: 'construction', nameAr: 'بناء', nameFr: 'Construction' },
  { id: 'electrical', nameAr: 'كهرباء', nameFr: 'Électricité' },
  { id: 'management', nameAr: 'إدارة', nameFr: 'Management' },
  { id: 'draftsman', nameAr: 'رسم', nameFr: 'Dessinateur' },
  { id: 'other', nameAr: 'أخرى', nameFr: 'Autre' },
];

export const PROJECT_CATEGORIES = [
  { id: 'residential', nameAr: 'سكني', nameFr: 'Résidentiel' },
  { id: 'commercial', nameAr: 'تجاري', nameFr: 'Commercial' },
  { id: 'industrial', nameAr: 'صناعي', nameFr: 'Industriel' },
  { id: 'infrastructure', nameAr: 'بنية تحتية', nameFr: 'Infrastructure' },
  { id: 'public', nameAr: 'عام', nameFr: 'Public' },
  { id: 'renovation', nameAr: 'ترميم', nameFr: 'Rénovation' },
];

export type ItemType = 'product' | 'craftsman' | 'company' | 'job' | 'project';

interface EditItem {
  id: string;
  [key: string]: unknown;
}

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ItemType;
  onSuccess: () => void;
  editItem?: EditItem | null;
}

export function AddItemDialog({ open, onOpenChange, type, onSuccess, editItem }: AddItemDialogProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CAPTCHA for products
  const { isValid: captchaValid, handleValidChange: handleCaptchaValidChange } = useCaptcha();

  const isEditMode = !!editItem;

  // Form state
  const [formData, setFormData] = useState<Record<string, string | number>>({
    title: '',
    description: '',
    city: '',
    wilaya: '',
    phone: '',
    email: '',
    image: '',
    category: 'materials',
    price: '',
    unit: 'وحدة',
    supplier_name: '',
    name: '',
    specialty: '',
    experience_years: '0',
    company_type: 'BET',
    website: '',
    company_name: '',
    salary_range: '',
    experience_level: 'entry',
    deadline: '',
    status: 'planning',
    progress: '0',
    budget: '',
    start_date: '',
    end_date: '',
  });

  // Load edit item data
  useEffect(() => {
    if (editItem) {
      const image = (editItem.images as string[])?.[0] || (editItem.image_url as string) || '';
      setFormData({
        title: (editItem.title as string) || (editItem.name as string) || '',
        description: (editItem.description as string) || '',
        city: (editItem.city as string) || (editItem.location as string) || '',
        wilaya: (editItem.wilaya as string) || '',
        phone: (editItem.phone as string) || (editItem.contact_phone as string) || '',
        email: (editItem.email as string) || (editItem.contact_email as string) || '',
        image,
        category: (editItem.category as string) || (editItem.category_id as string) || 'materials',
        price: (editItem.price as number)?.toString() || '',
        unit: (editItem.unit as string) || 'وحدة',
        supplier_name: (editItem.supplier_name as string) || '',
        name: (editItem.name as string) || '',
        specialty: (editItem.specialty as string) || '',
        experience_years: (editItem.experience as number)?.toString() || '0',
        company_type: (editItem.type as string) || 'BET',
        website: (editItem.website as string) || '',
        company_name: (editItem.company_name as string) || '',
        salary_range: (editItem.salary_range as string) || '',
        experience_level: (editItem.experience_level as string) || 'entry',
        deadline: (editItem.deadline as string)?.split('T')[0] || '',
        status: (editItem.status as string) || 'planning',
        progress: (editItem.progress as number)?.toString() || '0',
        budget: (editItem.budget as number)?.toString() || '',
        start_date: (editItem.start_date as string)?.split('T')[0] || '',
        end_date: (editItem.end_date as string)?.split('T')[0] || '',
      });
    } else {
      resetForm();
    }
  }, [editItem]);

  const resetForm = () => {
    // Set default category based on type
    let defaultCategory = 'materials';
    if (type === 'craftsman') defaultCategory = 'builder';
    else if (type === 'job') defaultCategory = 'engineering';
    else if (type === 'project') defaultCategory = 'residential';
    
    setFormData({
      title: '',
      description: '',
      city: '',
      wilaya: '',
      phone: '',
      email: '',
      image: '',
      category: defaultCategory,
      price: '',
      unit: 'وحدة',
      supplier_name: '',
      name: '',
      specialty: '',
      experience_years: '0',
      company_type: 'BET',
      website: '',
      company_name: '',
      salary_range: '',
      experience_level: 'entry',
      deadline: '',
      status: 'planning',
      progress: '0',
      budget: '',
      start_date: '',
      end_date: '',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload/market', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success(isRTL ? 'تم رفع الصورة بنجاح' : 'Image uploaded');
      } else {
        toast.error(isRTL ? 'خطأ في رفع الصورة' : 'Upload error');
      }
    } catch {
      toast.error(isRTL ? 'خطأ في رفع الصورة' : 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    // For products, require CAPTCHA validation (only for new items)
    if (type === 'product' && !isEditMode && !captchaValid) {
      toast.error(isRTL ? 'يرجى التحقق من أنك لست روبوت' : 'Veuillez vérifier que vous n\'êtes pas un robot');
      return;
    }

    setSaving(true);
    try {
      // Use guest APIs for public posting
      let endpoint = '';
      let method = 'POST';
      let body: Record<string, unknown> = {};
      const { isLoggedIn, user } = useAppStore.getState();

      if (isEditMode && editItem) {
        // For edit mode, use guest API with PUT
        endpoint = `/api/guest/${type}s`;
        method = 'PUT';
      } else {
        // For new items, use guest API
        endpoint = `/api/guest/${type}s`;
        method = 'POST';
      }

      switch (type) {
        case 'product':
          body = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            price: parseFloat(formData.price as string) || 0,
            unit: formData.unit,
            stock: 0,
            images: formData.image ? [formData.image] : [],
          };
          break;

        case 'craftsman':
          body = {
            name: formData.name || formData.title,
            category: formData.category,
            specialty: formData.specialty,
            city: formData.city,
            wilaya: formData.wilaya,
            phone: formData.phone,
            email: formData.email,
            experience_years: parseInt(formData.experience_years as string) || 0,
            bio: formData.description,
            images: formData.image ? [formData.image] : [],
          };
          break;

        case 'company':
          body = {
            name: formData.name || formData.title,
            company_type: formData.company_type,
            description: formData.description,
            email: formData.email,
            phone: formData.phone,
            website: formData.website,
            city: formData.city,
            wilaya: formData.wilaya,
          };
          break;

        case 'job':
          body = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            company_name: formData.company_name,
            city: formData.city,
            wilaya: formData.wilaya,
            salary_range: formData.salary_range,
            experience_level: formData.experience_level,
            contact_email: formData.email,
            contact_phone: formData.phone,
            deadline: formData.deadline || null,
          };
          break;

        case 'project':
          body = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            status: formData.status,
            progress: parseInt(formData.progress as string) || 0,
            budget: parseFloat(formData.budget as string) || 0,
            location: formData.city,
            wilaya: formData.wilaya,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            images: formData.image ? [formData.image] : [],
          };
          break;
      }

      // Add id for edit mode
      if (isEditMode && editItem) {
        body.id = editItem.id;
        // For products, companies - no token needed
        // For other types, check if token is needed
        if (type !== 'product' && type !== 'company') {
          const myItems = getMyItems(type);
          const storedToken = myItems[editItem.id];
          body.editToken = storedToken || (editItem as Record<string, unknown>).editToken || (editItem as Record<string, unknown>).edit_token;
          body.isAdmin = isLoggedIn && user?.role === 'ADMIN';
        }
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        // Save editToken to localStorage for new items (only for types that need it)
        if (!isEditMode && data.success && type !== 'product' && type !== 'company') {
          // Try multiple possible response structures
          const itemData = data[type] || data.craftsman || data.job || data.project || data;
          const newItemId = itemData?.id;
          const editToken = data.editToken || itemData?.editToken || itemData?.edit_token;
          
          if (newItemId && editToken) {
            saveMyItem(type, newItemId, editToken);
          }
        }
        
        toast.success(isRTL 
          ? (isEditMode ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح') 
          : (isEditMode ? 'Mis à jour' : 'Ajouté avec succès'));
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(data.error || (isRTL ? 'خطأ' : 'Erreur'));
      }
    } catch {
      toast.error(isRTL ? 'خطأ' : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editItem) return;
    
    setSaving(true);
    try {
      // For products - use /api/products/{id}
      let url = `/api/${type}s/${editItem.id}`;
      
      // For companies - use guest API without token
      if (type === 'company') {
        url = `/api/guest/companies?id=${editItem.id}`;
      }
      
      // For other types that need token
      if (type !== 'product' && type !== 'company') {
        const { isLoggedIn, user } = useAppStore.getState();
        const myItems = getMyItems(type);
        const editToken = myItems[editItem.id] || editItem.editToken;
        const isAdmin = isLoggedIn && user?.role === 'ADMIN';
        url = `/api/guest/${type}s?id=${editItem.id}${editToken ? `&editToken=${editToken}` : ''}&isAdmin=${isAdmin}`;
      }
      
      const res = await fetch(url, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Remove from localStorage (only for types that use it)
        if (type !== 'product' && type !== 'company') {
          removeMyItem(type, editItem.id);
        }
        toast.success(isRTL ? 'تم الحذف بنجاح' : 'Supprimé');
        setShowDeleteConfirm(false);
        onOpenChange(false);
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.error || (isRTL ? 'خطأ في الحذف' : 'Erreur'));
      }
    } catch {
      toast.error(isRTL ? 'خطأ في الحذف' : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    const titles = {
      product: isEditMode 
        ? (isRTL ? 'تعديل المنتج' : 'Modifier le produit')
        : (isRTL ? 'نشر منتج' : 'Publier un produit'),
      craftsman: isEditMode
        ? (isRTL ? 'تعديل الحرفي' : "Modifier l'artisan")
        : (isRTL ? 'تسجيل كحرفي' : "S'inscrire comme artisan"),
      company: isEditMode
        ? (isRTL ? 'تعديل الشركة' : "Modifier l'entreprise")
        : (isRTL ? 'إضافة شركة' : 'Ajouter une entreprise'),
      job: isEditMode
        ? (isRTL ? 'تعديل الوظيفة' : "Modifier l'offre")
        : (isRTL ? 'إضافة وظيفة' : 'Publier une offre'),
      project: isEditMode
        ? (isRTL ? 'تعديل المشروع' : 'Modifier le projet')
        : (isRTL ? 'إضافة مشروع' : 'Ajouter un projet'),
    };
    return titles[type];
  };

  const getCategories = () => {
    switch (type) {
      case 'product':
        return MARKET_CATEGORIES;
      case 'craftsman':
        return CRAFTSMAN_CATEGORIES;
      case 'job':
        return JOB_CATEGORIES;
      case 'project':
        return PROJECT_CATEGORIES;
      default:
        return [];
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditMode && <Pencil className="h-5 w-5" />}
              {getTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Title / Name */}
            {(type === 'product' || type === 'job' || type === 'project') && (
              <div className="sm:col-span-2">
                <Label>{isRTL ? 'العنوان' : 'Titre'} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isRTL ? 'أدخل العنوان' : 'Entrez le titre'}
                />
              </div>
            )}

            {(type === 'craftsman' || type === 'company') && (
              <div className="sm:col-span-2">
                <Label>{isRTL ? 'الاسم' : 'Nom'} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isRTL ? 'أدخل الاسم' : 'Entrez le nom'}
                />
              </div>
            )}

            {/* Category */}
            {['product', 'craftsman', 'job', 'project'].includes(type) && (
              <div>
                <Label>{isRTL ? 'القسم' : 'Catégorie'} *</Label>
                <Select 
                  value={formData.category as string} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategories().map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {isRTL ? cat.nameAr : cat.nameFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Company Type */}
            {type === 'company' && (
              <div>
                <Label>{isRTL ? 'نوع الشركة' : "Type d'entreprise"} *</Label>
                <Select 
                  value={formData.company_type as string} 
                  onValueChange={(v) => setFormData({ ...formData, company_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {isRTL ? cat.nameAr : cat.nameFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="sm:col-span-2">
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description as string}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isRTL ? 'أدخل الوصف' : 'Entrez la description'}
                className="min-h-[100px]"
              />
            </div>

            {/* City */}
            <div>
              <Label>{isRTL ? 'المدينة' : 'Ville'}</Label>
              <Input
                value={formData.city as string}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder={isRTL ? 'المدينة' : 'Ville'}
              />
            </div>

            {/* Wilaya */}
            <div>
              <Label>{isRTL ? 'الولاية' : 'Wilaya'}</Label>
              <Select 
                value={formData.wilaya as string} 
                onValueChange={(v) => setFormData({ ...formData, wilaya: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر الولاية" : "Choisir"} />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div>
              <Label>{isRTL ? 'الهاتف' : 'Téléphone'}</Label>
              <Input
                value={formData.phone as string}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0XXX XXX XXX"
                dir="ltr"
              />
            </div>

            {/* Email */}
            <div>
              <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                type="email"
                value={formData.email as string}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                dir="ltr"
              />
            </div>

            {/* Product specific fields */}
            {type === 'product' && (
              <>
                <div>
                  <Label>{isRTL ? 'السعر (دج)' : 'Prix (DZD)'} *</Label>
                  <Input
                    type="number"
                    value={formData.price as string}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'الوحدة' : 'Unité'}</Label>
                  <Select 
                    value={formData.unit as string} 
                    onValueChange={(v) => setFormData({ ...formData, unit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="وحدة">{isRTL ? 'وحدة' : 'Unité'}</SelectItem>
                      <SelectItem value="متر">{isRTL ? 'متر' : 'Mètre'}</SelectItem>
                      <SelectItem value="متر مربع">{isRTL ? 'متر مربع' : 'M²'}</SelectItem>
                      <SelectItem value="متر مكعب">{isRTL ? 'متر مكعب' : 'M³'}</SelectItem>
                      <SelectItem value="طن">{isRTL ? 'طن' : 'Tonne'}</SelectItem>
                      <SelectItem value="كيس">{isRTL ? 'كيس' : 'Sac'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>{isRTL ? 'اسم المورد' : 'Nom du fournisseur'}</Label>
                  <Input
                    value={formData.supplier_name as string}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Craftsman specific fields */}
            {type === 'craftsman' && (
              <>
                <div>
                  <Label>{isRTL ? 'التخصص' : 'Spécialité'}</Label>
                  <Input
                    value={formData.specialty as string}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'سنوات الخبرة' : "Années d'expérience"}</Label>
                  <Input
                    type="number"
                    value={formData.experience_years as string}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Company specific fields */}
            {type === 'company' && (
              <div className="sm:col-span-2">
                <Label>{isRTL ? 'الموقع الإلكتروني' : 'Site web'}</Label>
                <Input
                  value={formData.website as string}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  dir="ltr"
                />
              </div>
            )}

            {/* Job specific fields */}
            {type === 'job' && (
              <>
                <div>
                  <Label>{isRTL ? 'اسم الشركة' : 'Nom de la société'} *</Label>
                  <Input
                    value={formData.company_name as string}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'مستوى الخبرة' : "Niveau d'expérience"}</Label>
                  <Select 
                    value={formData.experience_level as string} 
                    onValueChange={(v) => setFormData({ ...formData, experience_level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">{isRTL ? 'مبتدئ (0-1 سنة)' : 'Débutant (0-1 an)'}</SelectItem>
                      <SelectItem value="junior">{isRTL ? 'مبتدئ (1-3 سنوات)' : 'Junior (1-3 ans)'}</SelectItem>
                      <SelectItem value="mid">{isRTL ? 'متوسط (3-5 سنوات)' : 'Intermédiaire (3-5 ans)'}</SelectItem>
                      <SelectItem value="senior">{isRTL ? 'خبير (5+ سنوات)' : 'Senior (5+ ans)'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? 'نطاق الراتب' : 'Salaire'}</Label>
                  <Input
                    value={formData.salary_range as string}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder={isRTL ? 'مثال: 50000-70000 دج' : 'Ex: 50000-70000 DA'}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'آخر موعد' : 'Date limite'}</Label>
                  <Input
                    type="date"
                    value={formData.deadline as string}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Project specific fields */}
            {type === 'project' && (
              <>
                <div>
                  <Label>{isRTL ? 'الحالة' : 'Statut'}</Label>
                  <Select 
                    value={formData.status as string} 
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">{isRTL ? 'تخطيط' : 'Planification'}</SelectItem>
                      <SelectItem value="in_progress">{isRTL ? 'قيد التنفيذ' : 'En cours'}</SelectItem>
                      <SelectItem value="completed">{isRTL ? 'مكتمل' : 'Terminé'}</SelectItem>
                      <SelectItem value="on_hold">{isRTL ? 'متوقف' : 'En pause'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? 'التقدم (%)' : 'Progression (%)'}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress as string}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'الميزانية (دج)' : 'Budget (DZD)'}</Label>
                  <Input
                    type="number"
                    value={formData.budget as string}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'تاريخ البدء' : 'Date de début'}</Label>
                  <Input
                    type="date"
                    value={formData.start_date as string}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'تاريخ الانتهاء' : 'Date de fin'}</Label>
                  <Input
                    type="date"
                    value={formData.end_date as string}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* CAPTCHA for products (only for new items) */}
            {type === 'product' && !isEditMode && (
              <div className="sm:col-span-2">
                <Captcha locale={locale} onValidChange={handleCaptchaValidChange} />
              </div>
            )}

            {/* Image Upload */}
            <div className="sm:col-span-2 space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {isRTL ? 'صورة' : 'Image'}
              </Label>

              {formData.image ? (
                <div className="relative inline-block">
                  <img
                    src={formData.image as string}
                    alt="Uploaded"
                    className="w-full max-w-xs h-40 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 end-2 h-6 w-6 p-0"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-xs h-40 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

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
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isRTL ? 'جاري الرفع...' : 'Envoi...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {isRTL ? 'رفع صورة' : 'Télécharger'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex flex-wrap gap-2">
            {isEditMode && (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isRTL ? 'حذف' : 'Supprimer'}
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isRTL ? 'إلغاء' : 'Annuler'}
            </Button>
            <Button onClick={handleSubmit} disabled={saving || (type === 'product' && !isEditMode && !captchaValid)}>
              {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {isEditMode 
                ? (isRTL ? 'تحديث' : 'Mettre à jour')
                : type === 'product' 
                  ? (<>{isRTL ? <Send className="h-4 w-4 me-2" /> : null}{isRTL ? 'انشر' : 'Publier'}</>)
                  : (isRTL ? 'إضافة' : 'Ajouter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRTL ? 'تأكيد الحذف' : 'Confirmer la suppression'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL 
                ? 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Annuler'}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRTL ? 'حذف' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
