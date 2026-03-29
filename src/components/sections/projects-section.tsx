'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { translations, Locale } from '@/lib/translations';
import { toast } from 'sonner';
import {
  FolderKanban,
  Plus,
  Search,
  MapPin,
  Calendar,
  Clock,
  Home,
  Building2,
  Loader2,
  Edit,
  CheckCircle2,
  Timer,
  Store,
  Factory,
  Route,
  Building,
  RefreshCw,
  ChevronLeft,
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

interface ProjectsSectionProps {
  onBack?: () => void;
}

// Project categories with icons and colors
const PROJECT_CATEGORIES = [
  { 
    id: 'residential', 
    icon: Home, 
    color: 'bg-blue-500',
    names: { ar: 'سكني', fr: 'Résidentiel', en: 'Residential' },
    descriptions: { ar: 'مشاريع سكنية ومنازل', fr: 'Projets résidentiels', en: 'Residential projects' }
  },
  { 
    id: 'commercial', 
    icon: Store, 
    color: 'bg-purple-500',
    names: { ar: 'تجاري', fr: 'Commercial', en: 'Commercial' },
    descriptions: { ar: 'مشاريع تجارية ومولات', fr: 'Projets commerciaux', en: 'Commercial projects' }
  },
  { 
    id: 'industrial', 
    icon: Factory, 
    color: 'bg-orange-500',
    names: { ar: 'صناعي', fr: 'Industriel', en: 'Industrial' },
    descriptions: { ar: 'مشاريع صناعية ومصانع', fr: 'Projets industriels', en: 'Industrial projects' }
  },
  { 
    id: 'infrastructure', 
    icon: Route, 
    color: 'bg-green-500',
    names: { ar: 'بنية تحتية', fr: 'Infrastructure', en: 'Infrastructure' },
    descriptions: { ar: 'طرق وجسور وبنية تحتية', fr: 'Routes et ponts', en: 'Roads and bridges' }
  },
  { 
    id: 'public', 
    icon: Building, 
    color: 'bg-teal-500',
    names: { ar: 'عام', fr: 'Public', en: 'Public' },
    descriptions: { ar: 'مباني عامة وخدمية', fr: 'Bâtiments publics', en: 'Public buildings' }
  },
  { 
    id: 'renovation', 
    icon: RefreshCw, 
    color: 'bg-amber-500',
    names: { ar: 'ترميم', fr: 'Rénovation', en: 'Renovation' },
    descriptions: { ar: 'ترميم وتجديد المباني', fr: 'Rénovation de bâtiments', en: 'Building renovation' }
  },
];

interface Project {
  id: string;
  title: string;
  titleAr?: string;
  titleFr?: string;
  description?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  status: string;
  category?: string;
  progress?: number;
  location?: string;
  city?: string;
  wilaya?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  images?: string[];
  createdAt: string;
  edit_token?: string;
}

const statusColors: Record<string, string> = {
  planning: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  completed: 'bg-green-500',
  on_hold: 'bg-gray-500',
};

const statusLabels: Record<string, Record<string, string>> = {
  planning: { ar: 'تخطيط', fr: 'Planification', en: 'Planning' },
  in_progress: { ar: 'قيد التنفيذ', fr: 'En cours', en: 'In Progress' },
  completed: { ar: 'مكتمل', fr: 'Terminé', en: 'Completed' },
  on_hold: { ar: 'متوقف', fr: 'En pause', en: 'On Hold' },
};

export function ProjectsSection({ onBack }: ProjectsSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.projectsSection || {
    title: { ar: 'المشاريع', fr: 'Projets', en: 'Projects' },
    subtitle: { ar: 'إدارة ومتابعة المشاريع', fr: 'Gestion des projets', en: 'Project Management' },
    allProjects: { ar: 'جميع المشاريع', fr: 'Tous les projets', en: 'All Projects' },
    allProjectsDesc: { ar: 'عرض جميع المشاريع', fr: 'Voir tous les projets', en: 'View all projects' },
    noProjects: { ar: 'لا توجد مشاريع', fr: 'Aucun projet', en: 'No projects' },
    noProjectsDesc: { ar: 'لم يتم إضافة أي مشاريع بعد', fr: 'Aucun projet ajouté', en: 'No projects added yet' },
    search: { ar: 'ابحث عن مشروع...', fr: 'Rechercher...', en: 'Search projects...' },
    progress: { ar: 'التقدم', fr: 'Progression', en: 'Progress' },
    budget: { ar: 'الميزانية', fr: 'Budget', en: 'Budget' },
    location: { ar: 'الموقع', fr: 'Localisation', en: 'Location' },
    startDate: { ar: 'تاريخ البدء', fr: 'Date de début', en: 'Start Date' },
    endDate: { ar: 'تاريخ الانتهاء', fr: 'Date de fin', en: 'End Date' },
    projectDetails: { ar: 'تفاصيل المشروع', fr: 'Détails du projet', en: 'Project Details' },
  };
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  
  // Get user's project tokens from localStorage
  const getMyProjectTokens = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('dzbuild_my_projects');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };
  
  // Check if user can modify (always true now, no code needed)
  const isProjectOwner = (project: Project): boolean => {
    const { isLoggedIn, user } = useAppStore.getState();
    if (isLoggedIn && user?.role === 'ADMIN') return true;
    return true; // Allow everyone to edit/delete
  };
  
  // Get edit token for a project
  const getProjectEditToken = (project: Project): string | undefined => {
    const myTokens = getMyProjectTokens();
    return myTokens[project.id] || project.edit_token;
  };
  
  // Handle delete project (no code required)
  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/guest/projects?id=${projectId}`, { method: 'DELETE' });
      
      if (res.ok) {
        toast.success(isRTL ? 'تم حذف المشروع' : 'Projet supprimé');
        setSelectedProject(null);
        fetchProjects();
      } else {
        const error = await res.json();
        toast.error(error.error || (isRTL ? 'خطأ في الحذف' : 'Erreur'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(isRTL ? 'خطأ' : 'Erreur');
    }
  };

  useEffect(() => {
    if (selectedCategory !== null) {
      fetchProjects();
    }
  }, [selectedCategory]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const title = project.titleAr && locale === 'ar' ? project.titleAr : 
                  project.titleFr && locale === 'fr' ? project.titleFr : 
                  project.title;
    const description = project.descriptionAr && locale === 'ar' ? project.descriptionAr :
                        project.descriptionFr && locale === 'fr' ? project.descriptionFr :
                        project.description;
    
    const matchesSearch = title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatBudget = (budget?: number) => {
    if (!budget) return '---';
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(budget) + ' دج';
  };

  // Category Selection View
  if (selectedCategory === null) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderKanban className="h-6 w-6 text-primary" />
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
          {/* All Projects Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white bg-primary">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {t.allProjects[locale]}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.allProjectsDesc[locale]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {PROJECT_CATEGORIES.map((category) => {
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

  // Project List View
  if (!selectedProject) {
    const currentCategory = PROJECT_CATEGORIES.find(c => c.id === selectedCategory);
    const CategoryIcon = currentCategory?.icon || FolderKanban;

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
          <Button className="gap-2 ml-auto" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة مشروع' : 'Ajouter'}
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
                    ? t.allProjects[locale] 
                    : currentCategory?.names[locale as 'ar' | 'fr' | 'en'] || currentCategory?.names.en
                  }
                </CardTitle>
                <CardDescription>
                  {filteredProjects.length} {locale === 'ar' ? 'مشروع' : locale === 'fr' ? 'projets' : 'projects'}
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
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t.noProjects[locale]}</p>
              <p className="text-sm text-muted-foreground mt-2">{t.noProjectsDesc[locale]}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const title = project.titleAr && locale === 'ar' ? project.titleAr : 
                            project.titleFr && locale === 'fr' ? project.titleFr : 
                            project.title;
              const category = PROJECT_CATEGORIES.find(c => c.id === project.category);
              const IconComponent = category?.icon || Building2;
              
              return (
                <Card 
                  key={project.id} 
                  className="overflow-hidden hover:shadow-lg transition-all hover:border-primary"
                >
                  {/* Cover */}
                  <div 
                    className={cn('h-20 flex items-center justify-center cursor-pointer', category?.color || 'bg-gray-500')}
                    onClick={() => setSelectedProject(project)}
                  >
                    <IconComponent className="h-8 w-8 text-white/80" />
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="font-semibold line-clamp-1 cursor-pointer" onClick={() => setSelectedProject(project)}>{title}</h3>
                      <Badge className={cn('text-white text-xs shrink-0', statusColors[project.status] || 'bg-gray-500')}>
                        {statusLabels[project.status]?.[locale] || project.status}
                      </Badge>
                    </div>
                    
                    {/* Category */}
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {category?.names[locale as 'ar' | 'fr' | 'en'] || category?.names.en}
                    </Badge>
                    
                    {/* Progress */}
                    {project.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{t.progress[locale]}</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{project.location || project.city || project.wilaya || '---'}</span>
                      </div>
                      {project.budget && (
                        <span className="font-medium">{formatBudget(project.budget)}</span>
                      )}
                    </div>
                    
                    {/* Edit/Delete Actions - Direct on card */}
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs gap-1" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditProject(project);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                        {isRTL ? 'تعديل' : 'Modifier'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Supprimer ce projet?')) {
                            handleDeleteProject(project.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                        {isRTL ? 'حذف' : 'Supprimer'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Project Dialog */}
        <AddItemDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          type="project"
          onSuccess={() => {
            fetchProjects();
          }}
        />
      </div>
    );
  }

  // Project Detail View
  const category = PROJECT_CATEGORIES.find(c => c.id === selectedProject.category);
  const IconComponent = category?.icon || Building2;
  const canModify = isProjectOwner(selectedProject);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setSelectedProject(null)} className="gap-2">
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
        {canModify && (
          <div className="ms-auto flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                <DropdownMenuItem onClick={() => setEditProject(selectedProject)}>
                  <Edit className="h-4 w-4 me-2" />
                  {isRTL ? 'تعديل' : 'Modifier'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Supprimer ce projet?')) {
                      handleDeleteProject(selectedProject.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {isRTL ? 'حذف' : 'Supprimer'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg text-white', category?.color || 'bg-primary')}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>
                {selectedProject.titleAr && locale === 'ar' ? selectedProject.titleAr : 
                 selectedProject.titleFr && locale === 'fr' ? selectedProject.titleFr : 
                 selectedProject.title}
              </CardTitle>
              <CardDescription>
                <Badge className={cn('text-white mt-1', statusColors[selectedProject.status] || 'bg-gray-500')}>
                  {statusLabels[selectedProject.status]?.[locale] || selectedProject.status}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      {selectedProject.progress !== undefined && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-4 rounded-2xl text-white", category?.color || 'bg-primary')}>
                <Timer className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{t.progress[locale]}</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">{selectedProject.progress}%</span>
                </div>
                <Progress value={selectedProject.progress} className="h-3 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Location Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.location[locale]}</p>
                <p className="font-medium">
                  {selectedProject.location || selectedProject.city || selectedProject.wilaya || '---'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.budget[locale]}</p>
                <p className="font-medium">{formatBudget(selectedProject.budget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Date */}
        {selectedProject.startDate && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.startDate[locale]}</p>
                  <p className="font-medium">
                    {new Date(selectedProject.startDate).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* End Date */}
        {selectedProject.endDate && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-100">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.endDate[locale]}</p>
                  <p className="font-medium">
                    {new Date(selectedProject.endDate).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      {(selectedProject.descriptionAr || selectedProject.descriptionFr || selectedProject.description) && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {selectedProject.descriptionAr && locale === 'ar' ? selectedProject.descriptionAr :
               selectedProject.descriptionFr && locale === 'fr' ? selectedProject.descriptionFr :
               selectedProject.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setSelectedProject(null)} className="flex-1">
          {translations.close[locale]}
        </Button>
        {canModify && (
          <Button className="gap-2 flex-1" onClick={() => setEditProject(selectedProject)}>
            <Edit className="h-4 w-4" />
            {locale === 'ar' ? 'تعديل' : locale === 'fr' ? 'Modifier' : 'Edit'}
          </Button>
        )}
      </div>
      
      {/* Comments Section */}
      <Card>
        <CardContent className="p-4">
          <CommentsSection itemType="project" itemId={selectedProject.id} />
        </CardContent>
      </Card>
      
      {/* Edit Project Dialog */}
      <AddItemDialog
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        type="project"
        editItem={editProject}
        onSuccess={() => {
          setEditProject(null);
          fetchProjects();
        }}
      />
    </div>
  );
}

export default ProjectsSection;
