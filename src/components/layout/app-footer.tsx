'use client';

import Link from 'next/link';
import { useTranslation } from '@/components/locale-provider';
import { useAppStore } from '@/stores/app-store';
import { Building2, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AppFooter() {
  const { t } = useTranslation();
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';

  const footerLinks = [
    {
      title: locale === 'ar' ? 'المنصة' : locale === 'fr' ? 'Plateforme' : 'Platform',
      links: [
        { label: t('footer.about'), href: '#about' },
        { label: t('footer.contact'), href: '#contact' },
        { label: t('footer.faq'), href: '#faq' },
        { label: t('footer.support'), href: '#support' },
      ],
    },
    {
      title: locale === 'ar' ? 'الخدمات' : locale === 'fr' ? 'Services' : 'Services',
      links: [
        { label: t('nav.craftsmen'), href: '#craftsmen' },
        { label: t('nav.companies'), href: '#companies' },
        { label: t('nav.jobs'), href: '#jobs' },
        { label: t('nav.courses'), href: '#courses' },
      ],
    },
    {
      title: locale === 'ar' ? 'قانوني' : locale === 'fr' ? 'Légal' : 'Legal',
      links: [
        { label: t('footer.privacy'), href: '#privacy' },
        { label: t('footer.terms'), href: '#terms' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold gradient-text">DzBuild</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {t('app.description')}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@dzbuild.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+213 XX XX XX XX</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{locale === 'ar' ? 'الجزائر العاصمة' : locale === 'fr' ? 'Alger, Algérie' : 'Algiers, Algeria'}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, idx) => (
              <Link
                key={idx}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
