'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Play, Plus, Clock } from 'lucide-react';

export function DIYSection() {
  const { locale } = useAppStore();

  return (
    <section id="diy" className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'دروس افعلها بنفسك' : locale === 'fr' ? 'Tutoriels DIY' : 'DIY Tutorials'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' ? 'تعلم أساسيات الإصلاح والصيانة بنفسك' : locale === 'fr' ? 'Apprenez les bases de la réparation et de l\'entretien par vous-même' : 'Learn basic repair and maintenance by yourself'}
          </p>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Wrench className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد دروس حالياً' : locale === 'fr' ? 'Aucun tutoriel disponible' : 'No tutorials available'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'كن أول من يضيف دروساً تعليمية في مجال البناء والإصلاح'
                  : locale === 'fr'
                  ? 'Soyez le premier à ajouter des tutoriels de construction'
                  : 'Be the first to add educational tutorials in construction and repair'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'أضف درس' : locale === 'fr' ? 'Ajouter un Tutoriel' : 'Add Tutorial'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
