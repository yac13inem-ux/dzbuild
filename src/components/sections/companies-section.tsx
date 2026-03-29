'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Captcha, useCaptcha } from '@/components/shared/captcha';
import { translations } from '@/lib/translations';
import { toast } from 'sonner';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Home,
  ChevronLeft,
  Globe,
  Calendar,
  Award,
  Plus,
  Edit,
  Trash2,
  Send,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

interface CompaniesSectionProps {
  onBack?: () => void;
}

// Company types with icons and colors
const COMPANY_TYPES = [
  { 
    id: 'BET', 
    icon: Building2, 
    color: 'bg-blue-500',
    names: { ar: 'مكتب دراسات', fr: "Bureau d'Études", en: 'Engineering Office' },
    descriptions: { ar: 'مكاتب هندسية متخصصة في التصميم والدراسات التقنية', fr: "Bureaux d'études techniques", en: 'Engineering offices specialized in design' }
  },
  { 
    id: 'CONSTRUCTION', 
    icon: Briefcase, 
    color: 'bg-orange-500',
    names: { ar: 'شركة مقاولات', fr: 'Entreprise de Construction', en: 'Construction Company' },
    descriptions: { ar: 'شركات متخصصة في أعمال البناء والتشييد', fr: 'Entreprises de construction', en: 'Construction companies' }
  },
  { 
    id: 'MATERIALS', 
    icon: Building2, 
    color: 'bg-amber-500',
    names: { ar: 'مورد مواد بناء', fr: 'Fournisseur de Matériaux', en: 'Materials Supplier' },
    descriptions: { ar: 'موردين ومصنعي مواد البناء', fr: 'Fournisseurs de matériaux', en: 'Building materials suppliers' }
  },
  { 
    id: 'SURVEY', 
    icon: MapPin, 
    color: 'bg-green-500',
    names: { ar: 'مسح طوبوغرافي', fr: 'Cabinet de Topographie', en: 'Survey Office' },
    descriptions: { ar: 'مكاتب متخصصة في المسح والخرائط', fr: 'Cabinets de topographie', en: 'Survey and mapping offices' }
  },
  { 
    id: 'ELECTRICAL_MECHANICAL', 
    icon: Building2, 
    color: 'bg-yellow-500',
    names: { ar: 'كهرباء وميكانيك', fr: 'Électromécanique', en: 'Electrical & Mechanical' },
    descriptions: { ar: 'شركات متخصصة في التركيبات الكهربائية والميكانيكية', fr: 'Entreprises électromécaniques', en: 'Electromechanical companies' }
  },
];

// Wilayas
const WILAYAS = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'عين الدفلى', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'ميلة', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان'
];

interface Company {
  id: string;
  name: string;
  name_fr?: string;
  type: string;
  company_type?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  wilaya?: string;
  address?: string;
  logo?: string;
  specialties?: string[];
  founded_year?: number;
  is_verified?: boolean;
  is_featured?: boolean;
  rating?: number;
  review_count?: number;
}

