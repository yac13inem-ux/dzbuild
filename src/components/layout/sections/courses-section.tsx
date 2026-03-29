'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Play, Plus } from 'lucide-react';

export function CoursesSection() {
  const { locale } = useAppStore();

  return (
    <section id="courses" className="py-16">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {locale === 'ar' ? 'الدورات التدريبية' : locale === 'fr' ? 'Formations Professionnelles' : 'Training Courses'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'طور مهاراتك مع أفضل المدربين' : locale === 'fr' ? 'Développez vos compétences avec les meilleurs formateurs' : 'Develop your skills with the best trainers'}
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'أضف دورة' : locale === 'fr' ? 'Ajouter une Formation' : 'Add Course'}
          </Button>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <GraduationCap className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد دورات حالياً' : locale === 'fr' ? 'Aucune formation disponible' : 'No courses available'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'كن أول من يقدم دورات تدريبية في مجال البناء والهندسة'
                  : locale === 'fr'
                  ? 'Soyez le premier à proposer des formations en construction'
                  : 'Be the first to offer training courses in construction and engineering'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'أضف دورة تدريبية' : locale === 'fr' ? 'Ajouter une Formation' : 'Add Training Course'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
