'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Wrench,
  Building2,
  HelpCircle,
  Calculator,
  Plus,
  MessageCircle,
  Star,
  MapPin,
  Phone,
  Search,
  Grid3X3,
  List,
  CheckCircle,
  Eye,
  Clock,
  Send,
  HardHat,
  Zap,
  Droplets,
  Paintbrush,
  Hammer,
  Loader2,
} from 'lucide-react';

// Craftsman categories
const craftsmanCategories = [
  { id: 'plumber', nameAr: 'سباك', nameFr: 'Plombier', icon: Droplets, color: 'bg-blue-500' },
  { id: 'electrician', nameAr: 'كهربائي', nameFr: 'Électricien', icon: Zap, color: 'bg-yellow-500' },
  { id: 'builder', nameAr: 'بنّاء', nameFr: 'Maçon', icon: Hammer, color: 'bg-orange-500' },
  { id: 'painter', nameAr: 'دهّان', nameFr: 'Peintre', icon: Paintbrush, color: 'bg-purple-500' },
  { id: 'carpenter', nameAr: 'نجار', nameFr: 'Menuisier', icon: Wrench, color: 'bg-amber-600' },
  { id: 'tiler', nameAr: 'بلاّط', nameFr: 'Carreleur', icon: Grid3X3, color: 'bg-cyan-500' },
];

// Wilayas
const wilayas = [
  'الجزائر', 'وهران', 'قسنطينة', 'تلمسان', 'سطيف', 'عنابة', 'بجاية', 'تيزي وزو',
  'باتنة', 'بسكرة', 'شلف', 'قليعة', 'وادي سوف', 'مستغانم', 'غرداية', 'جيجل'
];

interface Craftsman {
  id: string;
  name: string;
  category: string;
  city: string;
  wilaya: string;
  rating: number;
  review_count: number;
  phone: string;
  is_verified: boolean;
}

