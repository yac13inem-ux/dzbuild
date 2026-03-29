'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator as CalculatorIcon, Building2, TrendingUp, Paintbrush, Construction, Info, MapPin, Home } from 'lucide-react';
import { useState } from 'react';

export function CalculatorSection() {
  const { locale } = useAppStore();
  const [area, setArea] = useState<string>('');
  const [floors, setFloors] = useState<string>('1');
  const [quality, setQuality] = useState<string>('medium');
  const [showResult, setShowResult] = useState(false);

  const calculate = () => {
    if (area) {
      setShowResult(true);
    }
  };

  const qualityLabels = {
    low: { ar: 'اقتصادي', fr: 'Économique', en: 'Economy' },
    medium: { ar: 'متوسط', fr: 'Moyen', en: 'Medium' },
    high: { ar: 'عالي الجودة', fr: 'Haute Qualité', en: 'High Quality' },
    luxury: { ar: 'فاخر', fr: 'Luxe', en: 'Luxury' },
  };

  return (
    <section id="calculator" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'حاسبة تكاليف البناء' : locale === 'fr' ? 'Calculateur de Coûts' : 'Construction Cost Calculator'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' ? 'أدخل تفاصيل مشروعك للحصول على تقدير أولي' : locale === 'fr' ? 'Entrez les détails de votre projet' : 'Enter your project details for initial estimate'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <Label>
                    {locale === 'ar' ? 'المساحة (م²)' : locale === 'fr' ? 'Surface (m²)' : 'Area (m²)'}
                  </Label>
                  <Input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder={locale === 'ar' ? 'مثال: 120' : 'Example: 120'}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {locale === 'ar' ? 'عدد الطوابق' : locale === 'fr' ? 'Nombre d\'Étages' : 'Number of Floors'}
                  </Label>
                  <Select value={floors} onValueChange={setFloors}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {locale === 'ar' ? 'مستوى الجودة' : locale === 'fr' ? 'Niveau de Qualité' : 'Quality Level'}
                  </Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(qualityLabels).map(([key, labels]) => (
                        <SelectItem key={key} value={key}>
                          {labels[locale as 'ar' | 'fr' | 'en']}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculate} size="lg" className="w-full mb-6">
                <CalculatorIcon className="h-5 w-5 me-2" />
                {locale === 'ar' ? 'احسب التكلفة التقديرية' : locale === 'fr' ? 'Calculer le Coût Estimé' : 'Calculate Estimated Cost'}
              </Button>

              {showResult && (
                <div className="space-y-4">
                  <div className="bg-primary/5 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-5 w-5 text-primary" />
                      <span className="text-lg font-medium">
                        {locale === 'ar' ? 'معلومات مهمة' : locale === 'fr' ? 'Information Importante' : 'Important Information'}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {locale === 'ar' 
                        ? 'التكلفة الفعلية تختلف حسب المنطقة والمواد المستخدمة. ننصح بالتواصل مع مقاولين محليين للحصول على عروض أسعار دقيقة.'
                        : locale === 'fr'
                        ? 'Le coût réel varie selon la région et les matériaux. Nous recommandons de contacter des entrepreneurs locaux pour des devis précis.'
                        : 'Actual cost varies by region and materials used. We recommend contacting local contractors for accurate quotes.'}
                    </p>
                  </div>

                  <Button className="w-full">
                    {locale === 'ar' ? 'تواصل مع مقاولين' : locale === 'fr' ? 'Contacter des Entrepreneurs' : 'Contact Contractors'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
