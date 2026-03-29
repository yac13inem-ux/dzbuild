'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  Shield,
  LogOut,
  Users,
  MessageSquare,
  ThumbsUp,
  Eye,
  Trash2,
  Edit,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Home,
  Building2,
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
  createdAt: string;
  comments?: GuestComment[];
}

interface GuestComment {
  id: string;
  postId: string;
  name: string;
  content: string;
  createdAt: string;
}

interface Stats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  postsSectionCount: number;
  questionsSectionCount: number;
}

export function GuestAdminDashboard() {
  const { locale, user, logout } = useAppStore();
  const isRTL = locale === 'ar';

  const [posts, setPosts] = useState<GuestPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    postsSectionCount: 0,
    questionsSectionCount: 0,
  });

  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState<GuestPost | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'post' | 'comment'>('post');
  const [commentToDelete, setCommentToDelete] = useState<{ commentId: string; postId: string } | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guest/posts');
      const data = await res.json();
      setPosts(data.posts || []);

      // Calculate stats
      const allPosts = data.posts || [];
      const totalComments = allPosts.reduce((sum: number, p: GuestPost) => sum + (p.commentCount || 0), 0);
      const totalLikes = allPosts.reduce((sum: number, p: GuestPost) => sum + (p.likeCount || 0), 0);

      setStats({
        totalPosts: allPosts.length,
        totalComments,
        totalLikes,
        postsSectionCount: allPosts.filter((p: GuestPost) => p.section === 'posts').length,
        questionsSectionCount: allPosts.filter((p: GuestPost) => p.section === 'questions').length,
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/guest/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        setStats(prev => ({
          ...prev,
          totalPosts: prev.totalPosts - 1,
        }));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      const res = await fetch(`/api/guest/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              commentCount: Math.max(0, p.commentCount - 1),
              comments: p.comments?.filter(c => c.id !== commentId),
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setCommentToDelete(null);
      setDeleteConfirm(null);
    }
  };

  const openPostDetail = async (post: GuestPost) => {
    try {
      const res = await fetch(`/api/guest/posts/${post.id}`);
      const data = await res.json();
      setSelectedPost(data.post);
      setShowPostDialog(true);
    } catch (error) {
      console.error('Error fetching post detail:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return locale === 'ar' ? `منذ ${minutes} دقيقة` : locale === 'fr' ? `Il y a ${minutes} min` : `${minutes}m ago`;
    }
    if (hours < 24) {
      return locale === 'ar' ? `منذ ${hours} ساعة` : locale === 'fr' ? `Il y a ${hours}h` : `${hours}h ago`;
    }
    return locale === 'ar' ? `منذ ${days} يوم` : locale === 'fr' ? `Il y a ${days}j` : `${days}d ago`;
  };

  const sectionLabel = (section: string) => {
    return section === 'posts'
      ? (locale === 'ar' ? 'منشورات' : locale === 'fr' ? 'Publications' : 'Posts')
      : (locale === 'ar' ? 'أسئلة هندسية' : locale === 'fr' ? 'Questions' : 'Questions');
  };

  // Filter posts by tab
  const filteredPosts = posts.filter(p => {
    if (activeTab === 'posts') return p.section === 'posts';
    if (activeTab === 'questions') return p.section === 'questions';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {locale === 'ar' ? 'لوحة تحكم المسؤول' : locale === 'fr' ? 'Panneau Admin' : 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchPosts} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {locale === 'ar' ? 'تحديث' : locale === 'fr' ? 'Rafraîchir' : 'Refresh'}
              </Button>
              <Button variant="destructive" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                {locale === 'ar' ? 'خروج' : locale === 'fr' ? 'Déconnexion' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === 'ar' ? 'إجمالي المنشورات' : locale === 'fr' ? 'Total Posts' : 'Total Posts'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalComments}</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === 'ar' ? 'التعليقات' : locale === 'fr' ? 'Commentaires' : 'Comments'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === 'ar' ? 'الإعجابات' : locale === 'fr' ? 'Likes' : 'Likes'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.postsSectionCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === 'ar' ? 'منشورات' : 'Posts'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.questionsSectionCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === 'ar' ? 'أسئلة' : 'Questions'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="posts" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {locale === 'ar' ? 'منشورات' : 'Posts'}
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <Building2 className="h-4 w-4" />
              {locale === 'ar' ? 'أسئلة هندسية' : 'Questions'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {locale === 'ar' ? 'لا توجد منشورات' : locale === 'fr' ? 'Aucune publication' : 'No posts yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Author & Time */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{post.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {sectionLabel(post.section)}
                            </Badge>
                            {post.category && (
                              <Badge variant="outline" className="text-xs">
                                {post.category}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(post.createdAt)}
                            </span>
                          </div>

                          {/* Content */}
                          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                            {post.content}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {post.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              {post.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {post.commentCount}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPostDetail(post)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            {locale === 'ar' ? 'عرض' : 'View'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteType('post');
                              setDeleteConfirm(post.id);
                            }}
                            className="gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            {locale === 'ar' ? 'حذف' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {locale === 'ar' ? 'تفاصيل المنشور' : 'Post Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedPost?.name} • {formatTimeAgo(selectedPost?.createdAt || '')}
            </DialogDescription>
          </DialogHeader>

          {selectedPost && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Post Content */}
                <Card>
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                    {selectedPost.images && (
                      <img 
                        src={selectedPost.images} 
                        alt="" 
                        className="mt-3 rounded-lg max-h-64 object-contain"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Comments */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {locale === 'ar' ? `التعليقات (${selectedPost.comments?.length || selectedPost.commentCount})` : `Comments (${selectedPost.comments?.length || selectedPost.commentCount})`}
                  </h4>

                  {selectedPost.comments && selectedPost.comments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPost.comments.map((comment) => (
                        <Card key={comment.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{comment.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteType('comment');
                                  setCommentToDelete({ commentId: comment.id, postId: selectedPost.id });
                                  setDeleteConfirm(comment.id);
                                }}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {locale === 'ar' ? 'لا توجد تعليقات' : 'No comments yet'}
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'post'
                ? (locale === 'ar' ? 'هل أنت متأكد من حذف هذا المنشور؟ سيتم حذف جميع التعليقات المرتبطة به.' : 'Are you sure you want to delete this post? All associated comments will be deleted.')
                : (locale === 'ar' ? 'هل أنت متأكد من حذف هذا التعليق؟' : 'Are you sure you want to delete this comment?')
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteType === 'post' && deleteConfirm) {
                  handleDeletePost(deleteConfirm);
                } else if (deleteType === 'comment' && commentToDelete) {
                  handleDeleteComment(commentToDelete.commentId, commentToDelete.postId);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              {locale === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer className="mt-auto p-4 text-center text-muted-foreground text-sm border-t">
        © DzBuild Admin - {locale === 'ar' ? 'جميع الحقوق محفوظة' : locale === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}
      </footer>
    </div>
  );
}

export default GuestAdminDashboard;
