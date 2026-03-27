'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';

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

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ItemType;
  onSuccess: () => void;
}

export function AddItemDialog({ open, onOpenChange, type, onSuccess }: AddItemDialogProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Record<string, string | number>>({
    // Common
    title: '',
    description: '',
    city: '',
    wilaya: '',
    phone: '',
    email: '',
    image: '',
    
    // Product specific
    category: 'materials',
    price: '',
    unit: 'وحدة',
    supplier_name: '',
    
    // Craftsman specific
    name: '',
    specialty: '',
    experience_years: '0',
    
    // Company specific
    company_type: 'BET',
    website: '',
    
    // Job specific
    company_name: '',
    salary_range: '',
    experience_level: 'entry',
    deadline: '',
    
    // Project specific
    status: 'planning',
    progress: '0',
    budget: '',
    start_date: '',
    end_date: '',
  });

  const resetForm = () => {
    setFormData({
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
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload/products', {
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
    } catch (error) {
      toast.error(isRTL ? 'خطأ في رفع الصورة' : 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let endpoint = '';
      let body: Record<string, unknown> = {};

      switch (type) {
        case 'product':
          endpoint = '/api/products';
          body = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            price: parseFloat(formData.price as string) || 0,
            unit: formData.unit,
            supplier_name: formData.supplier_name,
            supplier_phone: formData.phone,
            supplier_email: formData.email,
            city: formData.city,
            wilaya: formData.wilaya,
            images: formData.image ? [formData.image] : [],
          };
          break;

        case 'craftsman':
          endpoint = '/api/craftsmen';
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
          endpoint = '/api/companies';
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
          endpoint = '/api/jobs';
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
          endpoint = '/api/projects';
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
          };
          break;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isRTL ? 'تمت الإضافة بنجاح' : 'Ajouté avec succès');
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.error || (isRTL ? 'خطأ في الإضافة' : 'Erreur'));
      }
    } catch (error) {
      toast.error(isRTL ? 'خطأ في الإضافة' : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'product': return isRTL ? 'إضافة منتج' : 'Ajouter un produit';
      case 'craftsman': return isRTL ? 'تسجيل كحرفي' : "S'inscrire comme artisan";
      case 'company': return isRTL ? 'إضافة شركة' : 'Ajouter une entreprise';
      case 'job': return isRTL ? 'إضافة وظيفة' : 'Publier une offre';
      case 'project': return isRTL ? 'إضافة مشروع' : 'Ajouter un projet';
    }
  };

  const getCategories = () => {
    switch (type) {
      case 'product':
      case 'craftsman':
      case 'job':
        return type === 'craftsman' ? CRAFTSMAN_CATEGORIES : type === 'job' ? JOB_CATEGORIES : MARKET_CATEGORIES;
      case 'project':
        return PROJECT_CATEGORIES;
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
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
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getCategories().map((cat: { id: string; nameAr: string; nameFr: string }) => (
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
                value={formData.company_type} 
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isRTL ? 'أدخل الوصف' : 'Entrez la description'}
              className="min-h-[100px]"
            />
          </div>

          {/* City */}
          <div>
            <Label>{isRTL ? 'المدينة' : 'Ville'}</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder={isRTL ? 'المدينة' : 'Ville'}
            />
          </div>

          {/* Wilaya */}
          <div>
            <Label>{isRTL ? 'الولاية' : 'Wilaya'}</Label>
            <Select 
              value={formData.wilaya} 
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
              value={formData.phone}
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
              value={formData.email}
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
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>{isRTL ? 'الوحدة' : 'Unité'}</Label>
                <Select 
                  value={formData.unit} 
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
                  value={formData.supplier_name}
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
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
              <div>
                <Label>{isRTL ? 'سنوات الخبرة' : "Années d'expérience"}</Label>
                <Input
                  type="number"
                  value={formData.experience_years}
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
                value={formData.website}
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
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
              <div>
                <Label>{isRTL ? 'مستوى الخبرة' : "Niveau d'expérience"}</Label>
                <Select 
                  value={formData.experience_level} 
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
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  placeholder={isRTL ? 'مثال: 50000-70000 دج' : 'Ex: 50000-70000 DA'}
                />
              </div>
              <div>
                <Label>{isRTL ? 'آخر موعد' : 'Date limite'}</Label>
                <Input
                  type="date"
                  value={formData.deadline}
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
                  value={formData.status} 
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
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                />
              </div>
              <div>
                <Label>{isRTL ? 'الميزانية (دج)' : 'Budget (DZD)'}</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div>
                <Label>{isRTL ? 'تاريخ البدء' : 'Date de début'}</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>{isRTL ? 'تاريخ الانتهاء' : 'Date de fin'}</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </>
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
                  src={formData.image}
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

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRTL ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
            {isRTL ? 'إضافة' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
