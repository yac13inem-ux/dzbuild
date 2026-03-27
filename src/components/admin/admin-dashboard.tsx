'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Users,
  Building2,
  Wrench,
  FileText,
  TrendingUp,
  Bell,
  PieChart,
  MapPin,
  Eye,
  Trash2,
  Edit,
  Search,
  Filter,
  Download,
  RefreshCw,
  LogOut,
  Plus,
  Loader2,
  Megaphone,
  BookOpen,
  Briefcase,
  MessageCircle,
  FolderKanban,
  Settings,
  Shield,
  ShoppingCart,
  LayoutDashboard,
  Activity,
  UserCheck,
  UserX,
  Pin,
  PinOff,
  Globe,
  Moon,
  Sun,
  ChevronLeft,
  Menu,
  X,
  BarChart3,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Package,
  Star,
  ExternalLink,
  MoreVertical,
  HelpCircle,
} from 'lucide-react';
import { AdsManager } from './ads-manager';
import { CompaniesManager } from './companies-manager';
import { LibraryManager } from './library-manager';
import { JobsManager } from './jobs-manager';
import { ProjectsManager } from './projects-manager';
import { CraftsmenManager } from './craftsmen-manager';
import { MarketManager } from './market-manager';
import { QuestionsManager } from './questions-manager';

const roleColors: Record<string, string> = {
  CIVIL_ENGINEER: 'bg-blue-500',
  CONTRACTOR: 'bg-orange-500',
  ENGINEERING_OFFICE: 'bg-purple-500',
  CRAFTSMAN: 'bg-amber-500',
  CONSTRUCTION_COMPANY: 'bg-green-500',
  STORE_FACTORY: 'bg-cyan-500',
  NORMAL_USER: 'bg-gray-500',
  ADMIN: 'bg-red-500',
};

const roleLabelsAr: Record<string, string> = {
  CIVIL_ENGINEER: 'مهندس مدني',
  CONTRACTOR: 'مقاول',
  ENGINEERING_OFFICE: 'مكتب دراسات',
  CRAFTSMAN: 'حرفي',
  CONSTRUCTION_COMPANY: 'شركة بناء',
  STORE_FACTORY: 'متجر / مصنع',
  NORMAL_USER: 'مستخدم',
  ADMIN: 'مدير',
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  city?: string;
  wilaya?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at: string;
}

interface Post {
  id: string;
  title?: string;
  content: string;
  post_type: string;
  status?: string;
  author_id: string;
  created_at: string;
  profiles?: {
    name: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalCraftsmen: number;
  totalCompanies: number;
  totalJobs: number;
  totalProjects: number;
  pendingUsers: number;
  pendingPosts: number;
}

export function AdminDashboard() {
  const { user, locale, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalCraftsmen: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalProjects: 0,
    pendingUsers: 0,
    pendingPosts: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const isRTL = locale === 'ar';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        
        const totalUsers = usersData.users?.length || 0;
        const totalCraftsmen = usersData.users?.filter((u: UserProfile) => u.role === 'CRAFTSMAN').length || 0;
        const totalCompanies = usersData.users?.filter((u: UserProfile) => 
          u.role === 'CONSTRUCTION_COMPANY' || u.role === 'STORE_FACTORY'
        ).length || 0;
        const pendingUsers = usersData.users?.filter((u: UserProfile) => !u.is_verified).length || 0;
        
        setStats(prev => ({
          ...prev,
          totalUsers,
          totalCraftsmen,
          totalCompanies,
          pendingUsers,
        }));
      }

      const postsRes = await fetch('/api/admin/posts');
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
        setStats(prev => ({
          ...prev,
          totalPosts: postsData.posts?.length || 0,
        }));
      }

