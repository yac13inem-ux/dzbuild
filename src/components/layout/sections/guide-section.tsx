'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers, Building2, Droplets, Zap, Paintbrush, Clock, CheckCircle, Download } from 'lucide-react';

const constructionStages = [
  {
    id: 'foundation',
    icon: Building2,
    titleAr: 'الأساسات',
    titleFr: 'Fondations',
    titleEn: 'Foundation',
    descriptionAr: 'أعمال الحفر والتأسيس والصب',
    descriptionFr: 'Travaux de fouille et fondation',
    descriptionEn: 'Excavation and foundation works',
    durationAr: '2-4 أسابيع',
    durationFr: '2-4 semaines',
    durationEn: '2-4 weeks'
  },
  {
    id: 'structure',
    icon: Layers,
    titleAr: 'الهيكل الإنشائي',
    titleFr: 'Structure',
    titleEn: 'Structure',
    descriptionAr: 'بناء الأعمدة والجسور والأسقف',
    descriptionFr: 'Construction des poteaux et poutres',
    descriptionEn: 'Columns, beams and slabs',
    durationAr: '4-8 أسابيع',
    durationFr: '4-8 semaines',
    durationEn: '4-8 weeks'
  },
  {
    id: 'plumbing',
    icon: Droplets,
    titleAr: 'السباكة',
    titleFr: 'Plomberie',
    titleEn: 'Plumbing',
    descriptionAr: 'تمديدات المياه والصرف الصحي',
    descriptionFr: 'Installations d\'eau',
    descriptionEn: 'Water and drainage systems',
    durationAr: '2-3 أسابيع',
    durationFr: '2-3 semaines',
    durationEn: '2-3 weeks'
  },
  {
    id: 'electrical',
    icon: Zap,
    titleAr: 'الكهرباء',
    titleFr: 'Électricité',
    titleEn: 'Electrical',
    descriptionAr: 'التمديدات الكهربائية والإنارة',
    descriptionFr: 'Installations électriques',
    descriptionEn: 'Electrical installations',
    durationAr: '2-3 أسابيع',
    durationFr: '2-3 semaines',
    durationEn: '2-3 weeks'
  },
  {
    id: 'finishing',
    icon: Paintbrush,
    titleAr: 'التشطيبات',
    titleFr: 'Finitions',
    titleEn: 'Finishing',
    descriptionAr: 'أعمال الدهان والأرضيات',
    descriptionFr: 'Travaux de peinture et sols',
    descriptionEn: 'Painting and flooring works',
    durationAr: '4-6 أسابيع',
    durationFr: '4-6 semaines',
    durationEn: '4-6 weeks'
  },
];

export function GuideSection() {
  const { locale } = useAppStore();

  const getTitle = (item: typeof constructionStages[0]) => {
    if (locale === 'ar') return item.titleAr;
    if (locale === 'fr') return item.titleFr;
    return item.titleEn;
  };

  const getDescription = (item: typeof constructionStages[0]) => {
    if (locale === 'ar') return item.descriptionAr;
    if (locale === 'fr') return item.descriptionFr;
    return item.descriptionEn;
  };

  const getDuration = (item: typeof constructionStages[0]) => {
    if (locale === 'ar') return item.durationAr;
    if (locale === 'fr') return item.durationFr;
    return item.durationEn;
  };

  return (
    <section id="guide" className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'دليل مراحل البناء' : locale === 'fr' ? 'Guide des Étapes de Construction' : 'Construction Stages Guide'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' ? 'تعرف على جميع مراحل البناء الأساسية' : locale === 'fr' ? 'Découvrez toutes les étapes de construction' : 'Learn all basic construction stages'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {constructionStages.map((stage, idx) => (
            <Card key={stage.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <stage.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">{getTitle(stage)}</h3>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getDuration(stage)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{getDescription(stage)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {idx + 1}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button size="lg">
            <Download className="h-5 w-5 me-2" />
            {locale === 'ar' ? 'تحميل الدليل الكامل' : locale === 'fr' ? 'Télécharger le Guide' : 'Download Full Guide'}
          </Button>
        </div>
      </div>
    </section>
  );
}
