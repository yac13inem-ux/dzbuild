'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, Plus, Search } from 'lucide-react';

export function ProblemsSection() {
  const { locale } = useAppStore();

  return (
    <section id="problems" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {locale === 'ar' ? 'مشاكل وحلول البناء' : locale === 'fr' ? 'Problèmes et Solutions' : 'Problems & Solutions'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'اطرح سؤالك واحصل على إجابات من الخبراء' : locale === 'fr' ? 'Posez votre question et obtenez des réponses d\'experts' : 'Ask your question and get expert answers'}
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'اطرح سؤالاً' : locale === 'fr' ? 'Poser une Question' : 'Ask Question'}
          </Button>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <HelpCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد أسئلة حالياً' : locale === 'fr' ? 'Aucune question disponible' : 'No questions available'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'كن أول من يطرح سؤالاً في مجال البناء والهندسة'
                  : locale === 'fr'
                  ? 'Soyez le premier à poser une question sur la construction'
                  : 'Be the first to ask a question about construction and engineering'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'اطرح سؤالك' : locale === 'fr' ? 'Poser votre Question' : 'Ask Your Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
