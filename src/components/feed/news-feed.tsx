'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Post } from '@/stores/app-store';
import { PostCard } from './post-card';
import { CreatePost } from './create-post';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function NewsFeed() {
  const { user, posts, setPosts, locale } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isRTL = locale === 'ar';

  const fetchPosts = async (pageNum: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/posts?limit=10&offset=${pageNum * 10}&userId=${user?.id || ''}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load posts');
      }

      if (pageNum === 0) {
        setPosts(data.posts || []);
      } else {
        setPosts([...posts, ...(data.posts || [])]);
      }

      setHasMore((data.posts || []).length === 10);
    } catch (err: any) {
      setError(err.message || (isRTL ? 'فشل تحميل المنشورات' : 'Failed to load posts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleRefresh = () => {
    setPage(0);
    fetchPosts(0);
  };

  const handlePostDelete = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts?id=${postId}&userId=${user?.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {user && <CreatePost />}
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 me-2" />
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {user && <CreatePost onPostCreated={(post) => setPosts([post, ...posts])} />}
      
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {isRTL ? 'لا توجد منشورات بعد. كن أول من ينشر!' : 'No posts yet. Be the first to post!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handlePostDelete}
            />
          ))}

          {hasMore && (
            <div className="text-center py-4">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 me-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 me-2" />
                )}
                {isRTL ? 'تحميل المزيد' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