export function CraftsmenDirectory() {
  const { locale } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [craftsmen, setCraftsmen] = useState<Craftsman[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = locale === 'ar';

  useEffect(() => {
    fetchCraftsmen();
  }, []);

  const fetchCraftsmen = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/craftsmen');
      const data = await res.json();
      setCraftsmen(data.craftsmen || []);
    } catch (error) {
      console.error('Error fetching craftsmen:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCraftsmen = craftsmen.filter(c => {
    if (selectedCategory && c.category !== selectedCategory) return false;
    if (selectedWilaya && c.wilaya !== selectedWilaya) return false;
    if (searchQuery && !c.name.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {craftsmanCategories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-2 shrink-0"
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <cat.icon className="h-4 w-4" />
            {isRTL ? cat.nameAr : cat.nameFr}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input
            placeholder={isRTL ? "ابحث عن حرفي..." : "Rechercher un artisan..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? "pr-10" : "pl-10"}
          />
        </div>
        <select
          value={selectedWilaya}
          onChange={(e) => setSelectedWilaya(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{isRTL ? "كل الولايات" : "Toutes les wilayas"}</option>
          {wilayas.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {isRTL ? `${filteredCraftsmen.length} حرفي` : `${filteredCraftsmen.length} artisans`}
      </p>

      {/* Craftsmen List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCraftsmen.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-3"
        )}>
          {filteredCraftsmen.map((craftsman) => {
            const category = craftsmanCategories.find(c => c.id === craftsman.category);
            return (
              <Card key={craftsman.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={cn("text-white", category?.color || 'bg-gray-500')}>
                        {craftsman.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">{craftsman.name}</h4>
                        {craftsman.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {isRTL ? category?.nameAr : category?.nameFr}
                        </Badge>
                        <MapPin className="h-3 w-3" />
                        <span>{craftsman.city}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{craftsman.rating || 0}</span>
                          <span className="text-xs text-muted-foreground">({craftsman.review_count || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 gap-1">
                      <Phone className="h-3 w-3" />
                      {isRTL ? "اتصل" : "Appeler"}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {isRTL ? "رسالة" : "Message"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {isRTL ? "لم يتم العثور على حرفيين" : "Aucun artisan trouvé"}
          </p>
        </div>
      )}
    </div>
  );
}

interface Question {
  id: string;
  title: string;
  author_name: string;
  answers_count: number;
  views_count: number;
  created_at: string;
}

export function QuestionsSection() {
  const { locale } = useAppStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = locale === 'ar';

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return isRTL ? `${hours} ساعة` : `${hours}h`;
    const days = Math.floor(hours / 24);
    return isRTL ? `${days} يوم` : `${days}j`;
  };

  return (
    <div className="space-y-4">
      {/* Ask Question Button */}
      <Button className="w-full gap-2">
        <Plus className="h-4 w-4" />
        {isRTL ? "اطرح سؤالاً" : "Poser une question"}
      </Button>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{q.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{isRTL ? `بواسطة ${q.author_name}` : `Par ${q.author_name}`}</span>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{q.answers_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{q.views_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeAgo(q.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {isRTL ? "لا توجد أسئلة حالياً" : "Aucune question pour le moment"}
          </p>
        </div>
      )}

      {questions.length > 0 && (
        <Button variant="outline" className="w-full">
          {isRTL ? "عرض جميع الأسئلة" : "Voir toutes les questions"}
        </Button>
      )}
    </div>
  );
}

export function ConstructionCalculator() {
  const { locale } = useAppStore();
  const [calculator, setCalculator] = useState('cement');
  const [values, setValues] = useState({
    length: '',
    width: '',
    height: '',
    area: '',
  });
  const [result, setResult] = useState<number | null>(null);
  const isRTL = locale === 'ar';

  const calculators = [
    { id: 'cement', nameAr: 'كمية الإسمنت', nameFr: 'Quantité de ciment', icon: Building2 },
    { id: 'steel', nameAr: 'كمية الحديد', nameFr: "Quantité d'acier", icon: HardHat },
    { id: 'bricks', nameAr: 'عدد الطوب', nameFr: 'Nombre de briques', icon: Grid3X3 },
    { id: 'paint', nameAr: 'كمية الدهان', nameFr: 'Quantité de peinture', icon: Paintbrush },
  ];

  const handleCalculate = () => {
    const area = parseFloat(values.length) * parseFloat(values.width);
    let res = 0;

    switch (calculator) {
      case 'cement':
        res = area * 0.035; // m³ of cement per m²
        break;
      case 'steel':
        res = area * 80; // kg per m²
        break;
      case 'bricks':
        res = area * 50; // bricks per m²
        break;
      case 'paint':
        res = area * 0.1; // liters per m²
        break;
    }
    setResult(res);
  };

  return (
    <div className="space-y-4">
      {/* Calculator Types */}
      <div className="grid grid-cols-2 gap-2">
        {calculators.map((calc) => (
          <Button
            key={calc.id}
            variant={calculator === calc.id ? 'default' : 'outline'}
            className="justify-start gap-2"
            onClick={() => { setCalculator(calc.id); setResult(null); }}
          >
            <calc.icon className="h-4 w-4" />
            {isRTL ? calc.nameAr : calc.nameFr}
          </Button>
        ))}
      </div>

      {/* Input Fields */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">{isRTL ? "الطول (م)" : "Longueur (m)"}</label>
              <Input
                type="number"
                value={values.length}
                onChange={(e) => setValues({ ...values, length: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{isRTL ? "العرض (م)" : "Largeur (m)"}</label>
              <Input
                type="number"
                value={values.width}
                onChange={(e) => setValues({ ...values, width: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleCalculate}>
            <Calculator className="h-4 w-4 me-2" />
            {isRTL ? "احسب" : "Calculer"}
          </Button>

          {result !== null && (
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {isRTL ? "النتيجة" : "Résultat"}
              </p>
              <p className="text-2xl font-bold text-primary">
                {result.toFixed(2)} {calculator === 'cement' ? 'م³' : calculator === 'steel' ? 'كغ' : calculator === 'bricks' ? 'قطعة' : 'لتر'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  city: string;
}

export function MarketplaceSection() {
  const { locale } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = locale === 'ar';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Post Ad Button */}
      <Button className="w-full gap-2">
        <Plus className="h-4 w-4" />
        {isRTL ? "أضف إعلان" : "Publier une annonce"}
      </Button>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant="outline" size="sm">{isRTL ? "مواد بناء" : "Matériaux"}</Button>
        <Button variant="outline" size="sm">{isRTL ? "أدوات" : "Outils"}</Button>
        <Button variant="outline" size="sm">{isRTL ? "خدمات" : "Services"}</Button>
        <Button variant="outline" size="sm">{isRTL ? "معدات" : "Équipements"}</Button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="h-24 bg-muted flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium text-sm truncate">{product.title}</h4>
                <p className="text-primary font-bold">{product.price?.toLocaleString() || 0} DA/{product.unit}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {product.city}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {isRTL ? "لا توجد إعلانات حالياً" : "Aucune annonce pour le moment"}
          </p>
        </div>
      )}

      {products.length > 0 && (
        <Button variant="outline" className="w-full">
          {isRTL ? "عرض جميع الإعلانات" : "Voir toutes les annonces"}
        </Button>
      )}
    </div>
  );
}

export function RequestCraftsman() {
  const { locale, user } = useAppStore();
  const [formData, setFormData] = useState({
    type: '',
    wilaya: '',
    city: '',
    description: '',
    budget: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const isRTL = locale === 'ar';

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          {isRTL ? "طلب حرفي" : "Demander un artisan"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <p className="font-medium">{isRTL ? "تم إرسال طلبك!" : "Demande envoyée!"}</p>
            <p className="text-sm text-muted-foreground">
              {isRTL ? "سيتواصل معك الحرفيون قريباً" : "Les artisans vous contacteront bientôt"}
            </p>
          </div>
        ) : (
          <>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">{isRTL ? "نوع الحرفي" : "Type d'artisan"}</option>
              {craftsmanCategories.map(c => (
                <option key={c.id} value={c.id}>{isRTL ? c.nameAr : c.nameFr}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.wilaya}
                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                className="h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">{isRTL ? "الولاية" : "Wilaya"}</option>
                {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <Input
                placeholder={isRTL ? "المدينة" : "Ville"}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <textarea
              placeholder={isRTL ? "اوصف ما تحتاجه..." : "Décrivez ce dont vous avez besoin..."}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
            />

            <Input
              type="number"
              placeholder={isRTL ? "الميزانية (اختياري)" : "Budget (optionnel)"}
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />

            <Button className="w-full" onClick={handleSubmit}>
              <Send className="h-4 w-4 me-2" />
              {isRTL ? "إرسال الطلب" : "Envoyer la demande"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface Company {
  id: string;
  name: string;
  type: string;
  city: string;
  projects_count: number;
  rating: number;
}

export function CompaniesSection() {
  const { locale } = useAppStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = locale === 'ar';

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm">{isRTL ? "شركات" : "Entreprises"}</Button>
        <Button variant="outline" size="sm">{isRTL ? "مكاتب دراسات" : "Bureaux d'études"}</Button>
        <Button variant="outline" size="sm">{isRTL ? "مقاولين" : "Entrepreneurs"}</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : companies.length > 0 ? (
        <div className="space-y-3">
          {companies.map((company) => (
            <Card key={company.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {company.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{company.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{company.type}</Badge>
                      <MapPin className="h-3 w-3" />
                      <span>{company.city}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>{company.projects_count || 0} {isRTL ? "مشروع" : "projets"}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{company.rating || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {isRTL ? "لا توجد شركات حالياً" : "Aucune entreprise pour le moment"}
          </p>
        </div>
      )}
    </div>
  );
}
