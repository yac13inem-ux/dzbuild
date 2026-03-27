'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { translations, Locale } from '@/lib/translations';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  Loader2,
  Home,
  ChevronLeft,
  Award,
  Briefcase,
  PenTool,
  HardHat,
  Boxes,
  Compass,
  Zap,
  Globe,
  Calendar,
  Users,
  Plus,
} from 'lucide-react';
import { AddItemDialog } from '@/components/add-item-dialog';

interface CompaniesSectionProps {
  onBack?: () => void;
}

// Company categories with icons and colors
const COMPANY_CATEGORIES = [
  { 
    id: 'BET', 
    icon: PenTool, 
    color: 'bg-violet-500',
    names: { ar: 'مكاتب دراسات', fr: "Bureaux d'Études", en: 'Engineering Offices' },
    descriptions: { ar: 'مكاتب الدراسات التقنية والهندسية', fr: "Bureaux d'études techniques", en: 'Technical engineering offices' }
  },
  { 
    id: 'CONSTRUCTION', 
    icon: HardHat, 
    color: 'bg-orange-500',
    names: { ar: 'شركات مقاولات', fr: 'Entreprises de Construction', en: 'Construction Companies' },
    descriptions: { ar: 'شركات البناء والمقاولات', fr: 'Entreprises de bâtiment', en: 'Building companies' }
  },
  { 
    id: 'MATERIALS', 
    icon: Boxes, 
    color: 'bg-amber-500',
    names: { ar: 'موردي مواد البناء', fr: 'Fournisseurs de Matériaux', en: 'Building Materials Suppliers' },
    descriptions: { ar: 'موردي مواد البناء والتشييد', fr: 'Fournisseurs de matériaux', en: 'Construction materials suppliers' }
  },
  { 
    id: 'SURVEY', 
    icon: Compass, 
    color: 'bg-cyan-500',
    names: { ar: 'مسح طوبوغرافي', fr: 'Topographie', en: 'Topographic Survey' },
    descriptions: { ar: 'مكاتب المسح الطوبوغرافي', fr: 'Cabinets de topographie', en: 'Topographic survey offices' }
  },
  { 
    id: 'ELECTRICAL_MECHANICAL', 
    icon: Zap, 
    color: 'bg-yellow-500',
    names: { ar: 'كهرباء وميكانيك', fr: 'Électromécanique', en: 'Electrical & Mechanical' },
    descriptions: { ar: 'شركات الكهرباء والميكانيك', fr: 'Entreprises électromécaniques', en: 'Electromechanical companies' }
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
  description?: string;
  company_type: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  wilaya?: string;
  founded_year?: number;
  specialties?: string[];
  is_verified: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  project_count: number;
}

export function CompaniesSection({ onBack }: CompaniesSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.companiesSection;
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch companies
  useEffect(() => {
    if (selectedCategory !== null) {
      fetchCompanies();
    }
  }, [selectedCategory, selectedWilaya]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('type', selectedCategory);
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
    if (selectedCategory !== null) {
      fetchCompanies();
    }
  };

  // Filter companies by search
  const filteredCompanies = companies.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(query) ||
        c.name_fr?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return COMPANY_CATEGORIES.find(c => c.id === categoryId);
  };

  // Company Detail View
  if (selectedCompany) {
    const categoryInfo = getCategoryInfo(selectedCompany.company_type);
    const IconComponent = categoryInfo?.icon || Building2;
    
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
        </div>
        
        {/* Company Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg text-white', categoryInfo?.color || 'bg-primary')}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{selectedCompany.name}</CardTitle>
                  {selectedCompany.is_verified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {locale === 'ar' ? 'موثق' : 'Vérifié'}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {locale === 'ar' ? categoryInfo?.names.ar : categoryInfo?.names.fr}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-2 text-yellow-500 fill-yellow-500" />
              <p className="font-bold text-lg">{selectedCompany.rating?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'تقييم' : 'Note'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Briefcase className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="font-bold text-lg">{selectedCompany.project_count || 0}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'مشروع' : 'Projets'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="font-bold text-lg">{selectedCompany.review_count || 0}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'تقييم' : 'Avis'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedCompany.city && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'الموقع' : 'Localisation'}</p>
                    <p className="font-medium">{selectedCompany.city} {selectedCompany.wilaya ? `(${selectedCompany.wilaya})` : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {selectedCompany.phone && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.phone[locale]}</p>
                    <a href={`tel:${selectedCompany.phone}`} className="font-medium text-primary hover:underline">
                      {selectedCompany.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {selectedCompany.email && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.email[locale]}</p>
                    <a href={`mailto:${selectedCompany.email}`} className="font-medium text-primary hover:underline">
                      {selectedCompany.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {selectedCompany.founded_year && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'سنة التأسيس' : 'Année de création'}</p>
                    <p className="font-medium">{selectedCompany.founded_year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Specialties */}
        {selectedCompany.specialties && selectedCompany.specialties.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {locale === 'ar' ? 'التخصصات' : 'Spécialités'}
              </h3>
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
              <a href={`mailto:${selectedCompany.email}`}>
                <Mail className="h-5 w-5" />
                {locale === 'ar' ? 'أرسل رسالة' : 'Envoyer un email'}
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Category Selection View
  if (selectedCategory === null) {
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
            onClick={() => setSelectedCategory('all')}
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
                    {locale === 'ar' ? 'تصفح جميع الشركات المسجلة' : 'Voir toutes les entreprises'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {COMPANY_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-xl text-white', category.color)}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {category.names[locale as 'ar' | 'fr' | 'en'] || category.names.en}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.descriptions[locale as 'ar' | 'fr' | 'en'] || category.descriptions.en}
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
  const currentCategory = COMPANY_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || Building2;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setSelectedCategory(null)} className="gap-2">
          <ChevronLeft className={isRTL ? "rotate-180" : ""} />
          {translations.backToList[locale]}
        </Button>
        {onBack && (
          <Button variant="default" onClick={onBack} className="gap-2">
            <Home className="h-4 w-4" />
            {translations.home[locale]}
          </Button>
        )}
        <Button className="gap-2 ml-auto" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة شركة' : 'Ajouter'}
        </Button>
      </div>

      {/* Category Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg text-white', currentCategory?.color || 'bg-primary')}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>
                {selectedCategory === 'all' 
                  ? (locale === 'ar' ? 'جميع الشركات' : 'Toutes les entreprises')
                  : currentCategory?.names[locale as 'ar' | 'fr' | 'en'] || currentCategory?.names.en
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
                placeholder={locale === 'ar' ? "ابحث عن شركة..." : "Rechercher une entreprise..."}
                className={isRTL ? "pr-10" : "pl-10"}
              />
            </div>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 min-w-[150px]"
            >
              <option value="">{t.allWilayas[locale]}</option>
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
            const catInfo = getCategoryInfo(company.company_type);
            const IconComp = catInfo?.icon || Building2;
            
            return (
              <Card 
                key={company.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => setSelectedCompany(company)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg text-white shrink-0', catInfo?.color || 'bg-primary')}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{company.name}</h3>
                        {company.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{company.city || '-'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-2">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {company.rating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {company.project_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Company Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        type="company"
        onSuccess={() => {
          fetchCompanies();
        }}
      />
    </div>
  );
}

export default CompaniesSection;
