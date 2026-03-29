'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Plus, Search } from 'lucide-react';

export function BlueprintsSection() {
  const { locale } = useAppStore();

  return (
    <section id="blueprints" className="py-16">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {locale === 'ar' ? 'المخططات والرسومات الهندسية' : locale === 'fr' ? 'Plans et Dessins Techniques' : 'Blueprints & Technical Drawings'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'مكتبة المخططات المعمارية والهندسية' : locale === 'fr' ? 'Bibliothèque de plans architecturaux' : 'Library of architectural and engineering plans'}
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'أضف مخطط' : locale === 'fr' ? 'Ajouter un Plan' : 'Upload Blueprint'}
          </Button>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد مخططات حالياً' : locale === 'fr' ? 'Aucun plan disponible' : 'No blueprints available'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'كن أول من يشارك مخططاته المعمارية والهندسية'
                  : locale === 'fr'
                  ? 'Soyez le premier à partager vos plans architecturaux'
                  : 'Be the first to share your architectural and engineering plans'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'أضف مخطط' : locale === 'fr' ? 'Ajouter un Plan' : 'Upload Blueprint'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
