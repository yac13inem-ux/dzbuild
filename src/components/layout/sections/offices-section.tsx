'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, MapPin, Plus, Users } from 'lucide-react';

export function OfficesSection() {
  const { locale } = useAppStore();

  return (
    <section id="offices" className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'مكاتب الدراسات الهندسية' : locale === 'fr' ? 'Bureaux d\'Études d\'Ingénierie' : 'Engineering Study Offices'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' ? 'اعثر على أفضل مكاتب الدراسات والاستشارات الهندسية' : locale === 'fr' ? 'Trouvez les meilleurs bureaux d\'études' : 'Find the best engineering study and consulting offices'}
          </p>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Briefcase className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد مكاتب دراسات مسجلة' : locale === 'fr' ? 'Aucun bureau d\'études enregistré' : 'No registered study offices'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'سجل مكتب دراساتك ليظهر للعملاء الباحثين عن خدمات هندسية'
                  : locale === 'fr'
                  ? 'Enregistrez votre bureau d\'études pour apparaître aux clients'
                  : 'Register your study office to appear to clients looking for engineering services'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'سجل مكتب دراساتك' : locale === 'fr' ? 'Enregistrer votre Bureau' : 'Register Your Office'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
