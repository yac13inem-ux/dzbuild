'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Job categories
const JOB_CATEGORIES = [
  { id: 'engineers', nameAr: 'وظائف مهندسين', nameFr: 'Emplois Ingénieurs' },
  { id: 'technicians', nameAr: 'وظائف تقنيين', nameFr: 'Emplois Techniciens' },
  { id: 'workers', nameAr: 'وظائف عمال', nameFr: 'Emplois Ouvriers' },
  { id: 'internships', nameAr: 'تدريب للطلبة', nameFr: 'Stages Étudiants' },
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

const JOB_TYPES = [
  { id: 'full_time', nameAr: 'دوام كامل', nameFr: 'Temps plein' },
  { id: 'part_time', nameAr: 'دوام جزئي', nameFr: 'Temps partiel' },
  { id: 'contract', nameAr: 'عقد', nameFr: 'Contrat' },
  { id: 'freelance', nameAr: 'حر', nameFr: 'Freelance' },
];

interface Job {
  id: string;
  title: string;
  description?: string;
  category: string;
  company_name: string;
  wilaya?: string;
  city?: string;
  experience_level?: string;
  salary_range?: string;
  job_type?: string;
  contact_email?: string;
  contact_phone?: string;
  deadline?: string;
  status: string;
  is_featured: boolean;
  views_count: number;
  created_at: string;
}

export function JobsManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'engineers',
    company_name: '',
    wilaya: '',
    city: '',
    experience_level: '',
    salary_range: '',
    job_type: 'full_time',
    contact_email: '',
    contact_phone: '',
    deadline: '',
    is_featured: false,
  });

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowDialog(false);
        setEditingJob(null);
        resetForm();
        fetchJobs();
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه الوظيفة؟' : 'Êtes-vous sûr de vouloir supprimer cette offre?')) {
      return;
    }
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleToggleStatus = async (job: Job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchJobs();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'engineers',
      company_name: '',
      wilaya: '',
      city: '',
      experience_level: '',
      salary_range: '',
      job_type: 'full_time',
      contact_email: '',
      contact_phone: '',
      deadline: '',
      is_featured: false,
    });
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      category: job.category,
      company_name: job.company_name,
      wilaya: job.wilaya || '',
      city: job.city || '',
      experience_level: job.experience_level || '',
      salary_range: job.salary_range || '',
      job_type: job.job_type || 'full_time',
      contact_email: job.contact_email || '',
      contact_phone: job.contact_phone || '',
      deadline: job.deadline ? job.deadline.split('T')[0] : '',
      is_featured: job.is_featured,
    });
    setShowDialog(true);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (catId: string) => {
    const cat = JOB_CATEGORIES.find(c => c.id === catId);
    return isRTL ? cat?.nameAr : cat?.nameFr;
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return isRTL ? 'اليوم' : "Aujourd'hui";
    if (days < 7) return isRTL ? `${days} يوم` : `${days} jours`;
    return isRTL ? `${Math.floor(days / 7)} أسبوع` : `${Math.floor(days / 7)} sem.`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{isRTL ? 'إدارة الوظائف' : 'Gestion des emplois'}</h3>
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length} {isRTL ? 'وظيفة' : 'offres'}
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setEditingJob(null); setShowDialog(true); }}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة وظيفة' : 'Ajouter'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input
            placeholder={isRTL ? "بحث عن وظيفة..." : "Rechercher..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? "pr-10" : "pl-10"}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={isRTL ? "القسم" : "Catégorie"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? "الكل" : "Tout"}</SelectItem>
            {JOB_CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {isRTL ? cat.nameAr : cat.nameFr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 text-start font-medium">{isRTL ? 'الوظيفة' : 'Offre'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'القسم' : 'Catégorie'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'الموقع' : 'Lieu'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'الحالة' : 'Statut'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-t">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.company_name}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{getCategoryName(job.category)}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {job.city || job.wilaya || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={cn(
                            "cursor-pointer",
                            job.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                          )}
                          onClick={() => handleToggleStatus(job)}
                        >
                          {job.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'مغلق' : 'Fermée')}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(job.created_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(job)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(job.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد وظائف' : 'Aucune offre'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? (isRTL ? 'تعديل وظيفة' : 'Modifier') : (isRTL ? 'إضافة وظيفة جديدة' : 'Nouvelle offre')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'عنوان الوظيفة' : 'Titre du poste'}</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={isRTL ? "مثال: مهندس مدني" : "Ex: Ingénieur civil"}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'اسم الشركة' : 'Nom de l\'entreprise'}</label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'القسم' : 'Catégorie'}</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {isRTL ? cat.nameAr : cat.nameFr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'الولاية' : 'Wilaya'}</label>
              <Select value={formData.wilaya} onValueChange={(v) => setFormData({...formData, wilaya: v})}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر الولاية" : "Choisir"} />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'المدينة' : 'Ville'}</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'نوع العمل' : 'Type d\'emploi'}</label>
              <Select value={formData.job_type} onValueChange={(v) => setFormData({...formData, job_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {isRTL ? type.nameAr : type.nameFr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'نطاق الراتب' : 'Salaire'}</label>
              <Input
                value={formData.salary_range}
                onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                placeholder="50000-80000 DA"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'الهاتف' : 'Téléphone'}</label>
              <Input
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'آخر موعد' : 'Date limite'}</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">{isRTL ? 'الوصف' : 'Description'}</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {isRTL ? 'إلغاء' : 'Annuler'}
            </Button>
            <Button onClick={handleSave}>
              {editingJob ? (isRTL ? 'حفظ التغييرات' : 'Enregistrer') : (isRTL ? 'إضافة' : 'Ajouter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
