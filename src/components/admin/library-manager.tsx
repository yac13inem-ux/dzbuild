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
  DialogDescription,
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
  BookOpen,
  FileText,
  Video,
  Download,
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
  File,
  ImageIcon,
  ExternalLink,
  Upload,
  X,
  CheckCircle,
  Award,
  Lightbulb,
  ClipboardList,
} from 'lucide-react';

interface LibraryResource {
  id: string;
  title: string;
  titleAr?: string;
  titleFr?: string;
  description?: string;
  category: string;
  fileUrl?: string;
  thumbnail?: string;
  downloadCount: number;
  viewCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  tags?: string;
  author?: string;
  createdAt: string;
}

const categoryLabels: Record<string, Record<string, string>> = {
  guide: { ar: 'دليل', fr: 'Guide', en: 'Guide' },
  video: { ar: 'فيديو', fr: 'Vidéo', en: 'Video' },
  document: { ar: 'مستند', fr: 'Document', en: 'Document' },
  standard: { ar: 'معيار', fr: 'Standard', en: 'Standard' },
  tutorial: { ar: 'تعليمي', fr: 'Tutoriel', en: 'Tutorial' },
  best_practice: { ar: 'أفضل ممارسة', fr: 'Bonne pratique', en: 'Best Practice' },
};

// Default images for each category (gradient backgrounds with icons)
const categoryImages: Record<string, { gradient: string; icon: React.ElementType; iconColor: string }> = {
  guide: { 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    icon: BookOpen,
    iconColor: 'text-white'
  },
  video: { 
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
    icon: Video,
    iconColor: 'text-white'
  },
  document: { 
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
    icon: FileText,
    iconColor: 'text-white'
  },
  standard: { 
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
    icon: Award,
    iconColor: 'text-white'
  },
  tutorial: { 
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
    icon: Lightbulb,
    iconColor: 'text-gray-700'
  },
  best_practice: { 
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
    icon: ClipboardList,
    iconColor: 'text-gray-700'
  },
};

