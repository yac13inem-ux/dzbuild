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
  User,
  Search,
  MapPin,
  Phone,
  Star,
  CheckCircle,
  Loader2,
  Home,
  ChevronLeft,
  Briefcase,
  Camera,
  Hammer,
  Droplets,
  Zap,
  Paintbrush,
  TreePine,
  Grid3X3,
  Flame,
  Wrench,
  Clock,
  Plus,
} from 'lucide-react';
import { AddItemDialog } from '@/components/add-item-dialog';

interface CraftsmenSectionProps {
  onBack?: () => void;
}

// Craftsman categories with icons and colors
const CRAFTSMAN_CATEGORIES = [
  { 
    id: 'builder', 
    icon: Hammer, 
    color: 'bg-amber-500',
    names: { ar: 'بناء', fr: 'Maçonnerie', en: 'Masonry' },
    descriptions: { ar: 'بنائون ومقاولون صغار', fr: 'Maçons et petits entrepreneurs', en: 'Masons and small contractors' }
  },
  { 
    id: 'plumber', 
    icon: Droplets, 
    color: 'bg-blue-500',
    names: { ar: 'سباكة', fr: 'Plomberie', en: 'Plumbing' },
    descriptions: { ar: 'سباكين لتركيب وصيانة المواسير', fr: 'Plombiers pour installation et réparation', en: 'Plumbers for installation and repair' }
  },
  { 
    id: 'electrician', 
    icon: Zap, 
    color: 'bg-yellow-500',
    names: { ar: 'كهربائي', fr: 'Électricité', en: 'Electrical' },
    descriptions: { ar: 'فنيين كهرباء منزلية وصناعية', fr: 'Électriciens domestiques et industriels', en: 'Domestic and industrial electricians' }
  },
  { 
    id: 'painter', 
    icon: Paintbrush, 
    color: 'bg-purple-500',
    names: { ar: 'دهان', fr: 'Peinture', en: 'Painting' },
    descriptions: { ar: 'دهانين للمباني والمنازل', fr: 'Peintres en bâtiment', en: 'Building painters' }
  },
  { 
    id: 'carpenter', 
    icon: TreePine, 
    color: 'bg-green-600',
    names: { ar: 'نجارة', fr: 'Menuiserie', en: 'Carpentry' },
    descriptions: { ar: 'نجارين للأبواب والنوافذ والأثاث', fr: 'Menuisiers pour portes et meubles', en: 'Carpenters for doors and furniture' }
  },
  { 
    id: 'tiler', 
    icon: Grid3X3, 
    color: 'bg-cyan-500',
    names: { ar: 'بلاط', fr: 'Carrelage', en: 'Tiling' },
    descriptions: { ar: 'بلاطين للأرضيات والجدران', fr: 'Carreleurs pour sols et murs', en: 'Tilers for floors and walls' }
  },
  { 
    id: 'welder', 
    icon: Flame, 
    color: 'bg-orange-600',
    names: { ar: 'لحام', fr: 'Soudure', en: 'Welding' },
    descriptions: { ar: 'لحامين للحديد والألمنيوم', fr: 'Soudeurs fer et aluminium', en: 'Iron and aluminum welders' }
  },
  { 
    id: 'other', 
    icon: Wrench, 
    color: 'bg-gray-500',
    names: { ar: 'أخرى', fr: 'Autre', en: 'Other' },
    descriptions: { ar: 'حرف متنوعة أخرى', fr: 'Autres métiers', en: 'Other trades' }
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

interface Craftsman {
  id: string;
  name: string;
  category: string;
  specialty?: string;
  city?: string;
  wilaya?: string;
  phone?: string;
  email?: string;
  experience_years?: number;
  bio?: string;
  images?: string[];
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  review_count: number;
}

export function CraftsmenSection({ onBack }: CraftsmenSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.craftsmenSection;
  
  const [craftsmen, setCraftsmen] = useState<Craftsman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCraftsman, setSelectedCraftsman] = useState<Craftsman | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch craftsmen
  useEffect(() => {
    if (selectedCategory !== null) {
      fetchCraftsmen();
    }
  }, [selectedCategory, selectedWilaya]);

  const fetchCraftsmen = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedWilaya) {
        params.append('wilaya', selectedWilaya);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const res = await fetch(`/api/craftsmen?${params.toString()}`);
      const data = await res.json();
      setCraftsmen(data.craftsmen || []);
    } catch (error) {
      console.error('Error fetching craftsmen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (selectedCategory !== null) {
      fetchCraftsmen();
    }
  };

  const filteredCraftsmen = craftsmen.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(query) ||
        c.specialty?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getCategoryInfo = (categoryId: string) => {
    return CRAFTSMAN_CATEGORIES.find(c => c.id === categoryId) || CRAFTSMAN_CATEGORIES[7];
  };

  // Craftsman Detail View
  if (selectedCraftsman) {
    const categoryInfo = getCategoryInfo(selectedCraftsman.category);
    const IconComponent = categoryInfo?.icon || User;
    
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedCraftsman(null)} className="gap-2">
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

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg text-white', categoryInfo?.color || 'bg-primary')}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{selectedCraftsman.name}</CardTitle>
                  {selectedCraftsman.is_verified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {locale === 'ar' ? 'موثق' : 'Vérifié'}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {categoryInfo?.names[locale as 'ar' | 'fr' | 'en'] || categoryInfo?.names.en}
                  {selectedCraftsman.specialty && ` - ${selectedCraftsman.specialty}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Availability Badge */}
        {!selectedCraftsman.is_available && (
          <Badge variant="destructive" className="w-fit">
            <Clock className="h-3 w-3 mr-1" />
            {locale === 'ar' ? 'غير متاح حالياً' : 'Non disponible'}
          </Badge>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-2 text-yellow-500 fill-yellow-500" />
              <p className="font-bold text-lg">{selectedCraftsman.rating?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'تقييم' : 'Note'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Briefcase className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="font-bold text-lg">{selectedCraftsman.experience_years || 0}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'سنوات خبرة' : "Ans d'exp."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="font-bold text-lg">{selectedCraftsman.review_count || 0}</p>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'تقييم' : 'Avis'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'الموقع' : 'Localisation'}</p>
                  <p className="font-medium">{selectedCraftsman.city || '-'} {selectedCraftsman.wilaya ? `(${selectedCraftsman.wilaya})` : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {selectedCraftsman.phone && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-green-100">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'الهاتف' : 'Téléphone'}</p>
                    <a href={`tel:${selectedCraftsman.phone}`} className="font-medium text-primary hover:underline">
                      {selectedCraftsman.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bio */}
        {selectedCraftsman.bio && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">{selectedCraftsman.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {selectedCraftsman.images && selectedCraftsman.images.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                {locale === 'ar' ? 'صور الأعمال' : 'Photos des réalisations'}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {selectedCraftsman.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Button */}
        {selectedCraftsman.phone && selectedCraftsman.is_available && (
          <Button size="lg" className="w-full gap-2" asChild>
            <a href={`tel:${selectedCraftsman.phone}`}>
              <Phone className="h-5 w-5" />
              {translations.callNow[locale]}
            </a>
          </Button>
        )}
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
              <User className="h-6 w-6 text-primary" />
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
          {/* All Craftsmen Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white bg-primary">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {locale === 'ar' ? 'جميع الحرفيين' : 'Tous les artisans'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {locale === 'ar' ? 'تصفح جميع الحرفيين' : 'Voir tous les artisans'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {CRAFTSMAN_CATEGORIES.map((category) => {
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

  // Craftsmen List View
  const currentCategory = CRAFTSMAN_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || User;

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
          {isRTL ? 'سجل كحرفي' : "S'inscrire"}
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
                  ? (locale === 'ar' ? 'جميع الحرفيين' : 'Tous les artisans')
                  : currentCategory?.names[locale as 'ar' | 'fr' | 'en'] || currentCategory?.names.en
                }
              </CardTitle>
              <CardDescription>
                {filteredCraftsmen.length} {t.craftsmenFound[locale]}
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
                placeholder={locale === 'ar' ? "ابحث عن حرفي..." : "Rechercher un artisan..."}
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
      ) : filteredCraftsmen.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t.noCraftsmen[locale]}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCraftsmen.map((craftsman) => {
            const catInfo = getCategoryInfo(craftsman.category);
            const IconComp = catInfo?.icon || User;
            
            return (
              <Card 
                key={craftsman.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => setSelectedCraftsman(craftsman)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg text-white shrink-0', catInfo?.color || 'bg-primary')}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{craftsman.name}</h3>
                        {craftsman.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{craftsman.city || '-'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-2">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {craftsman.rating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {craftsman.experience_years || 0} {locale === 'ar' ? 'سنة' : 'ans'}
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

      {/* Add Craftsman Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        type="craftsman"
        onSuccess={() => {
          fetchCraftsmen();
        }}
      />
    </div>
  );
}

export default CraftsmenSection;