      // Fetch additional stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({
          ...prev,
          totalJobs: statsData.stats?.jobsCount || 0,
          totalProjects: statsData.stats?.projectsCount || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !ban }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handlePinPost = async (postId: string, pin: boolean) => {
    try {
      await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: pin }),
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنشور؟' : 'Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: LayoutDashboard, gradient: 'from-primary to-primary/70' },
    { id: 'users', label: isRTL ? 'المستخدمين' : 'Users', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'companies', label: isRTL ? 'الشركات' : 'Companies', icon: Building2, gradient: 'from-green-500 to-emerald-500' },
    { id: 'craftsmen', label: isRTL ? 'الحرفيين' : 'Craftsmen', icon: Wrench, gradient: 'from-amber-500 to-orange-500' },
    { id: 'posts', label: isRTL ? 'المنشورات' : 'Posts', icon: FileText, gradient: 'from-pink-500 to-rose-500' },
    { id: 'questions', label: isRTL ? 'الأسئلة الهندسية' : 'Questions', icon: HelpCircle, gradient: 'from-indigo-500 to-purple-500' },
    { id: 'library', label: isRTL ? 'المكتبة' : 'Library', icon: BookOpen, gradient: 'from-red-500 to-orange-500' },
    { id: 'market', label: isRTL ? 'السوق' : 'Market', icon: ShoppingCart, gradient: 'from-cyan-500 to-blue-500' },
    { id: 'jobs', label: isRTL ? 'الوظائف' : 'Jobs', icon: Briefcase, gradient: 'from-orange-500 to-red-500' },
    { id: 'projects', label: isRTL ? 'المشاريع' : 'Projects', icon: FolderKanban, gradient: 'from-teal-500 to-cyan-500' },
    { id: 'ads', label: isRTL ? 'الإعلانات' : 'Ads', icon: Megaphone, gradient: 'from-purple-500 to-pink-500' },
    { id: 'settings', label: isRTL ? 'الإعدادات' : 'Settings', icon: Settings, gradient: 'from-gray-500 to-slate-500' },
  ];

  const statItems = [
    { 
      label: isRTL ? 'المستخدمين' : 'Users', 
      value: stats.totalUsers, 
      icon: Users, 
      gradient: 'from-blue-500 to-cyan-500',
      change: '+12%',
      changeType: 'up'
    },
    { 
      label: isRTL ? 'الشركات' : 'Companies', 
      value: stats.totalCompanies, 
      icon: Building2, 
      gradient: 'from-green-500 to-emerald-500',
      change: '+8%',
      changeType: 'up'
    },
    { 
      label: isRTL ? 'الحرفيين' : 'Craftsmen', 
      value: stats.totalCraftsmen, 
      icon: Wrench, 
      gradient: 'from-amber-500 to-orange-500',
      change: '+15%',
      changeType: 'up'
    },
    { 
      label: isRTL ? 'المنشورات' : 'Posts', 
      value: stats.totalPosts, 
      icon: FileText, 
      gradient: 'from-pink-500 to-rose-500',
      change: '+23%',
      changeType: 'up'
    },
    { 
      label: isRTL ? 'الوظائف' : 'Jobs', 
      value: stats.totalJobs, 
      icon: Briefcase, 
      gradient: 'from-orange-500 to-red-500',
      change: '+5%',
      changeType: 'up'
    },
    { 
      label: isRTL ? 'المشاريع' : 'Projects', 
      value: stats.totalProjects, 
      icon: FolderKanban, 
      gradient: 'from-teal-500 to-cyan-500',
      change: '+10%',
      changeType: 'up'
    },
  ];

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Settings State
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    emailVerification: true,
    darkMode: false,
    language: 'ar',
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 z-40 w-72 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-white/10 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DzBuild</h1>
              <p className="text-xs text-slate-400">{isRTL ? 'لوحة التحكم' : 'Admin Panel'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  activeTab === tab.id 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all",
                  activeTab === tab.id 
                    ? "bg-white/20" 
                    : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <tab.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
            <Avatar className="h-10 w-10 ring-2 ring-primary/50">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className={cn('text-white text-sm', roleColors[user?.role || 'ADMIN'])}>
                {user?.name ? getInitials(user.name) : 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {isRTL ? 'تسجيل الخروج' : 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl bg-gradient-to-br",
                  tabs.find(t => t.id === activeTab)?.gradient
                )}>
                  {(() => {
                    const tab = tabs.find(t => t.id === activeTab);
                    if (tab) {
                      const Icon = tab.icon;
                      return <Icon className="h-5 w-5 text-white" />;
                    }
                    return null;
                  })()}
                </div>
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                {isRTL ? 'مرحباً بك في لوحة التحكم' : 'Welcome to the admin dashboard'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                {(stats.pendingUsers + stats.pendingPosts) > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {stats.pendingUsers + stats.pendingPosts}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="gap-2 text-slate-400 hover:text-white hover:bg-white/10"
                onClick={fetchDashboardData}
              >
                <RefreshCw className="h-4 w-4" />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-slate-400">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {statItems.map((stat, i) => (
                      <Card 
                        key={i} 
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 overflow-hidden group hover:scale-105 transition-transform duration-300"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                              <p className="text-3xl font-bold text-white">{stat.value}</p>
                              <div className={cn(
                                "flex items-center gap-1 mt-2 text-xs",
                                stat.changeType === 'up' ? 'text-green-400' : 'text-red-400'
                              )}>
                                {stat.changeType === 'up' ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {stat.change}
                              </div>
                            </div>
                            <div className={cn(
                              "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                              stat.gradient
                            )}>
                              <stat.icon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Activity Chart */}
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          {isRTL ? 'النشاط الأسبوعي' : 'Weekly Activity'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {isRTL ? 'إحصائيات النشاط خلال الأسبوع الماضي' : 'Activity stats for the past week'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end gap-2 h-40">
                          {[65, 45, 78, 52, 90, 68, 85].map((value, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                              <div 
                                className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg transition-all hover:from-primary hover:to-primary"
                                style={{ height: `${value}%` }}
                              />
                              <span className="text-xs text-slate-400">
                                {[isRTL ? 'س' : 'S', isRTL ? 'ح' : 'M', isRTL ? 'ث' : 'T', isRTL ? 'أ' : 'W', isRTL ? 'خ' : 'T', isRTL ? 'ج' : 'F', isRTL ? 'س' : 'S'][i]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* User Distribution */}
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-primary" />
                          {isRTL ? 'توزيع المستخدمين' : 'User Distribution'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {isRTL ? 'توزيع المستخدمين حسب الدور' : 'Users by role'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(
                            users.reduce((acc, u) => {
                              acc[u.role] = (acc[u.role] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).slice(0, 5).map(([role, count]) => {
                            const percent = Math.round((count / users.length) * 100);
                            return (
                              <div key={role} className="flex items-center gap-3">
                                <div className={cn(
                                  "w-3 h-3 rounded-full",
                                  roleColors[role] || 'bg-gray-500'
                                )} />
                                <span className="text-sm text-slate-300 flex-1">{roleLabelsAr[role] || role}</span>
                                <span className="text-sm text-white font-medium">{count}</span>
                                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full rounded-full", roleColors[role] || 'bg-gray-500')}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { icon: Users, label: isRTL ? 'إضافة مستخدم' : 'Add User', color: 'from-blue-500 to-cyan-500', tab: 'users' },
                          { icon: Building2, label: isRTL ? 'إضافة شركة' : 'Add Company', color: 'from-green-500 to-emerald-500', tab: 'companies' },
                          { icon: FileText, label: isRTL ? 'منشور جديد' : 'New Post', color: 'from-pink-500 to-rose-500', tab: 'posts' },
                          { icon: Megaphone, label: isRTL ? 'إعلان جديد' : 'New Ad', color: 'from-purple-500 to-pink-500', tab: 'ads' },
                        ].map((action, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveTab(action.tab)}
                            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                          >
                            <div className={cn(
                              "p-3 rounded-xl bg-gradient-to-br text-white shadow-lg group-hover:scale-110 transition-transform",
                              action.color
                            )}>
                              <action.icon className="h-6 w-6" />
                            </div>
                            <span className="text-sm text-slate-300 font-medium">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Header Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400",
                        isRTL ? "right-4" : "left-4"
                      )} />
                      <Input
                        placeholder={isRTL ? "بحث عن مستخدم..." : "Search users..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                          "h-12 bg-slate-800 border-white/10 text-white placeholder:text-slate-400",
                          isRTL ? "pr-12" : "pl-12"
                        )}
                      />
                    </div>
                    <Button className="h-12 gap-2 bg-gradient-to-r from-primary to-primary/70 hover:from-primary hover:to-primary shadow-lg shadow-primary/30">
                      <Plus className="h-5 w-5" />
                      {isRTL ? 'إضافة مستخدم' : 'Add User'}
                    </Button>
                  </div>

                  {/* Users Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((u) => (
                      <Card 
                        key={u.id} 
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 overflow-hidden hover:border-primary/30 transition-all"
                      >
                        <div className={cn(
                          "h-16 bg-gradient-to-r",
                          roleColors[u.role] || 'bg-gray-500'
                        )} />
                        <CardContent className="p-4 -mt-8">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-16 w-16 ring-4 ring-slate-900 mb-3">
                              <AvatarFallback className={cn('text-white text-lg', roleColors[u.role])}>
                                {u.name?.[0]?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-white">{u.name || '---'}</h3>
                            <p className="text-sm text-slate-400 mb-2">{u.email}</p>
                            <Badge variant="secondary" className="mb-3">
                              {roleLabelsAr[u.role] || u.role}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                              <MapPin className="h-4 w-4" />
                              {u.city || u.wilaya || '---'}
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                                onClick={() => { setSelectedUser(u); setShowUserDialog(true); }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                {isRTL ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn(
                                  "flex-1",
                                  u.is_active 
                                    ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                                    : "border-green-500/50 text-green-400 hover:bg-green-500/10"
                                )}
                                onClick={() => handleBanUser(u.id, u.is_active || false)}
                              >
                                {u.is_active ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-1" />
                                    {isRTL ? 'حظر' : 'Ban'}
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    {isRTL ? 'فك' : 'Unban'}
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredUsers.length === 0 && (
                    <Card className="bg-slate-800 border-white/10">
                      <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-400">
                          {isRTL ? 'لا يوجد مستخدمين' : 'No users found'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {/* Header Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400",
                        isRTL ? "right-4" : "left-4"
                      )} />
                      <Input
                        placeholder={isRTL ? "بحث في المنشورات..." : "Search posts..."}
                        className={cn(
                          "h-12 bg-slate-800 border-white/10 text-white placeholder:text-slate-400",
                          isRTL ? "pr-12" : "pl-12"
                        )}
                      />
                    </div>
                    <Button className="h-12 gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-500/30">
                      <Plus className="h-5 w-5" />
                      {isRTL ? 'منشور جديد' : 'New Post'}
                    </Button>
                  </div>

                  {/* Posts List */}
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card 
                        key={post.id} 
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 hover:border-primary/30 transition-all"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10 ring-2 ring-slate-700">
                              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                                {post.profiles?.name?.[0]?.toUpperCase() || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">{post.profiles?.name || '---'}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {post.post_type}
                                </Badge>
                                {post.status === 'pinned' && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    <Pin className="h-3 w-3 mr-1" />
                                    {isRTL ? 'مثبت' : 'Pinned'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-300 line-clamp-2 mb-2">
                                {post.title || post.content?.slice(0, 150)}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(post.created_at).toLocaleDateString(isRTL ? 'ar-DZ' : 'en-US')}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10"
                                onClick={() => handlePinPost(post.id, post.status !== 'pinned')}
                              >
                                {post.status === 'pinned' ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-slate-400 hover:text-white hover:bg-white/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {posts.length === 0 && (
                    <Card className="bg-slate-800 border-white/10">
                      <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-400">
                          {isRTL ? 'لا يوجد منشورات' : 'No posts found'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Companies Tab */}
              {activeTab === 'companies' && <CompaniesManager />}

              {/* Craftsmen Tab */}
              {activeTab === 'craftsmen' && <CraftsmenManager />}

              {/* Library Tab */}
              {activeTab === 'library' && <LibraryManager />}

              {/* Questions Tab */}
              {activeTab === 'questions' && <QuestionsManager />}

              {/* Market Tab */}
              {activeTab === 'market' && <MarketManager />}

              {/* Jobs Tab */}
              {activeTab === 'jobs' && <JobsManager />}

              {/* Projects Tab */}
              {activeTab === 'projects' && <ProjectsManager />}

              {/* Ads Tab */}
              {activeTab === 'ads' && <AdsManager />}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Language Settings */}
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        {isRTL ? 'إعدادات اللغة' : 'Language Settings'}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {isRTL ? 'اختر اللغة الافتراضية للتطبيق' : 'Select the default language for the app'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { code: 'ar', label: 'العربية', flag: '🇩🇿' },
                          { code: 'fr', label: 'Français', flag: '🇫🇷' },
                          { code: 'en', label: 'English', flag: '🇬🇧' },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setSettings({ ...settings, language: lang.code })}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                              settings.language === lang.code
                                ? "border-primary bg-primary/10 text-white"
                                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                            )}
                          >
                            <span className="text-3xl">{lang.flag}</span>
                            <span className="font-medium">{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Theme Settings */}
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        {settings.darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-yellow-400" />}
                        {isRTL ? 'إعدادات المظهر' : 'Appearance Settings'}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {isRTL ? 'تخصيص مظهر التطبيق' : 'Customize the app appearance'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <p className="font-medium text-white">{isRTL ? 'الوضع الداكن' : 'Dark Mode'}</p>
                          <p className="text-sm text-slate-400">
                            {isRTL ? 'استخدم المظهر الداكن للتطبيق' : 'Use dark theme for the app'}
                          </p>
                        </div>
                        <Switch
                          checked={settings.darkMode}
                          onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        {isRTL ? 'إعدادات الأمان' : 'Security Settings'}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {isRTL ? 'إعدادات الأمان والخصوصية' : 'Security and privacy settings'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <p className="font-medium text-white">{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</p>
                          <p className="text-sm text-slate-400">
                            {isRTL ? 'تعطيل الموقع مؤقتاً للصيانة' : 'Temporarily disable the site for maintenance'}
                          </p>
                        </div>
                        <Switch
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <p className="font-medium text-white">{isRTL ? 'التسجيل الجديد' : 'New Registrations'}</p>
                          <p className="text-sm text-slate-400">
                            {isRTL ? 'السماح بتسجيل مستخدمين جدد' : 'Allow new user registrations'}
                          </p>
                        </div>
                        <Switch
                          checked={settings.newRegistrations}
                          onCheckedChange={(checked) => setSettings({ ...settings, newRegistrations: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <p className="font-medium text-white">{isRTL ? 'التحقق من البريد' : 'Email Verification'}</p>
                          <p className="text-sm text-slate-400">
                            {isRTL ? 'طلب تأكيد البريد الإلكتروني' : 'Require email confirmation'}
                          </p>
                        </div>
                        <Switch
                          checked={settings.emailVerification}
                          onCheckedChange={(checked) => setSettings({ ...settings, emailVerification: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <Button className="w-full h-12 bg-gradient-to-r from-primary to-primary/70 hover:from-primary hover:to-primary shadow-lg shadow-primary/30">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* User Edit Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعديل المستخدم' : 'Edit User'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">{isRTL ? 'الاسم' : 'Name'}</label>
              <Input 
                defaultValue={selectedUser?.name}
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
              <Input 
                defaultValue={selectedUser?.email}
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">{isRTL ? 'الدور' : 'Role'}</label>
              <Select defaultValue={selectedUser?.role}>
                <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {Object.entries(roleLabelsAr).map(([role, label]) => (
                    <SelectItem key={role} value={role} className="text-white hover:bg-white/10">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={() => setShowUserDialog(false)} className="bg-primary hover:bg-primary">
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;