export function LibraryManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'downloads'>('newest');
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    titleFr: '',
    description: '',
    category: 'guide',
    fileUrl: '',
    thumbnail: '',
    tags: '',
    author: '',
    isFeatured: false,
    isPublished: true,
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('/api/admin/library');
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (error) {
        console.error('Error fetching library resources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Filter and sort resources
  const filteredResources = resources.filter(resource => {
    const title = resource.titleAr && locale === 'ar' ? resource.titleAr : 
                  resource.titleFr && locale === 'fr' ? resource.titleFr : 
                  resource.title;
    const matchesSearch = title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.viewCount - a.viewCount;
      case 'downloads':
        return b.downloadCount - a.downloadCount;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const openEditDialog = (resource?: LibraryResource) => {
    if (resource) {
      setSelectedResource(resource);
      setFormData({
        title: resource.title,
        titleAr: resource.titleAr || '',
        titleFr: resource.titleFr || '',
        description: resource.description || '',
        category: resource.category,
        fileUrl: resource.fileUrl || '',
        thumbnail: resource.thumbnail || '',
        tags: resource.tags || '',
        author: resource.author || '',
        isFeatured: resource.isFeatured,
        isPublished: resource.isPublished,
      });
    } else {
      setSelectedResource(null);
      setFormData({
        title: '',
        titleAr: '',
        titleFr: '',
        description: '',
        category: 'guide',
        fileUrl: '',
        thumbnail: '',
        tags: '',
        author: '',
        isFeatured: false,
        isPublished: true,
      });
    }
    setEditDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    console.log('Saving resource with data:', formData);
    try {
      const url = selectedResource ? `/api/admin/library/${selectedResource.id}` : '/api/admin/library';
      const method = selectedResource ? 'PUT' : 'POST';
      
      console.log('Sending request to:', url, 'method:', method);
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      console.log('Save response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Saved resource:', data.resource);
        if (selectedResource) {
          setResources(resources.map(r => r.id === selectedResource.id ? data.resource : r));
        } else {
          setResources([data.resource, ...resources]);
        }
        setEditDialog(false);
        toast.success(isRTL ? 'تم حفظ المحتوى بنجاح' : 'Content saved successfully');
      } else {
        const error = await res.json();
        console.error('Save error:', error);
        toast.error(isRTL ? 'خطأ في حفظ المحتوى' : 'Error saving content');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error(isRTL ? 'خطأ في حفظ المحتوى' : 'Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    
    console.log('Deleting resource:', selectedResource.id);
    setDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/library/${selectedResource.id}`, { method: 'DELETE' });
      console.log('Delete response status:', res.status);
      
      if (res.ok) {
        setResources(resources.filter(r => r.id !== selectedResource.id));
        setDeleteDialog(false);
        setSelectedResource(null);
        toast.success(isRTL ? 'تم حذف المحتوى بنجاح' : 'Content deleted successfully');
      } else {
        const error = await res.json();
        console.error('Delete error:', error);
        toast.error(isRTL ? 'خطأ في حذف المحتوى: ' + error.error : 'Error deleting content: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error(isRTL ? 'خطأ في حذف المحتوى' : 'Error deleting content');
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('Uploading image:', file.name, 'size:', file.size, 'type:', file.type);
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const res = await fetch('/api/upload/library', {
        method: 'POST',
        body: formDataUpload,
      });
      
      console.log('Upload response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Upload successful, URL:', data.url);
        setFormData(prev => ({ ...prev, thumbnail: data.url }));
        toast.success(isRTL ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
      } else {
        const error = await res.json();
        console.error('Upload error:', error);
        toast.error(isRTL ? 'خطأ في رفع الصورة: ' + error.error : 'Upload error: ' + error.error);
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

  const t = {
    library: isRTL ? 'إدارة المكتبة' : 'Library Manager',
    search: isRTL ? 'بحث...' : 'Search...',
    allCategories: isRTL ? 'جميع الأقسام' : 'All Categories',
    newest: isRTL ? 'الأحدث' : 'Newest',
    popular: isRTL ? 'الأكثر مشاهدة' : 'Most Viewed',
    downloads: isRTL ? 'الأكثر تحميلاً' : 'Most Downloaded',
    add: isRTL ? 'إضافة محتوى' : 'Add Content',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    views: isRTL ? 'مشاهدة' : 'views',
    downloadsLabel: isRTL ? 'تحميل' : 'downloads',
    featured: isRTL ? 'مميز' : 'Featured',
    published: isRTL ? 'منشور' : 'Published',
    draft: isRTL ? 'مسودة' : 'Draft',
    noResults: isRTL ? 'لا توجد نتائج' : 'No results',
    noResultsDesc: isRTL ? 'لم يتم إضافة أي محتوى بعد' : 'No content has been added yet',
    totalResources: isRTL ? 'محتوى' : 'items',
    // Form
    title: isRTL ? 'العنوان' : 'Title',
    titleAr: isRTL ? 'العنوان بالعربية' : 'Title (Arabic)',
    titleFr: isRTL ? 'العنوان بالفرنسية' : 'Title (French)',
    description: isRTL ? 'الوصف' : 'Description',
    category: isRTL ? 'القسم' : 'Category',
    tags: isRTL ? 'الوسوم (مفصولة بفواصل)' : 'Tags (comma separated)',
    author: isRTL ? 'المؤلف' : 'Author',
    fileUrl: isRTL ? 'رابط التحميل' : 'Download Link',
    fileUrlPlaceholder: isRTL ? 'أدخل رابط التحميل (Google Drive, Dropbox, إلخ)' : 'Enter download link (Google Drive, Dropbox, etc.)',
    thumbnail: isRTL ? 'صورة المحتوى' : 'Content Image',
    thumbnailPlaceholder: isRTL ? 'أدخل رابط الصورة أو ارفع من جهازك' : 'Enter image URL or upload from device',
    uploadImage: isRTL ? 'رفع صورة' : 'Upload Image',
    changeImage: isRTL ? 'تغيير الصورة' : 'Change Image',
    removeImage: isRTL ? 'إزالة' : 'Remove',
    uploading: isRTL ? 'جاري الرفع...' : 'Uploading...',
    orUploadFromDevice: isRTL ? 'أو ارفع من جهازك' : 'Or upload from device',
    isFeatured: isRTL ? 'تمييز المحتوى' : 'Feature this content',
    isPublished: isRTL ? 'نشر المحتوى' : 'Publish content',
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    confirmDelete: isRTL ? 'تأكيد الحذف' : 'Confirm Delete',
    deleteWarning: isRTL ? 'هل أنت متأكد من حذف هذا المحتوى؟' : 'Are you sure you want to delete this content?',
    hasDownloadLink: isRTL ? 'يوجد رابط تحميل' : 'Has download link',
    noDownloadLink: isRTL ? 'لا يوجد رابط' : 'No link',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {t.library}
          </h2>
          <p className="text-muted-foreground">
            {filteredResources.length} {t.totalResources}
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
                {Object.keys(categoryLabels).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat][locale]}
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
                <SelectItem value="downloads">{t.downloads}</SelectItem>
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

      {/* Resources Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredResources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t.noResults}</p>
            <p className="text-sm text-muted-foreground mt-2">{t.noResultsDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredResources.map((resource) => {
            const title = resource.titleAr && locale === 'ar' ? resource.titleAr : 
                          resource.titleFr && locale === 'fr' ? resource.titleFr : 
                          resource.title;
            
            return (
              <Card 
                key={resource.id} 
                className={cn(
                  "overflow-hidden hover:shadow-lg transition-all",
                  resource.isFeatured && "ring-2 ring-primary/20"
                )}
              >
                {/* Thumbnail Image */}
                {resource.thumbnail ? (
                  <div className="aspect-video w-full bg-muted overflow-hidden">
                    <img 
                      src={resource.thumbnail + (resource.thumbnail.startsWith('/') ? '?t=' + Date.now() : '')} 
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', resource.thumbnail);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-2">{title}</h3>
                    <div className="flex gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(resource)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Delete button clicked for resource:', resource.id);
                          setSelectedResource(resource);
                          setDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[resource.category]?.[locale] || resource.category}
                    </Badge>
                    {resource.isFeatured && (
                      <Badge className="bg-amber-500 text-white text-xs">
                        <Star className="h-3 w-3 me-1" />
                        {t.featured}
                      </Badge>
                    )}
                    {resource.fileUrl && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        <Download className="h-3 w-3 me-1" />
                        {t.hasDownloadLink}
                      </Badge>
                    )}
                  </div>
                  
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {resource.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {resource.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {resource.downloadCount}
                      </span>
                    </div>
                    <Badge variant={resource.isPublished ? 'default' : 'secondary'} className="text-xs">
                      {resource.isPublished ? t.published : t.draft}
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
              {selectedResource ? t.edit : t.add}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Titles */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>{t.title}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t.title}
                />
              </div>
              <div>
                <Label>{t.titleAr}</Label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                  placeholder={t.titleAr}
                  dir="rtl"
                />
              </div>
              <div>
                <Label>{t.titleFr}</Label>
                <Input
                  value={formData.titleFr}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleFr: e.target.value }))}
                  placeholder={t.titleFr}
                />
              </div>
            </div>
            
            {/* Category */}
            <div>
              <Label>{t.category}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryLabels).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat][locale]}
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
            
            {/* Image Upload */}
            <div>
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t.thumbnail}
              </Label>
              
              {/* Image Preview */}
              {formData.thumbnail ? (
                <div className="mt-2 mb-3 relative inline-block">
                  <img 
                    src={formData.thumbnail + (formData.thumbnail.startsWith('/') ? '?t=' + Date.now() : '')} 
                    alt="Preview" 
                    className="w-full max-w-xs h-40 object-cover rounded-lg border"
                    onLoad={() => console.log('Image loaded successfully:', formData.thumbnail)}
                    onError={(e) => {
                      console.error('Image load error for:', formData.thumbnail);
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 end-2 h-6 w-6 p-0"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 mb-3 border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{isRTL ? 'لم يتم اختيار صورة' : 'No image selected'}</p>
                </div>
              )}
              
              {/* Upload from device */}
              <div className="flex flex-col sm:flex-row gap-2">
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
                  className="gap-2 flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.uploading}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {formData.thumbnail ? t.changeImage : t.uploadImage}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL ? 'JPEG, PNG, GIF, WebP - الحجم الأقصى 5MB' : 'JPEG, PNG, GIF, WebP - Max 5MB'}
              </p>
            </div>
            
            {/* Download Link */}
            <div>
              <Label className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                {t.fileUrl}
              </Label>
              <Input
                value={formData.fileUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                placeholder={t.fileUrlPlaceholder}
              />
              {formData.fileUrl && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => window.open(formData.fileUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isRTL ? 'اختبار الرابط' : 'Test Link'}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Tags and Author */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t.tags}</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder={t.tags}
                />
              </div>
              <div>
                <Label>{t.author}</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder={t.author}
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
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                />
                <Label>{t.isPublished}</Label>
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
            <DialogDescription>{t.deleteWarning}</DialogDescription>
          </DialogHeader>
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
