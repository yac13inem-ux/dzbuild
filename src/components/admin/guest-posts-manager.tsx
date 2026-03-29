'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Search,
  Trash2,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  Loader2,
  Users,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

interface GuestPost {
  id: string;
  name: string;
  content: string;
  section: string;
  category: string | null;
  images: string | null;
  approved: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  likesCount: number;
  createdAt: string;
  comments: {
    id: string;
    name: string;
    content: string;
    createdAt: string;
  }[];
}

export function GuestPostsManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<GuestPost[]>([]);
  const [questions, setQuestions] = useState<GuestPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchGuestPosts();
  }, []);

  const fetchGuestPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/guest-posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts?.filter((p: GuestPost) => p.section === 'posts') || []);
        setQuestions(data.posts?.filter((p: GuestPost) => p.section === 'questions') || []);
      }
    } catch (error) {
      console.error('Error fetching guest posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنشور؟' : 'Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`/api/admin/guest-posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGuestPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const filterPosts = (items: GuestPost[]) => {
    if (!searchQuery) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredPosts = filterPosts(posts);
  const filteredQuestions = filterPosts(questions);

  const renderPostCard = (post: GuestPost) => (
    <Card
      key={post.id}
      className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 hover:border-primary/30 transition-all"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-slate-700">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              {post.name?.[0]?.toUpperCase() || 'G'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-white">{post.name}</span>
              {post.category && (
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  post.approved
                    ? "border-green-500/50 text-green-400"
                    : "border-yellow-500/50 text-yellow-400"
                )}
              >
                {post.approved
                  ? (isRTL ? 'معتمد' : 'Approved')
                  : (isRTL ? 'قيد المراجعة' : 'Pending')}
              </Badge>
            </div>
            <p className="text-slate-300 line-clamp-3 mb-3 text-sm leading-relaxed">
              {post.content}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString(isRTL ? 'ar-DZ' : 'en-US')}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {post.likesCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post.commentCount || post.comments?.length || 0}
              </span>
            </div>
            
            {/* Comments preview */}
            {post.comments && post.comments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-2">
                  {isRTL ? `${post.comments.length} تعليق` : `${post.comments.length} comments`}
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {post.comments.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="text-xs bg-slate-800/50 p-2 rounded-lg">
                      <span className="font-medium text-slate-300">{comment.name}: </span>
                      <span className="text-slate-400 line-clamp-1">{comment.content}</span>
                    </div>
                  ))}
                  {post.comments.length > 3 && (
                    <p className="text-xs text-slate-500">
                      {isRTL ? `+${post.comments.length - 3} تعليقات أخرى` : `+${post.comments.length - 3} more comments`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 shrink-0"
            onClick={() => handleDeletePost(post.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-400">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{posts.length}</p>
                <p className="text-sm text-slate-400">
                  {isRTL ? 'منشورات الزوار' : 'Guest Posts'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{questions.length}</p>
                <p className="text-sm text-slate-400">
                  {isRTL ? 'أسئلة الزوار' : 'Guest Questions'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400",
            isRTL ? "right-4" : "left-4"
          )} />
          <Input
            placeholder={isRTL ? "بحث في المنشورات..." : "Search posts..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-12 bg-slate-800 border-white/10 text-white placeholder:text-slate-400",
              isRTL ? "pr-12" : "pl-12"
            )}
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 border-white/20 text-white hover:bg-white/10"
          onClick={fetchGuestPosts}
        >
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-white/10">
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500"
          >
            <Users className="h-4 w-4 mr-2" />
            {isRTL ? 'المنشورات' : 'Posts'} ({filteredPosts.length})
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {isRTL ? 'الأسئلة' : 'Questions'} ({filteredQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(renderPostCard)
          ) : (
            <Card className="bg-slate-800 border-white/10">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-400">
                  {isRTL ? 'لا يوجد منشورات' : 'No posts found'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4 mt-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(renderPostCard)
          ) : (
            <Card className="bg-slate-800 border-white/10">
              <CardContent className="py-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-400">
                  {isRTL ? 'لا يوجد أسئلة' : 'No questions found'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
