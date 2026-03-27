'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Package, Wrench, MapPin, Plus } from 'lucide-react';

export function MarketSection() {
  const { locale } = useAppStore();

  return (
    <section id="market" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {locale === 'ar' ? 'السوق المفتوح' : locale === 'fr' ? 'Marché Ouvert' : 'Open Market'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'بيع وشراء المواد والخدمات والأدوات' : locale === 'fr' ? 'Achetez et vendez matériaux, services et outils' : 'Buy and sell materials, services, and tools'}
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'أضف منتج' : locale === 'fr' ? 'Ajouter un Produit' : 'Add Product'}
          </Button>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Store className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'ar' ? 'السوق فارغ حالياً' : locale === 'fr' ? 'Le marché est vide' : 'Market is empty'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {locale === 'ar' 
                  ? 'كن أول من يعرض منتجاته أو خدماته في السوق'
                  : locale === 'fr'
                  ? 'Soyez le premier à proposer vos produits ou services'
                  : 'Be the first to list your products or services in the market'}
              </p>
              <Button>
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'أضف منتجك' : locale === 'fr' ? 'Ajouter votre Produit' : 'Add Your Product'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
