'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { AppHeader } from '@/components/layout/app-header';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { AdCarousel, AdPopup } from '@/components/ads/ad-banner';
import { PostsSection } from '@/components/sections/posts-section';
import { CompaniesSection } from '@/components/sections/companies-section';
import { CraftsmenSection } from '@/components/sections/craftsmen-section';
import { MarketSection } from '@/components/sections/market-section';
import { QuestionsSection } from '@/components/sections/questions-section';
import { JobsSection } from '@/components/sections/jobs-section';
import { CalculatorSection } from '@/components/sections/calculator-section';
import { LibrarySection } from '@/components/sections/library-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';
import {
  Building2,
  HelpCircle,
  Calculator,
  Briefcase,
  BookOpen,
  FolderKanban,
  Users,
  Wrench,
  ShoppingCart,
  Home as HomeIcon,
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

type ActiveView = 
  | 'landing' 
  | 'posts' 
  | 'companies' 
  | 'craftsmen'
  | 'market'
  | 'questions' 
  | 'calculator' 
  | 'jobs' 
  | 'library' 
  | 'projects';

export default function Home() {
  const { user, locale, isLoggedIn, setUser, logout } = useAppStore();
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [stats, setStats] = useState({
    artisans: 0,
    engineers: 0,
    companies: 0,
    projects: 0,
  });
  const isRTL = locale === 'ar';

  // Verify session on mount (for admin only)
  useEffect(() => {
    const verifySession = async () => {
      if (isLoggedIn && user) {
        try {
          const res = await fetch('/api/auth/me', {
            credentials: 'include',
          });
          const data = await res.json();
          if (!data.user) {
            console.log('[Session] Session invalid, logging out');
            logout();
          } else {
            setUser(data.user);
          }
        } catch (error) {
          console.error('[Session] Error verifying session:', error);
        }
      }
      setSessionChecked(true);
    };
    verifySession();
  }, []);

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.stats) {
          setStats({
            artisans: data.stats.craftsmenCount || 0,
            engineers: data.stats.engineersCount || 0,
            companies: data.stats.companiesCount || 0,
            projects: data.stats.projectsCount || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Admin Dashboard - Only admin can access
  if (isLoggedIn && user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
  };

  // Navigation handler for AppHeader (string type)
  const handleHeaderNav = (view: string) => {
    setActiveView(view as ActiveView);
  };

  // All 9 navigation items for landing page (public access)
  const allSectionNavItems = [
    { icon: Users, key: 'posts', view: 'posts' as ActiveView, color: 'bg-pink-500' },
    { icon: Building2, key: 'companies', view: 'companies' as ActiveView, color: 'bg-green-500' },
    { icon: Wrench, key: 'craftsmen', view: 'craftsmen' as ActiveView, color: 'bg-amber-500' },
    { icon: ShoppingCart, key: 'market', view: 'market' as ActiveView, color: 'bg-cyan-500' },
    { icon: HelpCircle, key: 'questions', view: 'questions' as ActiveView, color: 'bg-blue-500' },
    { icon: Calculator, key: 'calculator', view: 'calculator' as ActiveView, color: 'bg-purple-500' },
    { icon: Briefcase, key: 'jobs', view: 'jobs' as ActiveView, color: 'bg-orange-500' },
    { icon: BookOpen, key: 'library', view: 'library' as ActiveView, color: 'bg-red-500' },
    { icon: FolderKanban, key: 'projects', view: 'projects' as ActiveView, color: 'bg-teal-500' },
  ];

  // Render common layout wrapper
  const renderLayout = (children: React.ReactNode, maxWidth = 'max-w-6xl') => (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      <AppHeader
        onNavigate={handleHeaderNav}
        activeView={activeView}
      />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className={maxWidth}>
          {children}
        </div>
      </main>
      <footer className="mt-auto p-4 text-center text-muted-foreground text-sm border-t">
        © DzBuild - {translations.allRightsReserved[locale]}
      </footer>
      <AdPopup />
    </div>
  );

  // Posts View (Guest posting allowed)
  if (activeView === 'posts') {
    return renderLayout(
      <PostsSection onBack={() => setActiveView('landing')} />,
      'max-w-4xl'
    );
  }

  // Companies View
  if (activeView === 'companies') {
    return renderLayout(
      <CompaniesSection onBack={() => setActiveView('landing')} />,
      'max-w-6xl'
    );
  }

  // Craftsmen View
  if (activeView === 'craftsmen') {
    return renderLayout(
      <CraftsmenSection onBack={() => setActiveView('landing')} />,
      'max-w-6xl'
    );
  }

  // Market View
  if (activeView === 'market') {
    return renderLayout(
      <MarketSection onBack={() => setActiveView('landing')} />,
      'max-w-6xl'
    );
  }

  // Questions View (Guest posting allowed)
  if (activeView === 'questions') {
    return renderLayout(
      <QuestionsSection onBack={() => setActiveView('landing')} />,
      'max-w-4xl'
    );
  }

  // Jobs View
  if (activeView === 'jobs') {
    return renderLayout(
      <JobsSection onBack={() => setActiveView('landing')} />,
      'max-w-5xl'
    );
  }

  // Calculator View
  if (activeView === 'calculator') {
    return renderLayout(
      <CalculatorSection onBack={() => setActiveView('landing')} />,
      'max-w-4xl'
    );
  }

  // Library View
  if (activeView === 'library') {
    return renderLayout(
      <LibrarySection onBack={() => setActiveView('landing')} />,
      'max-w-6xl'
    );
  }

  // Projects View
  if (activeView === 'projects') {
    return renderLayout(
      <ProjectsSection onBack={() => setActiveView('landing')} />,
      'max-w-6xl'
    );
  }

  // Landing Page (Public access - no login required)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      <AppHeader />
      
      {/* Header Ad Banner */}
      <div className="container mx-auto px-4 pt-4">
        <AdCarousel className="max-w-4xl mx-auto" />
      </div>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary text-primary-foreground mb-6">
              <Building2 className="h-12 w-12" />
            </div>
            <h1 className="text-5xl font-bold mb-4">DzBuild</h1>
            <p className="text-xl text-muted-foreground mb-2">
              {translations.appDescription[locale]}
            </p>
          </div>

          {/* Features Grid - 3x3 Layout */}
          <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
            {allSectionNavItems.map((item, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(item.view)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border hover:shadow-lg transition-all cursor-pointer hover:border-primary hover:scale-105"
              >
                <div className={cn('p-2.5 rounded-xl text-white', item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-xs text-center">
                  {item.key === 'posts' 
                    ? translations.posts[locale]
                    : translations.features[item.key as keyof typeof translations.features]?.[locale] || item.key
                  }
                </span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.artisans.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{translations.artisans[locale]}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.engineers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{translations.engineers[locale]}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.companies.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{translations.companiesCount[locale]}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.projects.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{translations.projectsCount[locale]}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto p-4 text-center text-muted-foreground text-sm border-t">
        © DzBuild - {translations.allRightsReserved[locale]}
      </footer>
      <AdPopup />
    </div>
  );
}
