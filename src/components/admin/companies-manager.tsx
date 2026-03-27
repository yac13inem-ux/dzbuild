'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Award,
  Star,
  Save,
  X,
  Loader2,
  RefreshCw,
  Upload,
  ExternalLink,
  CheckCircle,
  Image as ImageIcon,
  Briefcase,
  HardHat,
  Wrench,
  Zap,
  Ruler,
} from 'lucide-react';

// Company types configuration
const COMPANY_TYPES = {
  BET: { id: 'BET', nameAr: 'مكتب دراسات', nameFr: "Bureau d'Études", icon: Building2, color: 'bg-purple-500' },
  CONSTRUCTION: { id: 'CONSTRUCTION', nameAr: 'شركة مقاولات', nameFr: 'Construction', icon: HardHat, color: 'bg-orange-500' },
  MATERIALS: { id: 'MATERIALS', nameAr: 'مواد البناء', nameFr: 'Matériaux', icon: Wrench, color: 'bg-amber-500' },
  SURVEY: { id: 'SURVEY', nameAr: 'مسح طوبوغرافي', nameFr: 'Topographie', icon: Ruler, color: 'bg-cyan-500' },
  ELECTRICAL_MECHANICAL: { id: 'ELECTRICAL_MECHANICAL', nameAr: 'كهرباء وميكانيك', nameFr: 'Électromécanique', icon: Zap, color: 'bg-yellow-500' },
};

// Algerian wilayas (48)
const WILAYAS = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدينة', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان',
];

// Employee count ranges
const EMPLOYEE_RANGES = [
  { value: '1-10', labelAr: '1-10 موظف', labelFr: '1-10 employés' },
  { value: '11-50', labelAr: '11-50 موظف', labelFr: '11-50 employés' },
  { value: '51-200', labelAr: '51-200 موظف', labelFr: '51-200 employés' },
  { value: '200+', labelAr: 'أكثر من 200 موظف', labelFr: 'Plus de 200 employés' },
];

interface Company {
  id: string;
  name: string;
  name_fr?: string;
  description?: string;
  description_fr?: string;
  company_type: string;
  logo_url?: string;
  cover_image_url?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  fax?: string;
  website?: string;
  address?: string;
  city?: string;
  wilaya?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  registration_number?: string;
  tax_id?: string;
  capital?: number;
  founded_year?: number;
  employee_count_range?: string;
  specialties?: string[];
  services?: string[];
  certifications?: string[];
  rating: number;
  review_count: number;
  project_count: number;
  views_count: number;
  is_verified: boolean;
  is_active: boolean;
  is_featured: boolean;
  featured_until?: string;
  created_at: string;
}

const emptyFormData = {
  name: '',
  name_fr: '',
  description: '',
  description_fr: '',
  company_type: 'BET',
  logo_url: '',
  cover_image_url: '',
  email: '',
  phone: '',
  phone2: '',
  fax: '',
  website: '',
  address: '',
  city: '',
  wilaya: '',
  postal_code: '',
  registration_number: '',
  tax_id: '',
  capital: '',
  founded_year: '',
  employee_count_range: '',
  specialties: '',
  services: '',
  certifications: '',
};

