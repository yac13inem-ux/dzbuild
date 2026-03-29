'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  position: string;
}

// Simple Ad Banner Component
export function AdBanner({ 
  ad, 
  onClose, 
  className 
}: { 
  ad: Ad; 
  onClose?: () => void;
  className?: string;
}) {
  const handleClick = async () => {
    if (ad.link_url) {
      // Track click
      try {
        await fetch(`/api/ads/${ad.id}/click`, { method: 'POST' });
      } catch (e) {
        // Ignore tracking errors
      }
      window.open(ad.link_url, '_blank');
    }
  };

  useEffect(() => {
    // Track view
    const trackView = async () => {
      try {
        await fetch(`/api/ads/${ad.id}/view`, { method: 'POST' });
      } catch (e) {
        // Ignore tracking errors
      }
    };
    trackView();
  }, [ad.id]);

  if (!ad.image_url) return null;

  return (
    <div className={cn('relative group', className)}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      )}
      <div 
        onClick={handleClick}
        className={cn(
          'cursor-pointer overflow-hidden rounded-lg',
          ad.link_url && 'hover:opacity-90 transition-opacity'
        )}
      >
        <img 
          src={ad.image_url} 
          alt={ad.title}
          className="w-full h-auto object-cover"
        />
      </div>
      {ad.link_url && (
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" className="gap-1 text-xs">
            <ExternalLink className="h-3 w-3" />
            {ad.title}
          </Button>
        </div>
      )}
    </div>
  );
}

// Sidebar Ads Component
export function AdSidebar({ className }: { className?: string }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads?position=sidebar');
      const data = await res.json();
      setAds(data.ads || []);
    } catch (e) {
      console.error('Error fetching sidebar ads:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || ads.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {ads.map((ad) => (
        <AdBanner key={ad.id} ad={ad} />
      ))}
    </div>
  );
}

// Header Banner Ads
export function AdHeader({ className }: { className?: string }) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, []);

  const fetchAd = async () => {
    try {
      const res = await fetch('/api/ads?position=header');
      const data = await res.json();
      setAd(data.ads?.[0] || null);
    } catch (e) {
      console.error('Error fetching header ad:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ad || !visible) return null;

  return (
    <div className={cn('relative bg-muted', className)}>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-1 right-1 z-10 p-1 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
      >
        <X className="h-3 w-3 text-white" />
      </button>
      <AdBanner ad={ad} />
    </div>
  );
}

// Feed Ads (inserted between content)
export function AdFeed({ className }: { className?: string }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads?position=feed');
      const data = await res.json();
      setAds(data.ads || []);
    } catch (e) {
      console.error('Error fetching feed ads:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || ads.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {ads.map((ad) => (
        <div key={ad.id} className="border rounded-lg p-2 bg-muted/30">
          <AdBanner ad={ad} />
        </div>
      ))}
    </div>
  );
}

// Popup Ad Component
export function AdPopup() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [visible, setVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if popup was closed in this session (client-side only)
    const closed = sessionStorage.getItem('adPopupClosed');
    if (closed) {
      setInitialized(true);
      return;
    }

    const fetchAd = async () => {
      try {
        const res = await fetch('/api/ads?position=popup');
        const data = await res.json();
        if (data.ads?.[0]) {
          setAd(data.ads[0]);
          // Show popup after 3 seconds
          setTimeout(() => setVisible(true), 3000);
        }
      } catch (e) {
        console.error('Error fetching popup ad:', e);
      } finally {
        setInitialized(true);
      }
    };

    fetchAd();
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('adPopupClosed', 'true');
    }
  };

  // Don't render until client-side initialization is complete
  if (!initialized || !ad || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-background rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 p-2 bg-background rounded-full shadow-md hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{ad.title}</h3>
          {ad.image_url && (
            <img 
              src={ad.image_url} 
              alt={ad.title}
              className="w-full h-auto rounded-lg mb-4"
            />
          )}
          {ad.description && (
            <p className="text-muted-foreground mb-4">{ad.description}</p>
          )}
          {ad.link_url && (
            <Button 
              onClick={() => {
                window.open(ad.link_url, '_blank');
                handleClose();
              }}
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              اعرف المزيد
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Landing Page Ads Carousel
export function AdCarousel({ className }: { className?: string }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      setAds(data.ads || []);
    } catch (e) {
      console.error('Error fetching carousel ads:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  return (
    <div className={cn('relative', className)}>
      <AdBanner ad={currentAd} />
      
      {ads.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdBanner;
