'use client';

import { useTranslation } from '@/components/locale-provider';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  Bot,
  MapPin,
  ArrowRight,
  Search,
} from 'lucide-react';

export function HeroSection() {
  const { t } = useTranslation();
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';

  const features = [
    {
      icon: Users,
      title: locale === 'ar' ? 'دليل الحرفيين' : locale === 'fr' ? 'Annuaire des Artisans' : 'Craftsmen Directory',
      description: locale === 'ar' ? 'اعثر على أفضل الحرفيين في منطقتك' : locale === 'fr' ? 'Trouvez les meilleurs artisans près de chez vous' : 'Find the best craftsmen near you',
    },
    {
      icon: Building2,
      title: locale === 'ar' ? 'شركات البناء' : locale === 'fr' ? 'Entreprises de Construction' : 'Construction Companies',
      description: locale === 'ar' ? 'اكتشف شركات البناء المعتمدة' : locale === 'fr' ? 'Découvrez les entreprises certifiées' : 'Discover certified construction companies',
    },
    {
      icon: Briefcase,
      title: locale === 'ar' ? 'فرص العمل' : locale === 'fr' ? 'Offres d\'Emploi' : 'Job Opportunities',
      description: locale === 'ar' ? 'وظائف في قطاع البناء' : locale === 'fr' ? 'Emplois dans la construction' : 'Jobs in construction sector',
    },
    {
      icon: GraduationCap,
      title: locale === 'ar' ? 'دورات تدريبية' : locale === 'fr' ? 'Formations' : 'Training Courses',
      description: locale === 'ar' ? 'تطوير مهاراتك المهنية' : locale === 'fr' ? 'Développez vos compétences' : 'Develop your professional skills',
    },
    {
      icon: Bot,
      title: locale === 'ar' ? 'المساعد الذكي' : locale === 'fr' ? 'Assistant IA' : 'AI Assistant',
      description: locale === 'ar' ? 'استشارات هندسية بالذكاء الاصطناعي' : locale === 'fr' ? 'Conseils en ingénierie par IA' : 'AI-powered engineering advice',
    },
    {
      icon: MapPin,
      title: locale === 'ar' ? 'خريطة الحرفيين' : locale === 'fr' ? 'Carte des Artisans' : 'Craftsmen Map',
      description: locale === 'ar' ? 'ابحث عن الحرفيين بالقرب منك' : locale === 'fr' ? 'Trouvez des artisans près de vous' : 'Find craftsmen near you',
    },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5" />
      
      <div className="container relative px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            {locale === 'ar' ? '🇩🇿 أول منصة هندسية في الجزائر' : locale === 'fr' ? '🇩🇿 Première plateforme d\'ingénierie en Algérie' : '🇩🇿 First Engineering Platform in Algeria'}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">
            {locale === 'ar' ? (
              <>
                منصة <span className="gradient-text">البناء والهندسة</span>
                <br />
                الشاملة في الجزائر
              </>
            ) : locale === 'fr' ? (
              <>
                La Plateforme <span className="gradient-text">de Construction</span>
                <br />
                Complète en Algérie
              </>
            ) : (
              <>
                The Complete <span className="gradient-text">Construction</span>
                <br />
                Platform in Algeria
              </>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
            {t('app.description')}
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mb-8">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'ابحث عن حرفي، شركة، وظيفة...' : locale === 'fr' ? 'Rechercher un artisan, entreprise, emploi...' : 'Search for craftsman, company, job...'}
                className="w-full h-14 px-12 rounded-2xl border bg-background shadow-lg focus:ring-2 focus:ring-primary/50"
              />
              <Button className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-2' : 'right-2'}`}>
                {locale === 'ar' ? 'بحث' : locale === 'fr' ? 'Rechercher' : 'Search'}
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2">
              {locale === 'ar' ? 'ابدأ مجاناً' : locale === 'fr' ? 'Commencer Gratuitement' : 'Get Started Free'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              {locale === 'ar' ? 'اكتشف المزيد' : locale === 'fr' ? 'En Savoir Plus' : 'Learn More'}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="card-hover border-0 shadow-md bg-background/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
