'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  FolderKanban,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Loader2,
  CheckCircle2,
  Timer,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'planning', nameAr: 'تخطيط', nameFr: 'Planification', color: 'bg-blue-500' },
  { id: 'in_progress', nameAr: 'قيد التنفيذ', nameFr: 'En cours', color: 'bg-amber-500' },
  { id: 'completed', nameAr: 'مكتمل', nameFr: 'Terminé', color: 'bg-green-500' },
  { id: 'on_hold', nameAr: 'متوقف', nameFr: 'En pause', color: 'bg-gray-500' },
];

// Project Categories
const PROJECT_CATEGORIES = [
  { id: 'residential', nameAr: 'سكني', nameFr: 'Résidentiel', color: 'bg-blue-500' },
  { id: 'commercial', nameAr: 'تجاري', nameFr: 'Commercial', color: 'bg-purple-500' },
  { id: 'industrial', nameAr: 'صناعي', nameFr: 'Industriel', color: 'bg-orange-500' },
  { id: 'infrastructure', nameAr: 'بنية تحتية', nameFr: 'Infrastructure', color: 'bg-green-500' },
  { id: 'public', nameAr: 'عام', nameFr: 'Public', color: 'bg-teal-500' },
  { id: 'renovation', nameAr: 'ترميم', nameFr: 'Rénovation', color: 'bg-amber-500' },
];

// Wilayas (48)
const WILAYAS = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدينة', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان',
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
  createdAt: string;
}

