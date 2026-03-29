'use client';

import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/components/locale-provider';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  FileText,
  Users,
  Building2,
  Briefcase,
  HelpCircle,
  Wrench,
  Home as HomeIcon,
  MessageCircle,
  Bot,
  Factory,
  BriefcaseIcon,
  GraduationCap,
  GitCompare,
  Calculator,
  Store,
  Lock,
  Video,
  DollarSign,
  UserPlus,
  Star,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const mainNavItems = [
  { id: 'home', icon: Home, labelKey: 'nav.home' },
  { id: 'guide', icon: BookOpen, labelKey: 'nav.guide' },
  { id: 'blueprints', icon: FileText, labelKey: 'nav.blueprints' },
  { id: 'craftsmen', icon: Users, labelKey: 'nav.craftsmen' },
  { id: 'companies', icon: Building2, labelKey: 'nav.companies' },
  { id: 'offices', icon: Briefcase, labelKey: 'nav.offices' },
];

const communityItems = [
  { id: 'problems', icon: HelpCircle, labelKey: 'nav.problems' },
  { id: 'diy', icon: Wrench, labelKey: 'nav.diy' },
  { id: 'realestate', icon: HomeIcon, labelKey: 'nav.realestate' },
  { id: 'consultations', icon: MessageCircle, labelKey: 'nav.consultations' },
  { id: 'ai', icon: Bot, labelKey: 'nav.ai' },
];

const businessItems = [
  { id: 'factories', icon: Factory, labelKey: 'nav.factories' },
  { id: 'jobs', icon: BriefcaseIcon, labelKey: 'nav.jobs' },
  { id: 'courses', icon: GraduationCap, labelKey: 'nav.courses' },
  { id: 'comparisons', icon: GitCompare, labelKey: 'nav.comparisons' },
  { id: 'calculator', icon: Calculator, labelKey: 'nav.calculator' },
  { id: 'market', icon: Store, labelKey: 'nav.market' },
];

const professionalItems = [
  { id: 'engineers', icon: Lock, labelKey: 'nav.engineers' },
  { id: 'videos', icon: Video, labelKey: 'nav.videos' },
  { id: 'prices', icon: DollarSign, labelKey: 'nav.prices' },
  { id: 'request', icon: UserPlus, labelKey: 'nav.request' },
  { id: 'reviews', icon: Star, labelKey: 'nav.reviews' },
];

export function AppSidebar() {
  const { sidebarOpen, setSidebarOpen, activeSection, setActiveSection, locale } = useAppStore();
  const { t } = useTranslation();
  const isRTL = locale === 'ar';

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    // Scroll to section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside
      className={cn(
        'fixed top-16 z-40 h-[calc(100vh-4rem)] border-l bg-background transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
        isRTL ? 'right-0 border-r-0 border-l' : 'left-0 border-r'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            'absolute top-4 z-50 h-8 w-8 rounded-full border bg-background shadow-md',
            isRTL ? '-left-4' : '-right-4'
          )}
        >
          {sidebarOpen ? (
            isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          ) : (
            isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'sidebar-link w-full',
                  activeSection === item.id && 'active'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{t(item.labelKey)}</span>}
              </button>
            ))}
          </nav>

          <Separator className="my-4" />

          {/* Community */}
          {sidebarOpen && (
            <div className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase">
              {locale === 'ar' ? 'المجتمع' : locale === 'fr' ? 'Communauté' : 'Community'}
            </div>
          )}
          <nav className="space-y-1">
            {communityItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'sidebar-link w-full',
                  activeSection === item.id && 'active'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{t(item.labelKey)}</span>}
              </button>
            ))}
          </nav>

          <Separator className="my-4" />

          {/* Business */}
          {sidebarOpen && (
            <div className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase">
              {locale === 'ar' ? 'الأعمال' : locale === 'fr' ? 'Affaires' : 'Business'}
            </div>
          )}
          <nav className="space-y-1">
            {businessItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'sidebar-link w-full',
                  activeSection === item.id && 'active'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{t(item.labelKey)}</span>}
              </button>
            ))}
          </nav>

          <Separator className="my-4" />

          {/* Professional */}
          {sidebarOpen && (
            <div className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase">
              {locale === 'ar' ? 'احترافي' : locale === 'fr' ? 'Professionnel' : 'Professional'}
            </div>
          )}
          <nav className="space-y-1">
            {professionalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'sidebar-link w-full',
                  activeSection === item.id && 'active'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{t(item.labelKey)}</span>}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className={cn(
          'border-t p-4',
          !sidebarOpen && 'p-2'
        )}>
          <button
            onClick={() => handleNavClick('admin')}
            className="sidebar-link w-full text-primary"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>{t('nav.admin')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
