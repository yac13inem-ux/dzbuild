'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { translations, Locale } from '@/lib/translations';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Search,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Home,
  ChevronLeft,
  Package,
  Building2,
  Tag,
  Boxes,
  Wrench,
  Cog,
  Shield,
  Zap,
  Droplets,
  Award,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddItemDialog } from '@/components/add-item-dialog';
import { CommentsSection } from '@/components/comments-section';

interface MarketSectionProps {
  onBack?: () => void;
}

// Product categories with icons and colors
const PRODUCT_CATEGORIES = [
  { 
    id: 'materials', 
    icon: Boxes, 
    color: 'bg-amber-500',
    names: { ar: 'مواد البناء', fr: 'Matériaux de construction', en: 'Building Materials' },
    descriptions: { ar: 'إسمنت، رمل، حصى، طوب...', fr: 'Ciment, sable, gravier, briques...', en: 'Cement, sand, gravel, bricks...' }
  },
  { 
    id: 'tools', 
    icon: Wrench, 
    color: 'bg-blue-500',
    names: { ar: 'أدوات البناء', fr: 'Outils de construction', en: 'Construction Tools' },
    descriptions: { ar: 'أدوات يدوية ومعدات خفيفة', fr: 'Outils manuels et légers', en: 'Hand tools and light equipment' }
  },
  { 
    id: 'equipment', 
    icon: Cog, 
    color: 'bg-gray-600',
    names: { ar: 'معدات ثقيلة', fr: 'Équipements lourds', en: 'Heavy Equipment' },
    descriptions: { ar: 'معدات بناء وتشييد ثقيلة', fr: 'Engins de chantier', en: 'Heavy construction machinery' }
  },
  { 
    id: 'safety', 
    icon: Shield, 
    color: 'bg-green-500',
    names: { ar: 'معدات السلامة', fr: 'Équipements de sécurité', en: 'Safety Equipment' },
    descriptions: { ar: 'معدات حماية شخصية وسلامة', fr: 'EPI et sécurité', en: 'PPE and safety gear' }
  },
  { 
    id: 'electrical', 
    icon: Zap, 
    color: 'bg-yellow-500',
    names: { ar: 'مواد كهربائية', fr: 'Matériel électrique', en: 'Electrical Materials' },
    descriptions: { ar: 'أسلاك، قواطع، أجهزة كهربائية', fr: 'Fils, disjoncteurs, appareils', en: 'Wires, breakers, appliances' }
  },
  { 
    id: 'plumbing', 
    icon: Droplets, 
    color: 'bg-cyan-500',
    names: { ar: 'مواد السباكة', fr: 'Matériel de plomberie', en: 'Plumbing Materials' },
    descriptions: { ar: 'مواسير، صنبور، سخانات...', fr: 'Tuyaux, robinets, chauffe-eau...', en: 'Pipes, faucets, water heaters...' }
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

interface Product {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  unit?: string;
  quantity_available?: number;
  supplier_name?: string;
  supplier_phone?: string;
  supplier_email?: string;
  city?: string;
  wilaya?: string;
  images?: string[];
  is_featured?: boolean;
}

export function MarketSection({ onBack }: MarketSectionProps) {
  const { locale, isLoggedIn, user } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.marketSection;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Check if user can modify (admin or anyone - no code needed)
  const canModify = (): boolean => {
    return true; // Anyone can modify now (no code needed)
  };

  // Fetch products
  useEffect(() => {
    if (selectedCategory !== null) {
      fetchProducts();
    }
  }, [selectedCategory, selectedWilaya]);

  const fetchProducts = async () => {
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
      
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (selectedCategory !== null) {
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(query) ||
        p.supplier_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getCategoryInfo = (categoryId: string) => {
    return PRODUCT_CATEGORIES.find(c => c.id === categoryId) || PRODUCT_CATEGORIES[0];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ').format(price);
  };

  // Product Detail View
  if (selectedProduct) {
    const categoryInfo = getCategoryInfo(selectedProduct.category);
    const IconComponent = categoryInfo?.icon || Package;
    
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedProduct(null)} className="gap-2">
            <ChevronLeft className={isRTL ? "rotate-180" : ""} />
            {translations.backToList[locale]}
          </Button>
          {onBack && (
            <Button variant="default" onClick={onBack} className="gap-2">
              <Home className="h-4 w-4" />
              {translations.home[locale]}
            </Button>
          )}
          
          {/* Edit/Delete Actions - Always visible */}
          <div className="ms-auto flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                <DropdownMenuItem onClick={() => setEditProduct(selectedProduct)}>
                  <Edit className="h-4 w-4 me-2" />
                  {isRTL ? 'تعديل' : 'Modifier'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Supprimer ce produit?')) {
                      handleDeleteProduct(selectedProduct.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {isRTL ? 'حذف' : 'Supprimer'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg text-white', categoryInfo?.color || 'bg-primary')}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{selectedProduct.title}</CardTitle>
                  {selectedProduct.is_featured && (
                    <Badge className="bg-amber-500 text-white">
                      <Award className="h-3 w-3 mr-1" />
                      {locale === 'ar' ? 'مميز' : 'Premium'}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {categoryInfo?.names[locale as 'ar' | 'fr' | 'en'] || categoryInfo?.names.en}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Price Card */}
        <Card className="bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t.price[locale]}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{formatPrice(selectedProduct.price)}</span>
                  <span className="text-lg text-muted-foreground">DA</span>
                  {selectedProduct.unit && (
                    <span className="text-muted-foreground">/ {selectedProduct.unit}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {selectedProduct.description && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </h3>
              <p className="text-muted-foreground">{selectedProduct.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedProduct.supplier_name && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.supplier[locale]}</p>
                    <p className="font-medium">{selectedProduct.supplier_name}</p>
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
                  <p className="text-sm text-muted-foreground">{t.city[locale]}</p>
                  <p className="font-medium">{selectedProduct.city || '-'} {selectedProduct.wilaya ? `(${selectedProduct.wilaya})` : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {selectedProduct.quantity_available && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.quantityAvailable[locale]}</p>
                    <p className="font-medium">{selectedProduct.quantity_available} {selectedProduct.unit || ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {selectedProduct.supplier_phone && (
            <Button size="lg" className="flex-1 gap-2" asChild>
              <a href={`tel:${selectedProduct.supplier_phone}`}>
                <Phone className="h-5 w-5" />
                {translations.callNow[locale]}
              </a>
            </Button>
          )}
          {selectedProduct.supplier_email && (
            <Button size="lg" variant="outline" className="flex-1 gap-2" asChild>
              <a href={`mailto:${selectedProduct.supplier_email}?subject=${encodeURIComponent(selectedProduct.title)}`}>
                <Mail className="h-5 w-5" />
                {locale === 'ar' ? 'أرسل رسالة' : 'Envoyer un email'}
              </a>
            </Button>
          )}
        </div>

        {/* Comments Section */}
        <Card>
          <CardContent className="p-4">
            <CommentsSection itemType="product" itemId={selectedProduct.id} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Handle delete product (no code needed)
  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log('[Market] Deleting product:', productId);
      const res = await fetch(`/api/products/${productId}`, { 
        method: 'DELETE' 
      });
      
      console.log('[Market] Delete response status:', res.status);
      
      if (res.ok) {
        toast.success(isRTL ? 'تم حذف المنتج' : 'Produit supprimé');
        setSelectedProduct(null);
        fetchProducts();
      } else {
        const error = await res.json();
        console.error('[Market] Delete error:', error);
        toast.error(error.error || (isRTL ? 'خطأ في الحذف' : 'Erreur'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(isRTL ? 'خطأ' : 'Erreur');
    }
  };

  // Category Selection View
  if (selectedCategory === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
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
          {/* All Products Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white bg-primary">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {locale === 'ar' ? 'جميع المنتجات' : 'Tous les produits'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {locale === 'ar' ? 'تصفح جميع المنتجات' : 'Voir tous les produits'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {PRODUCT_CATEGORIES.map((category) => {
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

  // Products List View
  const currentCategory = PRODUCT_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || ShoppingCart;

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
          {isRTL ? 'انشر' : 'Publier'}
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
                  ? (locale === 'ar' ? 'جميع المنتجات' : 'Tous les produits')
                  : currentCategory?.names[locale as 'ar' | 'fr' | 'en'] || currentCategory?.names.en
                }
              </CardTitle>
              <CardDescription>
                {filteredProducts.length} {t.productsFound[locale]}
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
                placeholder={t.searchProduct[locale]}
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
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t.noProducts[locale]}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const catInfo = getCategoryInfo(product.category);
            const IconComp = catInfo?.icon || Package;
            
            return (
              <Card 
                key={product.id} 
                className="hover:shadow-lg transition-all hover:border-primary"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className={cn('p-2 rounded-lg text-white shrink-0 cursor-pointer', catInfo?.color || 'bg-primary')}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <h3 className="font-semibold truncate">{product.title}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Tag className="h-3 w-3 text-primary" />
                        <span className="font-bold text-primary">
                          {formatPrice(product.price)} DA
                        </span>
                        {product.unit && (
                          <span className="text-xs text-muted-foreground">/{product.unit}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{product.city || '-'}</span>
                      </div>
                      {product.supplier_name && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{product.supplier_name}</span>
                        </div>
                      )}
                    </div>
                    {/* Edit/Delete Actions - Direct on card */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditProduct(product);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Supprimer ce produit?')) {
                            handleDeleteProduct(product.id);
                          }
                        }}
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
      )}

      {/* Add Product Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        type="product"
        onSuccess={() => {
          fetchProducts();
        }}
      />
      
      {/* Edit Product Dialog */}
      <AddItemDialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        type="product"
        editItem={editProduct}
        onSuccess={() => {
          setEditProduct(null);
          fetchProducts();
        }}
      />
    </div>
  );
}

export default MarketSection;
