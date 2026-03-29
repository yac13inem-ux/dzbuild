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
  BookOpen,
  FileText,
  Video,
  Download,
  Search,
  Home,
  ChevronLeft,
  Eye,
  Clock,
  Folder,
  File,
  Star,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface LibrarySectionProps {
  onBack?: () => void;
}

// Resource categories with icons and colors
const RESOURCE_CATEGORIES = [
  { 
    id: 'guide', 
    icon: BookOpen, 
    color: 'bg-blue-500',
    names: { ar: 'أدلة', fr: 'Guides', en: 'Guides' },
    descriptions: { ar: 'أدلة وتوجيهات هندسية', fr: 'Guides techniques', en: 'Technical guides' }
  },
  { 
    id: 'video', 
    icon: Video, 
    color: 'bg-purple-500',
    names: { ar: 'فيديوهات', fr: 'Vidéos', en: 'Videos' },
    descriptions: { ar: 'فيديوهات تعليمية', fr: 'Vidéos éducatives', en: 'Educational videos' }
  },
  { 
    id: 'document', 
    icon: FileText, 
    color: 'bg-green-500',
    names: { ar: 'مستندات', fr: 'Documents', en: 'Documents' },
    descriptions: { ar: 'مستندات وملفات PDF', fr: 'Documents et fichiers PDF', en: 'Documents and PDF files' }
  },
  { 
    id: 'standard', 
    icon: File, 
    color: 'bg-orange-500',
    names: { ar: 'معايير', fr: 'Normes', en: 'Standards' },
    descriptions: { ar: 'المعايير والمواصفات', fr: 'Normes et spécifications', en: 'Standards and specifications' }
  },
  { 
    id: 'tutorial', 
    icon: Star, 
    color: 'bg-amber-500',
    names: { ar: 'شروحات', fr: 'Tutoriels', en: 'Tutorials' },
    descriptions: { ar: 'شروحات وتطبيقات عملية', fr: 'Tutoriels pratiques', en: 'Practical tutorials' }
  },
];

interface LibraryResource {
  id: string;
  title: string;
  titleAr?: string;
  titleFr?: string;
  description?: string;
  category: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnail?: string;
  videoUrl?: string;
  readTime?: number;
  downloadCount?: number;
  likeCount?: number;
  viewCount: number;
  isFeatured: boolean;
  tags?: string;
  author?: string;
  createdAt: string;
}

export function LibrarySection({ onBack }: LibrarySectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.librarySection;
  
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null);

  // Fetch resources from API
  useEffect(() => {
    if (selectedCategory !== null) {
      fetchResources();
    }
  }, [selectedCategory]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/library');
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

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const title = resource.titleAr && locale === 'ar' ? resource.titleAr : 
                  resource.titleFr && locale === 'fr' ? resource.titleFr : 
                  resource.title;
    
    const matchesSearch = title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = async (resource: LibraryResource) => {
    const downloadUrl = resource.fileUrl || resource.videoUrl;
    if (!downloadUrl) return;
    
    try {
      await fetch(`/api/library/${resource.id}/download`, { method: 'POST' });
    } catch (error) {
      console.error('Error updating download count:', error);
    }
    
    window.open(downloadUrl, '_blank');
  };

  // Category Selection View
  if (selectedCategory === null) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
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

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* All Resources Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white bg-primary">
                  <Folder className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {t.allResources[locale]}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.allResourcesDesc[locale]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {RESOURCE_CATEGORIES.map((category) => {
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

  // Resource Detail View
  if (selectedResource) {
    const category = RESOURCE_CATEGORIES.find(c => c.id === selectedResource.category);
    const IconComponent = category?.icon || FileText;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedResource(null)} className="gap-2">
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

        {/* Resource Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg text-white', category?.color || 'bg-primary')}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>
                  {selectedResource.titleAr && locale === 'ar' ? selectedResource.titleAr : 
                   selectedResource.titleFr && locale === 'fr' ? selectedResource.titleFr : 
                   selectedResource.title}
                </CardTitle>
                <CardDescription>
                  {selectedResource.author && (
                    <span className="text-sm">
                      {locale === 'ar' ? 'بواسطة' : 'par'} {selectedResource.author}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Thumbnail */}
        {selectedResource.thumbnail && (
          <Card className="overflow-hidden">
            <img 
              src={selectedResource.thumbnail} 
              alt={selectedResource.title}
              className="w-full h-64 object-cover"
            />
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="font-bold text-lg">{selectedResource.viewCount}</p>
              <p className="text-xs text-muted-foreground">{t.views[locale]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Download className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="font-bold text-lg">{selectedResource.downloadCount || 0}</p>
              <p className="text-xs text-muted-foreground">{t.downloads[locale]}</p>
            </CardContent>
          </Card>
          {selectedResource.readTime && (
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="font-bold text-lg">{selectedResource.readTime}</p>
                <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'دقيقة' : 'min'}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        {selectedResource.description && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">{selectedResource.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Download Button */}
        {(selectedResource.fileUrl || selectedResource.videoUrl) ? (
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={() => handleDownload(selectedResource)}
          >
            <Download className="h-5 w-5" />
            {t.downloadNow[locale]}
            <ExternalLink className="h-4 w-4 ms-2" />
          </Button>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{locale === 'ar' ? 'لا يوجد رابط تحميل' : 'Aucun lien de téléchargement'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Resources List View
  const currentCategory = RESOURCE_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || Folder;

  return (
    <div className="space-y-6">
      {/* Back Button */}
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
                  ? t.allResources[locale] 
                  : currentCategory?.names[locale as 'ar' | 'fr' | 'en'] || currentCategory?.names.en
                }
              </CardTitle>
              <CardDescription>
                {filteredResources.length} {locale === 'ar' ? 'ملف' : locale === 'fr' ? 'fichiers' : 'files'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search[locale]}
              className={isRTL ? "pr-10" : "pl-10"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredResources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t.noResources[locale]}</p>
            <p className="text-sm text-muted-foreground mt-2">{t.noResourcesDesc[locale]}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const title = resource.titleAr && locale === 'ar' ? resource.titleAr : 
                          resource.titleFr && locale === 'fr' ? resource.titleFr : 
                          resource.title;
            const category = RESOURCE_CATEGORIES.find(c => c.id === resource.category);
            const IconComponent = category?.icon || BookOpen;
            
            return (
              <Card 
                key={resource.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => setSelectedResource(resource)}
              >
                {/* Thumbnail or Icon Cover */}
                {resource.thumbnail ? (
                  <div className="aspect-video w-full bg-muted overflow-hidden">
                    <img 
                      src={resource.thumbnail} 
                      alt={title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className={cn('aspect-video w-full flex items-center justify-center', category?.color || 'bg-gray-500')}>
                    <IconComponent className="h-12 w-12 text-white/50" />
                  </div>
                )}
                
                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold line-clamp-2 mb-2">{title}</h3>
                  
                  {/* Description */}
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {resource.description}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {resource.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {resource.downloadCount || resource.likeCount || 0}
                      </span>
                    </div>
                    {(resource.fileUrl || resource.videoUrl) && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                        <Download className="h-3 w-3 me-1" />
                        {t.downloads[locale]}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LibrarySection;
