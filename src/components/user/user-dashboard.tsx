'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  User,
  Building2,
  Wrench,
  Briefcase,
  BookOpen,
  MessageSquare,
  Bell,
  Settings,
  Star,
  Users,
  FolderKanban,
  ChevronLeft,
} from 'lucide-react';

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

interface UserDashboardProps {
  onNavigate: (view: string) => void;
}

export function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user, locale } = useAppStore();
  const isRTL = locale === 'ar';

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const quickActions = [
    { icon: Building2, label: isRTL ? 'الشركات' : locale === 'fr' ? 'Entreprises' : 'Companies', view: 'companies', color: 'bg-green-500' },
    { icon: Wrench, label: isRTL ? 'الحرفيين' : locale === 'fr' ? 'Artisans' : 'Craftsmen', view: 'craftsmen', color: 'bg-amber-500' },
    { icon: Briefcase, label: isRTL ? 'الوظائف' : locale === 'fr' ? 'Emplois' : 'Jobs', view: 'jobs', color: 'bg-orange-500' },
    { icon: BookOpen, label: isRTL ? 'المكتبة' : locale === 'fr' ? 'Bibliothèque' : 'Library', view: 'library', color: 'bg-red-500' },
    { icon: FolderKanban, label: isRTL ? 'المشاريع' : locale === 'fr' ? 'Projets' : 'Projects', view: 'projects', color: 'bg-teal-500' },
    { icon: MessageSquare, label: isRTL ? 'المنشورات' : locale === 'fr' ? 'Publications' : 'Posts', view: 'posts', color: 'bg-pink-500' },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className={cn('text-white text-xl', roleColors[user.role])}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">
                {isRTL ? `مرحباً، ${user.name}!` : locale === 'fr' ? `Bonjour, ${user.name}!` : `Welcome, ${user.name}!`}
              </h1>
              <Badge className={cn('text-white mt-1', roleColors[user.role])}>
                {roleLabelsAr[user.role] || user.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xl font-bold">{user.followersCount || 0}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'متابع' : locale === 'fr' ? 'Abonnés' : 'Followers'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xl font-bold">{user.followingCount || 0}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'يتابع' : locale === 'fr' ? 'Abonnements' : 'Following'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xl font-bold">{user.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'التقييم' : locale === 'fr' ? 'Note' : 'Rating'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isRTL ? 'الوصول السريع' : locale === 'fr' ? 'Accès rapide' : 'Quick Access'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:border-primary"
                onClick={() => onNavigate(action.view)}
              >
                <div className={cn('p-2 rounded-lg text-white', action.color)}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isRTL ? 'النشاط الأخير' : locale === 'fr' ? 'Activité récente' : 'Recent Activity'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {isRTL ? 'لا يوجد نشاط جديد' : locale === 'fr' ? 'Pas de nouvelle activité' : 'No recent activity'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
