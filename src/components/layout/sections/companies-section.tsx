'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Briefcase } from 'lucide-react';

export function CompaniesSection() {
  const { locale } = useAppStore();
  
  return (
    <section id="companies" className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'شركات البناء' : locale === 'fr' ? 'Entreprises de Construction' : 'Construction Companies'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' ? 'اكتشف شركات البناء المعتمدة' : locale === 'fr' ? 'Découvrez les entreprises de construction certifiées' : 'Discover certified construction companies'}
          </p>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'لا توجد شركات مسجلة حالياً' : locale === 'fr' ? 'Aucune entreprise enregistrée' : 'No registered companies'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'سجل شركتك لتظهر للعملاء الباحثين عن خدمات البناء'
                  : locale === 'fr'
                  ? 'Enregistrez votre entreprise pour apparaître aux clients'
                  : 'Register your company to appear to clients looking for construction services'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'سجل شركتك' : locale === 'fr' ? 'Enregistrer votre Entreprise' : 'Register Company'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