export function ProjectsManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    titleFr: '',
    description: '',
    descriptionAr: '',
    descriptionFr: '',
    status: 'planning',
    category: 'residential',
    progress: 0,
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    image: '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/admin/projects');
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
    fetchProjects();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingProject ? `/api/admin/projects/${editingProject.id}` : '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
          progress: formData.progress,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (editingProject) {
          setProjects(projects.map(p => p.id === editingProject.id ? data.project : p));
        } else {
          setProjects([data.project, ...projects]);
        }
        setShowDialog(false);
        setEditingProject(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Êtes-vous sûr de vouloir supprimer ce projet?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      titleFr: '',
      description: '',
      descriptionAr: '',
      descriptionFr: '',
      status: 'planning',
      category: 'residential',
      progress: 0,
      location: '',
      budget: '',
      startDate: '',
      endDate: '',
      image: '',
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const res = await fetch('/api/upload/projects', {
        method: 'POST',
        body: formDataUpload,
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
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

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      titleAr: project.titleAr || '',
      titleFr: project.titleFr || '',
      description: project.description || '',
      descriptionAr: project.descriptionAr || '',
      descriptionFr: project.descriptionFr || '',
      status: project.status,
      category: project.category || 'residential',
      progress: project.progress || 0,
      location: project.location || project.city || project.wilaya || '',
      budget: project.budget?.toString() || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      image: project.images || '',
    });
    setShowDialog(true);
  };

  const filteredProjects = projects.filter(project => {
    const title = project.titleAr && locale === 'ar' ? project.titleAr : 
                  project.titleFr && locale === 'fr' ? project.titleFr : 
                  project.title;
    const matchesSearch = title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (statusId: string) => {
    return STATUS_OPTIONS.find(s => s.id === statusId);
  };

  const getCategoryInfo = (categoryId: string) => {
    return PROJECT_CATEGORIES.find(c => c.id === categoryId);
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return '-';
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(budget) + ' دج';
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{isRTL ? 'إدارة المشاريع' : 'Gestion des projets'}</h3>
            <p className="text-sm text-muted-foreground">
              {filteredProjects.length} {isRTL ? 'مشروع' : 'projets'}
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setEditingProject(null); setShowDialog(true); }}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة مشروع' : 'Ajouter'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FolderKanban className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي المشاريع' : 'Total projets'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Timer className="h-5 w-5 mx-auto mb-2 text-amber-500" />
            <p className="text-xl font-bold">{stats.active}</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'مشاريع نشطة' : 'Projets actifs'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
            <p className="text-xl font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'مشاريع مكتملة' : 'Terminés'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input
            placeholder={isRTL ? "بحث عن مشروع..." : "Rechercher..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? "pr-10" : "pl-10"}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={isRTL ? "الحالة" : "Statut"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? "الكل" : "Tout"}</SelectItem>
            {STATUS_OPTIONS.map(status => (
              <SelectItem key={status.id} value={status.id}>
                {isRTL ? status.nameAr : status.nameFr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {isRTL ? 'لا توجد مشاريع' : 'Aucun projet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {isRTL ? 'أضف مشروعك الأول للبدء' : 'Ajoutez votre premier projet pour commencer'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 text-start font-medium">{isRTL ? 'المشروع' : 'Projet'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'القسم' : 'Catégorie'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'التقدم' : 'Progression'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'الموقع' : 'Lieu'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'الميزانية' : 'Budget'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'الحالة' : 'Statut'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => {
                    const status = getStatusInfo(project.status);
                    const category = getCategoryInfo(project.category || 'residential');
                    const title = project.titleAr && locale === 'ar' ? project.titleAr : 
                                  project.titleFr && locale === 'fr' ? project.titleFr : 
                                  project.title;
                    return (
                      <tr key={project.id} className="border-t">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{title}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("gap-1", category?.color?.replace('bg-', 'border-'))}>
                            <span className={cn('w-2 h-2 rounded-full', category?.color)}></span>
                            {isRTL ? category?.nameAr : category?.nameFr}
                          </Badge>
                        </td>
                        <td className="p-4 w-40">
                          <div className="space-y-1">
                            <Progress value={project.progress || 0} className="h-2" />
                            <p className="text-xs text-muted-foreground text-center">{project.progress || 0}%</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {project.location || project.city || project.wilaya || '-'}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {formatBudget(project.budget)}
                        </td>
                        <td className="p-4">
                          <Badge className={cn("text-white", status?.color)}>
                            {isRTL ? status?.nameAr : status?.nameFr}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(project.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? (isRTL ? 'تعديل مشروع' : 'Modifier') : (isRTL ? 'إضافة مشروع جديد' : 'Nouveau projet')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'اسم المشروع' : 'Nom du projet'}</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'العنوان بالعربية' : 'Titre (Arabe)'}</label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({...formData, titleAr: e.target.value})}
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'العنوان بالفرنسية' : 'Titre (Français)'}</label>
              <Input
                value={formData.titleFr}
                onChange={(e) => setFormData({...formData, titleFr: e.target.value})}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'الوصف' : 'Description'}</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'الموقع' : 'Lieu'}</label>
              <Select value={formData.location} onValueChange={(v) => setFormData({...formData, location: v})}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر الموقع" : "Choisir"} />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'الحالة' : 'Statut'}</label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      {isRTL ? status.nameAr : status.nameFr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'القسم' : 'Catégorie'}</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', cat.color)}></span>
                        {isRTL ? cat.nameAr : cat.nameFr}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'التقدم (%)' : 'Progression (%)'}</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'الميزانية (دج)' : 'Budget (DZD)'}</label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'تاريخ البدء' : 'Date de début'}</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'تاريخ الانتهاء' : 'Date de fin'}</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {isRTL ? 'صورة المشروع' : 'Image du projet'}
            </label>
            
            {/* Image Preview */}
            {formData.image ? (
              <div className="relative inline-block">
                <img 
                  src={formData.image + (formData.image.startsWith('/') ? '?t=' + Date.now() : '')} 
                  alt="Project" 
                  className="w-full max-w-xs h-40 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 end-2 h-6 w-6 p-0"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
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
                    {isRTL ? 'جاري الرفع...' : 'Envoi en cours...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {isRTL ? 'رفع صورة' : 'Télécharger'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {isRTL ? 'إلغاء' : 'Annuler'}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
              {editingProject ? (isRTL ? 'حفظ التغييرات' : 'Enregistrer') : (isRTL ? 'إضافة' : 'Ajouter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
