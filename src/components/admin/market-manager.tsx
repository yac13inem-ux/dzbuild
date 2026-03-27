'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ShoppingCart,
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
  Save,
  Package,
  Tag,
  DollarSign,
  X,
  Upload,
  Image as ImageIcon,
  Loader2 as LoaderIcon,
} from 'lucide-react';

// Product categories
const PRODUCT_CATEGORIES = [
  { id: 'cement', nameAr: 'إسمنت', nameFr: 'Ciment', icon: '🪨', color: 'bg-gray-500', unit: 'شيك' },
  { id: 'steel', nameAr: 'حديد', nameFr: 'Acier', icon: '🔩', color: 'bg-slate-600', unit: 'طن' },
  { id: 'bricks', nameAr: 'طوب', nameFr: 'Briques', icon: '🧱', color: 'bg-orange-500', unit: 'قطعة' },
  { id: 'sand', nameAr: 'رمل', nameFr: 'Sable', icon: '🏖️', color: 'bg-yellow-600', unit: 'م³' },
  { id: 'gravel', nameAr: 'حصى', nameFr: 'Gravier', icon: '🪨', color: 'bg-stone-500', unit: 'م³' },
  { id: 'tools', nameAr: 'أدوات', nameFr: 'Outils', icon: '🔧', color: 'bg-red-500', unit: 'قطعة' },
  { id: 'equipment', nameAr: 'معدات', nameFr: 'Équipement', icon: '🚜', color: 'bg-amber-600', unit: 'وحدة' },
];

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  description?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  sku?: string;
  categoryId?: string;
  factoryId?: string;
  companyId?: string;
  sellerId?: string;
  images?: string;
  unit?: string;
  price: number;
  oldPrice?: number;
  minQuantity?: number;
  stock?: number;
  specifications?: string;
  features?: string;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export function MarketManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price'>('newest');
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    nameFr: '',
    description: '',
    categoryId: '',
    price: 0,
    oldPrice: 0,
    unit: 'piece',
    stock: 0,
    isFeatured: false,
    isActive: true,
    images: '' as string,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/market');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const name = product.nameAr && locale === 'ar' ? product.nameAr : 
                 product.nameFr && locale === 'fr' ? product.nameFr : 
                 product.name;
    
    const matchesSearch = name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.viewCount - a.viewCount;
      case 'price':
        return a.price - b.price;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getCategoryLabel = (categoryId?: string) => {
    if (!categoryId) return '';
    const cat = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
    return cat ? (isRTL ? cat.nameAr : cat.nameFr) : categoryId;
  };

  const getCategoryIcon = (categoryId?: string) => {
    if (!categoryId) return '📦';
    const cat = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
    return cat?.icon || '📦';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', { 
      style: 'currency', 
      currency: 'DZD',
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Handle image upload
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
        setFormData(prev => ({ ...prev, images: data.url }));
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

  const openEditDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        nameAr: product.nameAr || '',
        nameFr: product.nameFr || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        price: product.price,
        oldPrice: product.oldPrice || 0,
        unit: product.unit || 'piece',
        stock: product.stock || 0,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        images: product.images || '',
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        nameAr: '',
        nameFr: '',
        description: '',
        categoryId: '',
        price: 0,
        oldPrice: 0,
        unit: 'piece',
        stock: 0,
        isFeatured: false,
        isActive: true,
        images: '',
      });
    }
    setEditDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = selectedProduct ? `/api/admin/market/${selectedProduct.id}` : '/api/admin/market';
      const method = selectedProduct ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (selectedProduct) {
          setProducts(products.map(p => p.id === selectedProduct.id ? data.product : p));
        } else {
          setProducts([data.product, ...products]);
        }
        setEditDialog(false);
        toast.success(isRTL ? 'تم حفظ المنتج بنجاح' : 'Product saved successfully');
      } else {
        toast.error(isRTL ? 'خطأ في حفظ المنتج' : 'Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(isRTL ? 'خطأ في حفظ المنتج' : 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/market/${selectedProduct.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== selectedProduct.id));
        setDeleteDialog(false);
        setSelectedProduct(null);
        toast.success(isRTL ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
      } else {
        toast.error(isRTL ? 'خطأ في حذف المنتج' : 'Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(isRTL ? 'خطأ في حذف المنتج' : 'Error deleting product');
    } finally {
      setDeleting(false);
    }
  };

  const t = {
    title: isRTL ? 'إدارة السوق' : 'Market Manager',
    search: isRTL ? 'بحث...' : 'Search...',
    allCategories: isRTL ? 'جميع الفئات' : 'All Categories',
    newest: isRTL ? 'الأحدث' : 'Newest',
    popular: isRTL ? 'الأكثر مشاهدة' : 'Most Viewed',
    priceSort: isRTL ? 'السعر' : 'Price',
    add: isRTL ? 'إضافة منتج' : 'Add Product',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    featured: isRTL ? 'مميز' : 'Featured',
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'غير نشط' : 'Inactive',
    noResults: isRTL ? 'لا توجد نتائج' : 'No results',
    noResultsDesc: isRTL ? 'لم يتم إضافة أي منتجات بعد' : 'No products have been added yet',
    totalProducts: isRTL ? 'منتج' : 'products',
    confirmDelete: isRTL ? 'تأكيد الحذف' : 'Confirm Delete',
    deleteWarning: isRTL ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    save: isRTL ? 'حفظ' : 'Save',
    name: isRTL ? 'اسم المنتج' : 'Product Name',
    nameAr: isRTL ? 'الاسم بالعربية' : 'Name (Arabic)',
    nameFr: isRTL ? 'الاسم بالفرنسية' : 'Name (French)',
    description: isRTL ? 'الوصف' : 'Description',
    category: isRTL ? 'القسم' : 'Category',
    price: isRTL ? 'السعر (د.ج)' : 'Price (DZD)',
    oldPrice: isRTL ? 'السعر القديم (د.ج)' : 'Old Price (DZD)',
    unit: isRTL ? 'الوحدة' : 'Unit',
    stock: isRTL ? 'المخزون' : 'Stock',
    isFeatured: isRTL ? 'تمييز المنتج' : 'Feature this product',
    isActive: isRTL ? 'تفعيل المنتج' : 'Active product',
    views: isRTL ? 'مشاهدة' : 'views',
    inStock: isRTL ? 'متوفر' : 'In Stock',
    outOfStock: isRTL ? 'غير متوفر' : 'Out of Stock',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground">
            {filteredProducts.length} {t.totalProducts}
          </p>
        </div>
        <Button className="gap-2" onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4" />
          {t.add}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="ps-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                {PRODUCT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {isRTL ? cat.nameAr : cat.nameFr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-40">
                <ArrowUpDown className="h-4 w-4 me-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t.newest}</SelectItem>
                <SelectItem value="popular">{t.popular}</SelectItem>
                <SelectItem value="price">{t.price}</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t.noResults}</p>
            <p className="text-sm text-muted-foreground mt-2">{t.noResultsDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredProducts.map((product) => {
            const name = product.nameAr && locale === 'ar' ? product.nameAr : 
                         product.nameFr && locale === 'fr' ? product.nameFr : 
                         product.name;
            
            return (
              <Card 
                key={product.id} 
                className={cn(
                  "overflow-hidden hover:shadow-lg transition-all",
                  product.isFeatured && "ring-2 ring-primary/20"
                )}
              >
                {/* Product Image or Placeholder */}
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                  {product.images ? (
                    <img 
                      src={product.images.split(',')[0]} 
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{getCategoryIcon(product.categoryId)}</span>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-2">{name}</h3>
                    <div className="flex gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryIcon(product.categoryId)} {getCategoryLabel(product.categoryId)}
                    </Badge>
                    {product.isFeatured && (
                      <Badge className="bg-amber-500 text-white text-xs">
                        <Star className="h-3 w-3 me-1" />
                        {t.featured}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">/ {product.unit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {product.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {product.soldCount}
                      </span>
                    </div>
                    <Badge variant={product.stock && product.stock > 0 ? 'default' : 'destructive'} className="text-xs">
                      {product.stock && product.stock > 0 ? t.inStock : t.outOfStock}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? t.edit : t.add}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Names */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>{t.name}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.name}
                />
              </div>
              <div>
                <Label>{t.nameAr}</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                  placeholder={t.nameAr}
                  dir="rtl"
                />
              </div>
              <div>
                <Label>{t.nameFr}</Label>
                <Input
                  value={formData.nameFr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameFr: e.target.value }))}
                  placeholder={t.nameFr}
                />
              </div>
            </div>
            
            {/* Category */}
            <div>
              <Label>{t.category}</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {isRTL ? cat.nameAr : cat.nameFr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Description */}
            <div>
              <Label>{t.description}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t.description}
                rows={3}
              />
            </div>
            
            {/* Price and Stock */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>{t.price}</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>{t.oldPrice}</Label>
                <Input
                  type="number"
                  value={formData.oldPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, oldPrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>{t.stock}</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            {/* Switches */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label>{t.isFeatured}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>{t.isActive}</Label>
              </div>
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {isRTL ? 'صورة المنتج' : 'Product Image'}
              </Label>
              
              {/* Image Preview */}
              {formData.images ? (
                <div className="relative inline-block">
                  <img 
                    src={formData.images + (formData.images.startsWith('/') ? '?t=' + Date.now() : '')} 
                    alt="Product" 
                    className="w-full max-w-xs h-40 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 end-2 h-6 w-6 p-0"
                    onClick={() => setFormData(prev => ({ ...prev, images: '' }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-xs h-40 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
                  className="gap-2"
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
                      {isRTL ? 'رفع صورة' : 'Upload Image'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmDelete}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t.deleteWarning}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={deleting}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Trash2 className="h-4 w-4 me-2" />}
              {deleting ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
