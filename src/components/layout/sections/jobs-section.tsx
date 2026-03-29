'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, MapPin, Plus } from 'lucide-react';

export function JobsSection() {
  const { locale } = useAppStore();
  
  return (
    <section id="jobs" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {locale === 'ar' ? 'فرص العمل' : locale === 'fr' ? 'Offres d\'Emploi' : 'Job Opportunities'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'وظائف في قطاع البناء والهندسة' : locale === 'fr' ? 'Emplois dans la construction et l\'ingénierie' : 'Jobs in construction and engineering'}
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'أضف وظيفة' : locale === 'fr' ? 'Publier une Offre' : 'Post a Job'}
          </Button>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Briefcase className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد وظائف حالياً' : locale === 'fr' ? 'Aucune offre disponible' : 'No jobs available'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'تابعنا ليصلك إشعار عند إضافة وظائف جديدة'
                  : locale === 'fr'
                  ? 'Suivez-nous pour être notifié des nouvelles offres'
                  : 'Follow us to get notified when new jobs are posted'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'أضف وظيفة' : locale === 'fr' ? 'Publier une Offre' : 'Post a Job'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
