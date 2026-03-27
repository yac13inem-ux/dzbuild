'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Users } from 'lucide-react';

export function CraftsmenSection() {
  const { locale } = useAppStore();
  
  return (
    <section id="craftsmen" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'دليل الحرفيين' : locale === 'fr' ? 'Annuaire des Artisans' : 'Craftsmen Directory'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' ? 'اعثر على أفضل الحرفيين المهرة في منطقتك' : locale === 'fr' ? 'Trouvez les meilleurs artisans qualifiés près de chez vous' : 'Find the best skilled craftsmen near you'}
          </p>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا يوجد حرفيون حالياً' : locale === 'fr' ? 'Aucun artisan disponible' : 'No craftsmen available'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'كن أول من ينضم كحرفي في المنصة واعرض مهاراتك للعملاء'
                  : locale === 'fr'
                  ? 'Soyez le premier à rejoindre en tant qu\'artisan et présentez vos compétences'
                  : 'Be the first to join as a craftsman and showcase your skills to clients'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'سجل كحرفي' : locale === 'fr' ? 'S\'inscrire comme Artisan' : 'Register as Craftsman'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