export function CompaniesManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'logo' | 'cover'>('logo');
  
  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterWilaya, setFilterWilaya] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/companies?';
      if (filterType) url += `type=${filterType}&`;
      if (filterWilaya) url += `wilaya=${filterWilaya}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingCompany(null);
    setShowForm(false);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      name_fr: company.name_fr || '',
      description: company.description || '',
      description_fr: company.description_fr || '',
      company_type: company.company_type || 'BET',
      logo_url: company.logo_url || '',
      cover_image_url: company.cover_image_url || '',
      email: company.email || '',
      phone: company.phone || '',
      phone2: company.phone2 || '',
      fax: company.fax || '',
      website: company.website || '',
      address: company.address || '',
      city: company.city || '',
      wilaya: company.wilaya || '',
      postal_code: company.postal_code || '',
      registration_number: company.registration_number || '',
      tax_id: company.tax_id || '',
      capital: company.capital?.toString() || '',
      founded_year: company.founded_year?.toString() || '',
      employee_count_range: company.employee_count_range || '',
      specialties: company.specialties?.join(', ') || '',
      services: company.services?.join(', ') || '',
      certifications: company.certifications?.join(', ') || '',
    });
    setShowForm(true);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(isRTL ? 'نوع الملف غير مدعوم' : 'Invalid file type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(isRTL ? 'حجم الملف كبير جداً. الحد الأقصى 5MB' : 'File too large. Max 5MB');
      return;
    }

    setUploading(true);
    setUploadType(type);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.success && data.url) {
        if (type === 'logo') {
          setFormData(prev => ({ ...prev, logo_url: data.url }));
        } else {
          setFormData(prev => ({ ...prev, cover_image_url: data.url }));
        }
      } else {
        alert(data.error || (isRTL ? 'فشل تحميل الصورة' : 'Upload failed'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(isRTL ? 'حدث خطأ أثناء التحميل' : 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert(isRTL ? 'يرجى إدخال اسم الشركة' : 'Company name is required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/companies';
      const method = editingCompany ? 'PUT' : 'POST';
      
      const body = {
        ...(editingCompany ? { id: editingCompany.id } : {}),
        name: formData.name,
        name_fr: formData.name_fr,
        description: formData.description,
        description_fr: formData.description_fr,
        company_type: formData.company_type,
        logo_url: formData.logo_url,
        cover_image_url: formData.cover_image_url,
        email: formData.email,
        phone: formData.phone,
        phone2: formData.phone2,
        fax: formData.fax,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        wilaya: formData.wilaya,
        postal_code: formData.postal_code,
        registration_number: formData.registration_number,
        tax_id: formData.tax_id,
        capital: formData.capital ? parseFloat(formData.capital) : null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        employee_count_range: formData.employee_count_range,
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
        services: formData.services ? formData.services.split(',').map(s => s.trim()) : [],
        certifications: formData.certifications ? formData.certifications.split(',').map(s => s.trim()) : [],
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        await fetchCompanies();
        resetForm();
      } else {
        alert(data.error || (isRTL ? 'حدث خطأ' : 'Error occurred'));
      }
    } catch (error) {
      console.error('Error saving company:', error);
      alert(isRTL ? 'حدث خطأ في الحفظ' : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه الشركة؟' : 'Are you sure?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/companies?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        await fetchCompanies();
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const toggleActive = async (company: Company) => {
    try {
      await fetch('/api/admin/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: company.id,
          is_active: !company.is_active,
        }),
      });
      await fetchCompanies();
    } catch (error) {
      console.error('Error toggling company:', error);
    }
  };

  const toggleVerified = async (company: Company) => {
    try {
      await fetch('/api/admin/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: company.id,
          is_verified: !company.is_verified,
        }),
      });
      await fetchCompanies();
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const toggleFeatured = async (company: Company) => {
    try {
      await fetch('/api/admin/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: company.id,
          is_featured: !company.is_featured,
        }),
      });
      await fetchCompanies();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  // Filter companies by search
  const filteredCompanies = companies.filter(c => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isRTL ? 'إدارة الشركات' : 'Companies Management'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRTL ? `${companies.length} شركة` : `${companies.length} companies`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCompanies}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {isRTL ? 'شركة جديدة' : 'New Company'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Input
            placeholder={isRTL ? "بحث عن شركة..." : "Search companies..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 rounded-md border bg-background px-3"
        >
          <option value="">{isRTL ? "كل الأنواع" : "All types"}</option>
          {Object.entries(COMPANY_TYPES).map(([key, type]) => (
            <option key={key} value={key}>{type.nameAr}</option>
          ))}
        </select>
        <select
          value={filterWilaya}
          onChange={(e) => setFilterWilaya(e.target.value)}
          className="h-10 rounded-md border bg-background px-3"
        >
          <option value="">{isRTL ? "كل الولايات" : "All wilayas"}</option>
          {WILAYAS.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
        <Button variant="outline" onClick={fetchCompanies}>
          {isRTL ? 'بحث' : 'Search'}
        </Button>
      </div>

      {/* Company Form */}
      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editingCompany 
                  ? (isRTL ? 'تعديل الشركة' : 'Edit Company')
                  : (isRTL ? 'شركة جديدة' : 'New Company')}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isRTL ? 'اسم الشركة' : 'Company name'}
                />
              </div>

              {/* Name Fr */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'اسم الشركة (فرنسي)' : 'Company Name (French)'}
                </label>
                <Input
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  placeholder="Nom de l'entreprise"
                />
              </div>

              {/* Company Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'نوع الشركة' : 'Company Type'} *
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                  className="w-full h-10 rounded-md border bg-background px-3"
                >
                  {Object.entries(COMPANY_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>{type.nameAr} - {type.nameFr}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {isRTL ? 'الهاتف' : 'Phone'}
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0XX XX XX XX"
                />
              </div>

              {/* Phone 2 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'هاتف ثاني' : 'Phone 2'}
                </label>
                <Input
                  value={formData.phone2}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                  placeholder="0XX XX XX XX"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {isRTL ? 'الموقع الإلكتروني' : 'Website'}
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Wilaya */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {isRTL ? 'الولاية' : 'Wilaya'}
                </label>
                <select
                  value={formData.wilaya}
                  onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                  className="w-full h-10 rounded-md border bg-background px-3"
                >
                  <option value="">{isRTL ? "اختر الولاية" : "Select wilaya"}</option>
                  {WILAYAS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'المدينة' : 'City'}
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={isRTL ? "المدينة" : "City"}
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'العنوان' : 'Address'}
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={isRTL ? "العنوان الكامل" : "Full address"}
                />
              </div>

              {/* Registration Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'رقم السجل التجاري' : 'Registration Number'}
                </label>
                <Input
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  placeholder="RC: ..."
                />
              </div>

              {/* Tax ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'الرقم الجبائي' : 'Tax ID (NIF)'}
                </label>
                <Input
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder="NIF: ..."
                />
              </div>

              {/* Founded Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'سنة التأسيس' : 'Founded Year'}
                </label>
                <Input
                  type="number"
                  value={formData.founded_year}
                  onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                  placeholder="2020"
                />
              </div>

              {/* Employee Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {isRTL ? 'عدد الموظفين' : 'Employee Count'}
                </label>
                <select
                  value={formData.employee_count_range}
                  onChange={(e) => setFormData({ ...formData, employee_count_range: e.target.value })}
                  className="w-full h-10 rounded-md border bg-background px-3"
                >
                  <option value="">{isRTL ? "اختر" : "Select"}</option>
                  {EMPLOYEE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.labelAr}</option>
                  ))}
                </select>
              </div>

              {/* Capital */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'رأس المال (دج)' : 'Capital (DZD)'}
                </label>
                <Input
                  type="number"
                  value={formData.capital}
                  onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                  placeholder="0"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {isRTL ? 'شعار الشركة' : 'Company Logo'}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUploadType('logo');
                      document.getElementById('logo-upload')?.click();
                    }}
                    disabled={uploading}
                  >
                    {uploading && uploadType === 'logo' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'صورة الغلاف' : 'Cover Image'}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUploadType('cover');
                      document.getElementById('cover-upload')?.click();
                    }}
                    disabled={uploading}
                  >
                    {uploading && uploadType === 'cover' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium">
                  {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2"
                  placeholder={isRTL ? 'وصف الشركة...' : 'Company description...'}
                />
              </div>

              {/* Description Fr */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium">
                  {isRTL ? 'الوصف (فرنسي)' : 'Description (French)'}
                </label>
                <textarea
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2"
                  placeholder="Description de l'entreprise..."
                />
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'التخصصات (مفصولة بفواصل)' : 'Specialties (comma separated)'}
                </label>
                <Input
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder={isRTL ? "بناء، ترميم، تشطيب" : "construction, renovation, finishing"}
                />
              </div>

              {/* Services */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'الخدمات (مفصولة بفواصل)' : 'Services (comma separated)'}
                </label>
                <Input
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder={isRTL ? "دراسات، متابعة، استشارات" : "studies, supervision, consulting"}
                />
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {isRTL ? 'الشهادات (مفصولة بفواصل)' : 'Certifications (comma separated)'}
                </label>
                <Input
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  placeholder={isRTL ? "ISO 9001, ISO 14001" : "ISO 9001, ISO 14001"}
                />
              </div>

              {/* Image Preview */}
              {(formData.logo_url || formData.cover_image_url) && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'معاينة الصور' : 'Image Preview'}
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    {formData.logo_url && (
                      <div className="border rounded-lg p-2 bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'الشعار' : 'Logo'}</p>
                        <img 
                          src={formData.logo_url} 
                          alt="Logo preview" 
                          className="w-24 h-24 object-contain rounded"
                        />
                      </div>
                    )}
                    {formData.cover_image_url && (
                      <div className="border rounded-lg p-2 bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'الغلاف' : 'Cover'}</p>
                        <img 
                          src={formData.cover_image_url} 
                          alt="Cover preview" 
                          className="w-48 h-24 object-cover rounded"
                        />
                      </div>
                    )}
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

      {/* Companies List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="space-y-3">
          {filteredCompanies.map((company) => {
            const typeInfo = COMPANY_TYPES[company.company_type as keyof typeof COMPANY_TYPES] || COMPANY_TYPES.BET;
            
            return (
              <Card key={company.id} className={cn(
                'overflow-hidden',
                !company.is_active && 'opacity-60',
                company.is_featured && 'border-amber-500 border-2'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="shrink-0">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className={cn('w-16 h-16 rounded-lg flex items-center justify-center text-white', typeInfo.color)}>
                          <typeInfo.icon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {company.name}
                            {company.is_verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {company.is_featured && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {typeInfo.nameAr}
                            </Badge>
                            {company.wilaya && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.wilaya}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={company.is_active ? 'default' : 'secondary'}>
                            {company.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'متوقف' : 'Inactive')}
                          </Badge>
                        </div>
                      </div>
                      
                      {company.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {company.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {company.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {company.phone}
                          </span>
                        )}
                        {company.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {company.email}
                          </span>
                        )}
                        {company.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {company.rating.toFixed(1)} ({company.review_count})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleActive(company)}
                        title={company.is_active ? (isRTL ? 'إيقاف' : 'Deactivate') : (isRTL ? 'تفعيل' : 'Activate')}
                      >
                        {company.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleVerified(company)}
                        title={company.is_verified ? (isRTL ? 'إلغاء التحقق' : 'Unverify') : (isRTL ? 'تحقق' : 'Verify')}
                      >
                        <CheckCircle className={cn('h-4 w-4', company.is_verified && 'text-green-500')} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleFeatured(company)}
                        title={company.is_featured ? (isRTL ? 'إزالة التمييز' : 'Unfeature') : (isRTL ? 'تمييز' : 'Feature')}
                      >
                        <Star className={cn('h-4 w-4', company.is_featured && 'text-amber-500 fill-amber-500')} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {isRTL ? 'لا توجد شركات حالياً' : 'No companies yet'}
          </p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {isRTL ? 'أضف شركة جديدة' : 'Add New Company'}
          </Button>
        </div>
      )}
    </div>
  );
}
