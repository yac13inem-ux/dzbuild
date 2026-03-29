'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  initialLoad?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  reset: () => void;
  offset: number;
}

export function useInfiniteScroll<T>(
  fetchFn: (offset: number, limit: number) => Promise<{
    items: T[];
    hasMore: boolean;
  }>,
  limit: number = 10,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const { threshold = 200, initialLoad = true } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    // Prevent duplicate calls
    if (loading || !hasMore || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const currentOffset = items.length;
      const result = await fetchFn(currentOffset, limit);
      
      setItems(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setOffset(currentOffset + limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load'));
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchFn, limit, loading, hasMore, items.length]);

  const reset = useCallback(() => {
    setItems([]);
    setLoading(false);
    setHasMore(true);
    setError(null);
    setOffset(0);
    isFetchingRef.current = false;
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading && !isFetchingRef.current) {
        loadMore();
      }
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMore, threshold]);

  // Observe the sentinel element
  useEffect(() => {
    const currentObserver = observerRef.current;
    const currentRef = loadMoreRef.current;

    if (currentObserver && currentRef) {
      currentObserver.observe(currentRef);
    }

    return () => {
      if (currentObserver && currentRef) {
        currentObserver.unobserve(currentRef);
      }
    };
  }, [items]);

  // Initial load
  useEffect(() => {
    if (initialLoad && items.length === 0) {
      loadMore();
    }
  }, [initialLoad]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    offset,
  };
}

// Export the ref for the sentinel element
export function getLoadMoreSentinelRef() {
  return { current: null };
}
