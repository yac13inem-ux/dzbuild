'use client';

import { useEffect, useState } from 'react';

interface Ad {
  id: string;
  title: string;
  image_url?: string;
  link_url?: string;
  type: string;
  position: string;
}

interface AdBannerProps {
  position: string;
  className?: string;
}

export function AdBanner({ position, className = '' }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads?position=${position}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ad) {
            setAd(data.ad);
          }
        }
      } catch (error) {
        console.error('Fetch ad error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [position]);

  if (loading || !ad) return null;

  const isSidebar = position.includes('sidebar');

  if (ad.type === 'popup') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-background rounded-lg p-4 max-w-md w-full relative">
          <button
            onClick={() => setAd(null)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xl"
          >
            ✕
          </button>
          {ad.link_url ? (
            <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
              {ad.image_url && (
                <img src={ad.image_url} alt={ad.title} className="w-full rounded" />
              )}
              <p className="mt-2 font-medium text-center">{ad.title}</p>
            </a>
          ) : (
            <div>
              {ad.image_url && (
                <img src={ad.image_url} alt={ad.title} className="w-full rounded" />
              )}
              <p className="mt-2 font-medium text-center">{ad.title}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-banner ${className}`}>
      {ad.link_url ? (
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {ad.image_url ? (
            <img
              src={ad.image_url}
              alt={ad.title}
              className={`w-full object-cover rounded-lg ${isSidebar ? 'h-32' : 'h-24 md:h-32'}`}
            />
          ) : (
            <div className={`bg-muted rounded-lg flex items-center justify-center ${isSidebar ? 'h-32' : 'h-24 md:h-32'}`}>
              <span className="font-medium">{ad.title}</span>
            </div>
          )}
        </a>
      ) : ad.image_url ? (
        <img
          src={ad.image_url}
          alt={ad.title}
          className={`w-full object-cover rounded-lg ${isSidebar ? 'h-32' : 'h-24 md:h-32'}`}
        />
      ) : (
        <div className={`bg-muted rounded-lg flex items-center justify-center ${isSidebar ? 'h-32' : 'h-24 md:h-32'}`}>
          <span className="font-medium">{ad.title}</span>
        </div>
      )}
    </div>
  );
}
