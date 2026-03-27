'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, Users, Building2, Wrench, Factory, User, ArrowRight, Plus } from 'lucide-react';

const roles = [
  {
    id: 'CIVIL_ENGINEER',
    icon: HardHat,
    titleAr: 'مهندس مدني',
    titleFr: 'Ingénieur Civil',
    titleEn: 'Civil Engineer',
    descriptionAr: 'قدم استشاراتك الهندسية وشارك معرفتك',
    descriptionFr: 'Offrez vos conseils en ingénierie et partagez vos connaissances',
    descriptionEn: 'Provide engineering consultations and share your knowledge',
    color: 'bg-blue-500',
  },
  {
    id: 'CONTRACTOR',
    icon: Users,
    titleAr: 'مقاول',
    titleFr: 'Entrepreneur',
    titleEn: 'Contractor',
    descriptionAr: 'أدر مشاريعك واعثر على فرص عمل جديدة',
    descriptionFr: 'Gérez vos projets et trouvez de nouvelles opportunités',
    descriptionEn: 'Manage your projects and find new opportunities',
    color: 'bg-orange-500',
  },
  {
    id: 'ENGINEERING_OFFICE',
    icon: Building2,
    titleAr: 'مكتب دراسات',
    titleFr: "Bureau d'Études",
    titleEn: 'Engineering Office',
    descriptionAr: 'قدم خدماتك الهندسية للمستثمرين',
    descriptionFr: 'Offrez vos services d\'ingénierie aux clients',
    descriptionEn: 'Offer your engineering services to clients',
    color: 'bg-purple-500',
  },
  {
    id: 'CRAFTSMAN',
    icon: Wrench,
    titleAr: 'حرفي',
    titleFr: 'Artisan',
    titleEn: 'Craftsman',
    descriptionAr: 'اعرض مهاراتك واحصل على طلبات العمل',
    descriptionFr: 'Présentez vos compétences et recevez des demandes',
    descriptionEn: 'Showcase your skills and get work requests',
    color: 'bg-amber-500',
  },
  {
    id: 'CONSTRUCTION_COMPANY',
    icon: Building2,
    titleAr: 'شركة بناء',
    titleFr: 'Entreprise de Construction',
    titleEn: 'Construction Company',
    descriptionAr: 'أدر شركتك واعثر على مشاريع جديدة',
    descriptionFr: 'Gérez votre entreprise et trouvez de nouveaux projets',
    descriptionEn: 'Manage your company and find new projects',
    color: 'bg-green-500',
  },
  {
    id: 'STORE_FACTORY',
    icon: Factory,
    titleAr: 'متجر / مصنع',
    titleFr: 'Magasin / Usine',
    titleEn: 'Store / Factory',
    descriptionAr: 'بع منتجاتك ومواد البناء',
    descriptionFr: 'Vendez vos produits et matériaux de construction',
    descriptionEn: 'Sell your products and construction materials',
    color: 'bg-cyan-500',
  },
  {
    id: 'NORMAL_USER',
    icon: User,
    titleAr: 'مستخدم عادي',
    titleFr: 'Utilisateur Normal',
    titleEn: 'Normal User',
    descriptionAr: 'ابحث عن خدمات البناء واحصل على استشارات',
    descriptionFr: 'Recherchez des services de construction',
    descriptionEn: 'Search for construction services',
    color: 'bg-gray-500',
  },
];

interface RoleSelectionSectionProps {
  onAuthClick?: () => void;
}

export function RoleSelectionSection({ onAuthClick }: RoleSelectionSectionProps) {
  const { locale } = useAppStore();

  const getTitle = (role: typeof roles[0]) => {
    if (locale === 'ar') return role.titleAr;
    if (locale === 'fr') return role.titleFr;
    return role.titleEn;
  };

  const getDescription = (role: typeof roles[0]) => {
    if (locale === 'ar') return role.descriptionAr;
    if (locale === 'fr') return role.descriptionFr;
    return role.descriptionEn;
  };

  return (
    <section id="roles" className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'اختر دورك في المنصة' : locale === 'fr' ? 'Choisissez Votre Rôle' : 'Choose Your Role'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' ? 'كل دور له مميزات وخدمات خاصة به' : locale === 'fr' ? 'Chaque rôle a ses propres fonctionnalités' : 'Each role has its own features and services'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="card-hover group cursor-pointer" onClick={onAuthClick}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${role.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <role.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{getTitle(role)}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{getDescription(role)}</p>
                  
                  <Button className="w-full group">
                    {locale === 'ar' ? 'اختيار' : locale === 'fr' ? 'Choisir' : 'Select'}
                    <ArrowRight className="h-4 w-4 ms-2 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