export function CompaniesSection({ onBack }: CompaniesSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.companiesSection || {
    title: { ar: 'شركات البناء', fr: 'Entreprises de Construction', en: 'Construction Companies' },
    subtitle: { ar: 'اكتشف شركات البناء المعتمدة', fr: 'Découvrez les entreprises certifiées', en: 'Discover certified companies' },
    noCompanies: { ar: 'لا توجد شركات مسجلة', fr: 'Aucune entreprise', en: 'No companies registered' },
    searchCompany: { ar: 'ابحث عن شركة...', fr: 'Rechercher...', en: 'Search company...' },
    companiesFound: { ar: 'شركة', fr: 'entreprises', en: 'companies' },
  };
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Dialogs
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [posting, setPosting] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Captcha
  const { isValid: captchaValid, handleValidChange } = useCaptcha();
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('BET');
  const [formDescription, setFormDescription] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formWilaya, setFormWilaya] = useState('');

  // Edit form
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('BET');
  const [editDescription, setEditDescription] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editWilaya, setEditWilaya] = useState('');

  // Fetch companies
  useEffect(() => {
    if (selectedType !== null) {
      fetchCompanies();
    }
  }, [selectedType, selectedWilaya]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType && selectedType !== 'all') {
        params.append('type', selectedType);
      }
      if (selectedWilaya) {
        params.append('wilaya', selectedWilaya);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const res = await fetch(`/api/companies?${params.toString()}`);
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (selectedType !== null) {
      fetchCompanies();
    }
  };

  const filteredCompanies = companies.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(query) ||
        c.name_fr?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getTypeInfo = (typeId: string) => {
    return COMPANY_TYPES.find(t => t.id === typeId) || COMPANY_TYPES[0];
  };

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormType('BET');
    setFormDescription('');
    setFormPhone('');
    setFormEmail('');
    setFormWebsite('');
    setFormCity('');
    setFormWilaya('');
  };

  // Handle create company
  const handleCreateCompany = async () => {
    if (!formName.trim() || !captchaValid) {
      toast.error(isRTL ? 'يرجى ملء الاسم والتحقق' : 'Please fill name and verify');
      return;
    }

    setPosting(true);
    try {
      const res = await fetch('/api/guest/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          company_type: formType,
          description: formDescription.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          website: formWebsite.trim(),
          city: formCity.trim(),
          wilaya: formWilaya,
        }),
      });

      const data = await res.json();

      if (res.ok && data.company) {
        setCompanies([data.company, ...companies]);
        setShowNewDialog(false);
        resetForm();
        toast.success(isRTL ? 'تمت الإضافة بنجاح!' : 'Added successfully!');
      } else {
        toast.error(data.error || (isRTL ? 'فشل الإضافة' : 'Failed to add'));
      }
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(isRTL ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setPosting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (company: Company) => {
    setEditCompany(company);
    setEditName(company.name);
    setEditType(company.type || company.company_type || 'BET');
    setEditDescription(company.description || '');
    setEditPhone(company.phone || '');
    setEditEmail(company.email || '');
    setEditWebsite(company.website || '');
    setEditCity(company.city || '');
    setEditWilaya(company.wilaya || '');
    setShowEditDialog(true);
  };

  // Handle edit company
  const handleEditCompany = async () => {
    if (!editCompany || !editName.trim()) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/guest/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editCompany.id,
          name: editName.trim(),
          company_type: editType,
          description: editDescription.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          website: editWebsite.trim(),
          city: editCity.trim(),
          wilaya: editWilaya,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCompanies(companies.map(c => 
          c.id === editCompany.id ? { 
            ...c, 
            name: editName, 
            type: editType, 
            description: editDescription,
            phone: editPhone,
            email: editEmail,
            website: editWebsite,
            city: editCity,
            wilaya: editWilaya,
          } : c
        ));
        setShowEditDialog(false);
        setEditCompany(null);
        toast.success(isRTL ? 'تم التعديل بنجاح' : 'Updated successfully');
      } else {
        toast.error(data.error || (isRTL ? 'فشل التعديل' : 'Failed to update'));
      }
    } catch (error) {
      console.error('Error editing company:', error);
      toast.error(isRTL ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete company
  const handleDeleteCompany = async () => {
    if (!editCompany) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/guest/companies?id=${editCompany.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setCompanies(companies.filter(c => c.id !== editCompany.id));
        setShowDeleteDialog(false);
        setEditCompany(null);
        setSelectedCompany(null);
        toast.success(isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully');
      } else {
        toast.error(data.error || (isRTL ? 'فشل الحذف' : 'Failed to delete'));
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error(isRTL ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setProcessing(false);
    }
  };

  // Company Detail View
  if (selectedCompany) {
    const typeInfo = getTypeInfo(selectedCompany.type || selectedCompany.company_type || 'BET');
    const IconComponent = typeInfo?.icon || Building2;
    
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedCompany(null)} className="gap-2">
            <ChevronLeft className={isRTL ? "rotate-180" : ""} />
            {translations.backToList[locale]}
          </Button>
          {onBack && (
            <Button variant="default" onClick={onBack} className="gap-2">
              <Home className="h-4 w-4" />
              {translations.home[locale]}
            </Button>
          )}
          
          {/* Edit/Delete Actions */}
          <div className="ms-auto flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditDialog(selectedCompany)}>
              <Edit className="h-4 w-4" />
              {isRTL ? 'تعديل' : 'Modifier'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50" 
              onClick={() => {
                setEditCompany(selectedCompany);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              {isRTL ? 'حذف' : 'Supprimer'}
            </Button>
          </div>
        </div>

        {/* Company Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg text-white', typeInfo?.color || 'bg-primary')}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{selectedCompany.name}</CardTitle>
                  {selectedCompany.is_verified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {locale === 'ar' ? 'موثق' : 'Vérifié'}
                    </Badge>
                  )}
                  {selectedCompany.is_featured && (
                    <Badge className="bg-amber-500 text-white">
                      <Award className="h-3 w-3 mr-1" />
                      {locale === 'ar' ? 'مميز' : 'Premium'}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {typeInfo?.names[locale as 'ar' | 'fr' | 'en'] || typeInfo?.names.en}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Description */}
        {selectedCompany.description && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </h3>
              <p className="text-muted-foreground">{selectedCompany.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedCompany.founded_year && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'سنة التأسيس' : 'Année de création'}</p>
                    <p className="font-medium">{selectedCompany.founded_year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-100">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'الموقع' : 'Localisation'}</p>
                  <p className="font-medium">{selectedCompany.city || '-'} {selectedCompany.wilaya ? `(${selectedCompany.wilaya})` : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {selectedCompany.website && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'الموقع الإلكتروني' : 'Site web'}</p>
                    <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      {selectedCompany.website.replace(/^https?:\/\//, '').substring(0, 30)}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Specialties */}
        {selectedCompany.specialties && selectedCompany.specialties.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">{locale === 'ar' ? 'التخصصات' : 'Spécialités'}</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.specialties.map((s, i) => (
                  <Badge key={i} variant="secondary">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {selectedCompany.phone && (
            <Button size="lg" className="flex-1 gap-2" asChild>
              <a href={`tel:${selectedCompany.phone}`}>
                <Phone className="h-5 w-5" />
                {translations.callNow[locale]}
              </a>
            </Button>
          )}
          {selectedCompany.email && (
            <Button size="lg" variant="outline" className="flex-1 gap-2" asChild>
              <a href={`mailto:${selectedCompany.email}?subject=${encodeURIComponent(selectedCompany.name)}`}>
                <Mail className="h-5 w-5" />
                {locale === 'ar' ? 'أرسل رسالة' : 'Envoyer un email'}
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Type Selection View
  if (selectedType === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {t.title[locale]}
            </h1>
            <p className="text-muted-foreground">
              {t.subtitle[locale]}
            </p>
          </div>
          {onBack && (
            <Button variant="default" onClick={onBack} className="gap-2">
              <Home className="h-4 w-4" />
              {translations.home[locale]}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* All Companies Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setSelectedType('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white bg-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {locale === 'ar' ? 'جميع الشركات' : 'Toutes les entreprises'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {locale === 'ar' ? 'تصفح جميع الشركات' : 'Voir toutes les entreprises'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Type Cards */}
          {COMPANY_TYPES.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={type.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-xl text-white', type.color)}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {type.names[locale as 'ar' | 'fr' | 'en'] || type.names.en}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.descriptions[locale as 'ar' | 'fr' | 'en'] || type.descriptions.en}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Companies List View
  const currentType = COMPANY_TYPES.find(t => t.id === selectedType);
  const TypeIcon = currentType?.icon || Building2;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setSelectedType(null)} className="gap-2">
          <ChevronLeft className={isRTL ? "rotate-180" : ""} />
          {translations.backToList[locale]}
        </Button>
        {onBack && (
          <Button variant="default" onClick={onBack} className="gap-2">
            <Home className="h-4 w-4" />
            {translations.home[locale]}
          </Button>
        )}
        <Button className="gap-2 ml-auto" onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة شركة' : 'Ajouter'}
        </Button>
      </div>

      {/* Type Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg text-white', currentType?.color || 'bg-primary')}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>
                {selectedType === 'all' 
                  ? (locale === 'ar' ? 'جميع الشركات' : 'Toutes les entreprises')
                  : currentType?.names[locale as 'ar' | 'fr' | 'en'] || currentType?.names.en
                }
              </CardTitle>
              <CardDescription>
                {filteredCompanies.length} {t.companiesFound[locale]}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t.searchCompany[locale]}
                className={isRTL ? "pr-10" : "pl-10"}
              />
            </div>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 min-w-[150px]"
            >
              <option value="">{locale === 'ar' ? 'كل الولايات' : 'Toutes les wilayas'}</option>
              {WILAYAS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              {translations.search[locale]}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading / Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t.noCompanies[locale]}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => {
            const typeInfo = getTypeInfo(company.type || company.company_type || 'BET');
            const IconComp = typeInfo?.icon || Building2;
            
            return (
              <Card 
                key={company.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => setSelectedCompany(company)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg text-white shrink-0', typeInfo?.color || 'bg-primary')}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{company.name}</h3>
                        {company.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {typeInfo?.names[locale as 'ar' | 'fr' | 'en'] || typeInfo?.names.en}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{company.city || '-'} {company.wilaya ? `(${company.wilaya})` : ''}</span>
                      </div>
                      {company.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          <span dir="ltr">{company.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Company Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {locale === 'ar' ? 'إضافة شركة جديدة' : 'Ajouter une entreprise'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{locale === 'ar' ? 'اسم الشركة *' : 'Nom de l\'entreprise *'}</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={locale === 'ar' ? 'أدخل اسم الشركة' : 'Entrez le nom'}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{locale === 'ar' ? 'نوع الشركة' : 'Type d\'entreprise'}</Label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
              >
                {COMPANY_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.names[locale as 'ar' | 'fr' | 'en']}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={locale === 'ar' ? 'وصف الشركة...' : 'Description...'}
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ar' ? 'الهاتف' : 'Téléphone'}</Label>
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0XXX XXX XXX"
                  dir="ltr"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@example.com"
                  dir="ltr"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'الموقع الإلكتروني' : 'Site web'}</Label>
              <Input
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
                placeholder="https://example.com"
                dir="ltr"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ar' ? 'المدينة' : 'Ville'}</Label>
                <Input
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{locale === 'ar' ? 'الولاية' : 'Wilaya'}</Label>
                <select
                  value={formWilaya}
                  onChange={(e) => setFormWilaya(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                >
                  <option value="">{locale === 'ar' ? 'اختر...' : 'Choisir...'}</option>
                  {WILAYAS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
            <Captcha locale={locale} onValidChange={handleValidChange} />
            <Button
              onClick={handleCreateCompany}
              disabled={!formName.trim() || !captchaValid || posting}
              className="w-full gap-2"
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {locale === 'ar' ? 'نشر' : 'Publier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {locale === 'ar' ? 'تعديل الشركة' : 'Modifier l\'entreprise'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{locale === 'ar' ? 'اسم الشركة' : 'Nom de l\'entreprise'}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{locale === 'ar' ? 'نوع الشركة' : 'Type'}</Label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
              >
                {COMPANY_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.names[locale as 'ar' | 'fr' | 'en']}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ar' ? 'الهاتف' : 'Téléphone'}</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} dir="ltr" className="mt-1" />
              </div>
              <div>
                <Label>{locale === 'ar' ? 'البريد' : 'Email'}</Label>
                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} dir="ltr" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'الموقع الإلكتروني' : 'Site web'}</Label>
              <Input value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} dir="ltr" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ar' ? 'المدينة' : 'Ville'}</Label>
                <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{locale === 'ar' ? 'الولاية' : 'Wilaya'}</Label>
                <select
                  value={editWilaya}
                  onChange={(e) => setEditWilaya(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                >
                  <option value="">{locale === 'ar' ? 'اختر...' : 'Choisir...'}</option>
                  {WILAYAS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
                {locale === 'ar' ? 'إلغاء' : 'Annuler'}
              </Button>
              <Button className="flex-1" onClick={handleEditCompany} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {locale === 'ar' ? 'تحديث' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{locale === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'ar' 
                ? 'هل أنت متأكد من حذف هذه الشركة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{locale === 'ar' ? 'إلغاء' : 'Annuler'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {locale === 'ar' ? 'حذف' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CompaniesSection;
