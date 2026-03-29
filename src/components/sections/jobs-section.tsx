'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Home,
  ChevronLeft,
  X,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
  PenTool,
  Building2,
  HardHat,
  Zap,
  Pencil,
  FileText,
  Award,
  DollarSign,
  Sparkles,
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

// Job categories with icons and gradients
const JOB_CATEGORIES = [
  { 
    id: 'engineering', 
    icon: PenTool, 
    gradient: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-100',
    textColor: 'text-violet-600',
    nameAr: 'هندسة',
    nameFr: 'Ingénierie',
    shortNameAr: 'هندسة',
    shortNameFr: 'Ingénierie',
  },
  { 
    id: 'architecture', 
    icon: Building2, 
    gradient: 'from-cyan-500 to-blue-500',
    bgLight: 'bg-cyan-100',
    textColor: 'text-cyan-600',
    nameAr: 'عمارة',
    nameFr: 'Architecture',
    shortNameAr: 'عمارة',
    shortNameFr: 'Architecture',
  },
  { 
    id: 'construction', 
    icon: HardHat, 
    gradient: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-100',
    textColor: 'text-orange-600',
    nameAr: 'بناء',
    nameFr: 'Construction',
    shortNameAr: 'بناء',
    shortNameFr: 'Construction',
  },
  { 
    id: 'electrical', 
    icon: Zap, 
    gradient: 'from-yellow-500 to-amber-500',
    bgLight: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    nameAr: 'كهرباء',
    nameFr: 'Électricité',
    shortNameAr: 'كهرباء',
    shortNameFr: 'Électricité',
  },
  { 
    id: 'management', 
    icon: Briefcase, 
    gradient: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-100',
    textColor: 'text-green-600',
    nameAr: 'إدارة',
    nameFr: 'Management',
    shortNameAr: 'إدارة',
    shortNameFr: 'Management',
  },
  { 
    id: 'draftsman', 
    icon: Pencil, 
    gradient: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-100',
    textColor: 'text-pink-600',
    nameAr: 'رسم',
    nameFr: 'Dessinateur',
    shortNameAr: 'رسم',
    shortNameFr: 'Dessinateur',
  },
  { 
    id: 'other', 
    icon: FileText, 
    gradient: 'from-gray-500 to-slate-500',
    bgLight: 'bg-gray-100',
    textColor: 'text-gray-600',
    nameAr: 'أخرى',
    nameFr: 'Autre',
    shortNameAr: 'أخرى',
    shortNameFr: 'Autre',
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

// Experience levels
const EXPERIENCE_LEVELS = [
  { id: 'entry', nameAr: 'مبتدئ (0-1 سنة)', nameFr: 'Débutant (0-1 an)' },
  { id: 'junior', nameAr: 'مبتدئ (1-3 سنوات)', nameFr: 'Junior (1-3 ans)' },
  { id: 'mid', nameAr: 'متوسط (3-5 سنوات)', nameFr: 'Intermédiaire (3-5 ans)' },
  { id: 'senior', nameAr: 'خبير (5+ سنوات)', nameFr: 'Senior (5+ ans)' },
];

interface Job {
  id: string;
  title: string;
  description?: string;
  category: string;
  company_name: string;
  company_logo?: string;
  wilaya?: string;
  city?: string;
  experience_level?: string;
  experience_required?: string;
  salary_range?: string;
  job_type?: string;
  application_method?: string;
  contact_email?: string;
  contact_phone?: string;
  deadline?: string;
  requirements?: string[];
  benefits?: string[];
  is_featured?: boolean;
  views_count?: number;
  applications_count?: number;
  created_at: string;
  edit_token?: string;
}

interface JobsSectionProps {
  onBack?: () => void;
}

export function JobsSection({ onBack }: JobsSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  
  // Get user's job tokens from localStorage
  const getMyJobTokens = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('dzbuild_my_jobs');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };
  
  // Check if user owns a job
  const isJobOwner = (job: Job): boolean => {
    const { isLoggedIn, user } = useAppStore.getState();
    if (isLoggedIn && user?.role === 'ADMIN') return true;
    const myTokens = getMyJobTokens();
    return !!myTokens[job.id] || !!job.edit_token;
  };
  
  // Get edit token for a job
  const getJobEditToken = (job: Job): string | undefined => {
    const myTokens = getMyJobTokens();
    return myTokens[job.id] || job.edit_token;
  };
  
  // Handle delete job
  const handleDeleteJob = async (jobId: string) => {
    try {
      const { isLoggedIn, user } = useAppStore.getState();
      const myTokens = getMyJobTokens();
      const editToken = myTokens[jobId] || (selectedJob && getJobEditToken(selectedJob));
      const isAdmin = isLoggedIn && user?.role === 'ADMIN';
      
      const url = `/api/guest/jobs?id=${jobId}${editToken ? `&editToken=${editToken}` : ''}&isAdmin=${isAdmin}`;
      const res = await fetch(url, { method: 'DELETE' });
      
      if (res.ok) {
        // Remove from localStorage
        const tokens = getMyJobTokens();
        delete tokens[jobId];
        localStorage.setItem('dzbuild_my_jobs', JSON.stringify(tokens));
        
        toast.success(isRTL ? 'تم حذف الوظيفة' : 'Offre supprimée');
        setSelectedJob(null);
        fetchJobs();
      } else {
        const error = await res.json();
        toast.error(error.error || (isRTL ? 'خطأ في الحذف' : 'Erreur'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(isRTL ? 'خطأ' : 'Erreur');
    }
  };

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, selectedWilaya, selectedExperience]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedWilaya) {
        params.append('wilaya', selectedWilaya);
      }
      if (selectedExperience) {
        params.append('experience', selectedExperience);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
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

  // Handle search
  const handleSearch = () => {
    fetchJobs();
  };

  // Filter jobs by search
  const filteredJobs = jobs.filter(j => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        j.title?.toLowerCase().includes(query) ||
        j.company_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return JOB_CATEGORIES.find(c => c.id === categoryId) || JOB_CATEGORIES[6]; // Default to 'other'
  };

  // Get experience info
  const getExperienceInfo = (expId: string) => {
    return EXPERIENCE_LEVELS.find(e => e.id === expId);
  };

  // Get time ago
  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return isRTL ? `${hours} ساعة` : `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return isRTL ? `${days} يوم` : `${days}j`;
    const weeks = Math.floor(days / 7);
    return isRTL ? `${weeks} أسبوع` : `${weeks}sem`;
  };

  // Get days until deadline
  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return isRTL ? 'منتهي' : 'Expiré';
    if (days === 0) return isRTL ? 'آخر يوم' : 'Dernier jour';
    return isRTL ? `${days} يوم متبقي` : `${days} jours restants`;
  };

  // Render job card
  const renderJobCard = (job: Job) => {
    const category = getCategoryInfo(job.category);
    const IconComponent = category.icon;
    const daysLeft = getDaysUntilDeadline(job.deadline);
    
    return (
      <Card 
        key={job.id} 
        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-primary/20"
        onClick={() => setSelectedJob(job)}
      >
        {/* Cover with Gradient */}
        <div className={cn("h-20 relative bg-gradient-to-br", category.gradient)}>
          <div className="absolute inset-0 bg-black/5" />
          {job.is_featured && (
            <Badge className="absolute top-2 right-2 bg-white/90 text-amber-600 border-0 shadow-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              {locale === 'ar' ? 'مميز' : 'Premium'}
            </Badge>
          )}
          {daysLeft && (daysLeft.includes('منتهي') || daysLeft.includes('Expiré')) && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 shadow-sm">
              {locale === 'ar' ? 'منتهي' : 'Expiré'}
            </Badge>
          )}
          <div className="absolute -bottom-6 right-4 w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center border-3 border-white group-hover:scale-110 transition-transform">
            <IconComponent className="h-5 w-5 text-gray-700" />
          </div>
        </div>
        
        <CardContent className="pt-8 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{job.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{job.company_name}</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="mb-2 text-xs">
            {locale === 'ar' ? category.shortNameAr : category.shortNameFr}
          </Badge>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="truncate">{job.city || job.wilaya || '-'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getTimeAgo(job.created_at)}</span>
            </div>
          </div>
          
          {/* Deadline Badge */}
          {daysLeft && !daysLeft.includes('منتهي') && !daysLeft.includes('Expiré') && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {daysLeft}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Job Detail View
  if (selectedJob) {
    const categoryInfo = getCategoryInfo(selectedJob.category);
    const IconComponent = categoryInfo.icon;
    const expInfo = getExperienceInfo(selectedJob.experience_level || '');
    const daysLeft = getDaysUntilDeadline(selectedJob.deadline);
    const canModify = isJobOwner(selectedJob);
    
    return (
      <div className="space-y-6">
        {/* Back Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedJob(null)} className="gap-2 hover:bg-primary/10">
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
                  <DropdownMenuItem onClick={() => setEditJob(selectedJob)}>
                    <Edit className="h-4 w-4 me-2" />
                    {isRTL ? 'تعديل' : 'Modifier'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => {
                      if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه الوظيفة؟' : 'Supprimer cette offre?')) {
                        handleDeleteJob(selectedJob.id);
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
        
        {/* Job Header Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className={cn("h-36 relative bg-gradient-to-br", categoryInfo.gradient)}>
            <div className="absolute inset-0 bg-black/5" />
            {selectedJob.is_featured && (
              <Badge className="absolute top-4 right-4 bg-white/90 text-amber-600 border-0 shadow-sm">
                <Sparkles className="h-4 w-4 mr-1" />
                {locale === 'ar' ? 'وظيفة مميزة' : 'Offre Premium'}
              </Badge>
            )}
            <div className="absolute -bottom-10 right-6 w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
              <IconComponent className="h-10 w-10 text-gray-700" />
            </div>
          </div>
          <CardContent className="pt-14 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{selectedJob.title}</h1>
                </div>
                <p className="text-muted-foreground text-lg">{selectedJob.company_name}</p>
                <Badge variant="secondary" className="mt-2">
                  {locale === 'ar' ? categoryInfo.nameAr : categoryInfo.nameFr}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Experience Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-xl", categoryInfo.bgLight)}>
                  <Briefcase className={cn("h-5 w-5", categoryInfo.textColor)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'الخبرة المطلوبة' : 'Expérience requise'}
                  </p>
                  <p className="font-medium">
                    {expInfo ? (locale === 'ar' ? expInfo.nameAr : expInfo.nameFr) : selectedJob.experience_required || (locale === 'ar' ? 'غير محدد' : 'Non spécifié')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'الموقع' : 'Localisation'}
                  </p>
                  <p className="font-medium">{selectedJob.city || '-'} {selectedJob.wilaya ? `(${selectedJob.wilaya})` : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Card */}
          {selectedJob.salary_range && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-green-100">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'الراتب' : 'Salaire'}
                    </p>
                    <p className="font-medium">{selectedJob.salary_range}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deadline Card */}
          {selectedJob.deadline && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", daysLeft && (daysLeft.includes('منتهي') || daysLeft.includes('Expiré')) ? "bg-red-100" : "bg-orange-100")}>
                    <Calendar className={cn("h-5 w-5", daysLeft && (daysLeft.includes('منتهي') || daysLeft.includes('Expiré')) ? "text-red-600" : "text-orange-600")} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'آخر موعد' : 'Date limite'}
                    </p>
                    <p className={cn("font-medium", daysLeft && (daysLeft.includes('منتهي') || daysLeft.includes('Expiré')) && "text-red-500")}>
                      {new Date(selectedJob.deadline).toLocaleDateString('ar-DZ')}
                    </p>
                    {daysLeft && (
                      <p className={cn("text-xs", daysLeft.includes('منتهي') || daysLeft.includes('Expiré') ? "text-red-500" : "text-muted-foreground")}>
                        {daysLeft}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        {selectedJob.description && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {locale === 'ar' ? 'وصف الوظيفة' : 'Description du poste'}
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
            </CardContent>
          </Card>
        )}
        
        {/* Requirements */}
        {selectedJob.requirements && selectedJob.requirements.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {locale === 'ar' ? 'المتطلبات' : 'Exigences'}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Application Method */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-card to-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {locale === 'ar' ? 'طريقة التقديم' : 'Comment postuler'}
            </h3>
            {selectedJob.application_method === 'email' && selectedJob.contact_email && (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  {locale === 'ar' ? 'أرسل سيرتك الذاتية إلى:' : 'Envoyez votre CV à:'}
                </p>
                <Button size="lg" className="gap-2" asChild>
                  <a href={`mailto:${selectedJob.contact_email}?subject=${encodeURIComponent(selectedJob.title)}`}>
                    <Mail className="h-5 w-5" />
                    {selectedJob.contact_email}
                  </a>
                </Button>
              </div>
            )}
            {selectedJob.application_method === 'phone' && selectedJob.contact_phone && (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  {locale === 'ar' ? 'اتصل على الرقم:' : 'Appelez le:'}
                </p>
                <Button size="lg" className="gap-2" asChild>
                  <a href={`tel:${selectedJob.contact_phone}`}>
                    <Phone className="h-5 w-5" />
                    {selectedJob.contact_phone}
                  </a>
                </Button>
              </div>
            )}
            {selectedJob.application_method === 'link' && (
              <Button size="lg" className="gap-2" asChild>
                <a href={selectedJob.contact_email} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-5 w-5" />
                  {locale === 'ar' ? 'تقديم الآن' : 'Postuler maintenant'}
                </a>
              </Button>
            )}
            {!selectedJob.application_method && selectedJob.contact_email && (
              <Button size="lg" className="gap-2" asChild>
                <a href={`mailto:${selectedJob.contact_email}?subject=${encodeURIComponent(selectedJob.title)}`}>
                  <Mail className="h-5 w-5" />
                  {locale === 'ar' ? 'إرسال السيرة الذاتية' : 'Envoyer le CV'}
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* Comments Section */}
        <Card>
          <CardContent className="p-4">
            <CommentsSection itemType="job" itemId={selectedJob.id} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            {locale === 'ar' ? 'وظائف البناء' : 'Emplois BTP'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'ar' ? 'منصة توظيف للمهندسين والعمال' : 'Plateforme de recrutement pour ingénieurs et ouvriers'}
          </p>
        </div>
        <div className="flex gap-2">
          {onBack && (
            <Button variant="default" onClick={onBack} className="gap-2 shadow-lg shadow-primary/20">
              <Home className="h-4 w-4" />
              {translations.home[locale]}
            </Button>
          )}
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            {isRTL ? 'نشر وظيفة' : 'Publier'}
          </Button>
        </div>
      </div>

      {/* Job Categories - Beautiful Circles */}
      <div className="relative">
        <div className="flex justify-center gap-3 sm:gap-4 py-4 overflow-x-auto scrollbar-hide">
          {/* All Jobs Button */}
          <button
            onClick={() => setSelectedCategory('all')}
            className="flex flex-col items-center gap-2 group shrink-0"
          >
            <div className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
              selectedCategory === 'all' 
                ? "bg-gradient-to-br from-primary to-primary/80 scale-110 shadow-primary/30" 
                : "bg-muted hover:bg-primary/10 hover:scale-105"
            )}>
              <Briefcase className={cn(
                "h-6 w-6 sm:h-7 sm:w-7 transition-colors",
                selectedCategory === 'all' ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              )} />
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors",
              selectedCategory === 'all' ? "text-primary" : "text-muted-foreground"
            )}>
              {locale === 'ar' ? 'الكل' : 'Tout'}
            </span>
          </button>

          {/* Category Buttons */}
          {JOB_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="flex flex-col items-center gap-2 group shrink-0"
              >
                <div className={cn(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                  isSelected 
                    ? `bg-gradient-to-br ${category.gradient} scale-110 shadow-lg` 
                    : `${category.bgLight} hover:scale-105`
                )}>
                  <IconComponent className={cn(
                    "h-6 w-6 sm:h-7 sm:w-7 transition-colors",
                    isSelected ? "text-white" : category.textColor
                  )} />
                </div>
                <span className={cn(
                  "text-xs font-medium transition-colors text-center max-w-[60px]",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {locale === 'ar' ? category.shortNameAr : category.shortNameFr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filters - Clean Design */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-card to-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground", isRTL ? "right-4" : "left-4")} />
              <Input
                placeholder={locale === 'ar' ? "ابحث عن وظيفة..." : "Rechercher un emploi..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className={cn("h-12 text-base bg-background", isRTL ? "pr-12" : "pl-12")}
              />
            </div>
            
            {/* Wilaya Filter */}
            <Select value={selectedWilaya || "all"} onValueChange={(v) => setSelectedWilaya(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full lg:w-[180px] h-12 bg-background">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder={locale === 'ar' ? "الولاية" : "Wilaya"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'ar' ? "كل الولايات" : "Toutes"}</SelectItem>
                {WILAYAS.map(w => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Experience Filter */}
            <Select value={selectedExperience || "all"} onValueChange={(v) => setSelectedExperience(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full lg:w-[180px] h-12 bg-background">
                <Briefcase className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder={locale === 'ar' ? "الخبرة" : "Expérience"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'ar' ? "الكل" : "Tout"}</SelectItem>
                {EXPERIENCE_LEVELS.map(exp => (
                  <SelectItem key={exp.id} value={exp.id}>{locale === 'ar' ? exp.nameAr : exp.nameFr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Search Button */}
            <Button onClick={handleSearch} className="h-12 px-6 gap-2 shadow-lg shadow-primary/20">
              <Search className="h-5 w-5" />
              {translations.search[locale]}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center gap-2 px-1">
        <Badge variant="secondary" className="py-1.5 px-3">
          {filteredJobs.length} {locale === 'ar' ? 'وظيفة' : 'offres'}
        </Badge>
        {(selectedCategory !== 'all' || selectedWilaya || selectedExperience) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedCategory('all');
              setSelectedWilaya('');
              setSelectedExperience('');
              setSearchQuery('');
            }}
            className="text-primary hover:bg-primary/10"
          >
            <X className="h-3 w-3 mr-1" />
            {translations.clearFilters[locale]}
          </Button>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map(renderJobCard)}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {locale === 'ar' ? "لا توجد وظائف" : "Aucune offre d'emploi"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {locale === 'ar' 
                ? "جرب تغيير معايير البحث أو الفلاتر" 
                : "Essayez de modifier vos critères de recherche"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedWilaya('');
                setSelectedExperience('');
                setSearchQuery('');
              }}
            >
              {translations.clearFilters[locale]}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Job Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        type="job"
        onSuccess={() => {
          fetchJobs();
        }}
      />
      
      {/* Edit Job Dialog */}
      <AddItemDialog
        open={!!editJob}
        onOpenChange={(open) => !open && setEditJob(null)}
        type="job"
        editItem={editJob}
        onSuccess={() => {
          setEditJob(null);
          fetchJobs();
        }}
      />
    </div>
  );
}

export default JobsSection;
