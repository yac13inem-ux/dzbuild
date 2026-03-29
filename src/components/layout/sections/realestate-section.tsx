'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Heart, MapPin, Plus } from 'lucide-react';

export function RealEstateSection() {
  const { locale } = useAppStore();

  return (
    <section id="realestate" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {locale === 'ar' ? 'العقارات' : locale === 'fr' ? 'Immobilier' : 'Real Estate'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'بيع وشراء وإيجار العقارات' : locale === 'fr' ? 'Acheter, vendre et louer des biens' : 'Buy, sell and rent properties'}
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'أضف عقار' : locale === 'fr' ? 'Ajouter un Bien' : 'Add Property'}
          </Button>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Home className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد عقارات حالياً' : locale === 'fr' ? 'Aucun bien disponible' : 'No properties available'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'كن أول من يضيف عقاره للبيع أو الإيجار'
                  : locale === 'fr'
                  ? 'Soyez le premier à ajouter votre propriété'
                  : 'Be the first to add your property for sale or rent'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'أضف عقارك' : locale === 'fr' ? 'Ajouter votre Bien' : 'Add Your Property'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
