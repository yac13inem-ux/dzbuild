'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Captcha, useCaptcha } from '@/components/shared/captcha';
import {
  MessageSquare,
  Heart,
  Home,
  ChevronLeft,
  Loader2,
  MessageCircle,
  Lightbulb,
  BookOpen,
  Newspaper,
  Megaphone,
  FileText,
  Search,
  Send,
  Eye,
  Layers,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Key,
  AlertTriangle,
} from 'lucide-react';

interface GuestPostsSectionProps {
  onBack?: () => void;
}

// Post categories with icons and colors
const POST_CATEGORIES = [
  {
    id: 'discussion',
    icon: MessageCircle,
    color: 'bg-blue-500',
    names: { ar: 'نقاش', fr: 'Discussion', en: 'Discussion' },
    descriptions: { ar: 'نقاشات وتبادل الخبرات', fr: 'Discussions et partage', en: 'Discussions and sharing' }
  },
  {
    id: 'advice',
    icon: Lightbulb,
    color: 'bg-yellow-500',
    names: { ar: 'نصيحة', fr: 'Conseil', en: 'Advice' },
    descriptions: { ar: 'استشر المهندسين الخبراء', fr: 'Consultez les experts', en: 'Consult experts' }
  },
  {
    id: 'experience',
    icon: BookOpen,
    color: 'bg-purple-500',
    names: { ar: 'تجربة', fr: 'Expérience', en: 'Experience' },
    descriptions: { ar: 'شارك تجربتك الهندسية', fr: 'Partagez votre expérience', en: 'Share your experience' }
  },
  {
    id: 'news',
    icon: Newspaper,
    color: 'bg-green-500',
    names: { ar: 'أخبار', fr: 'Actualités', en: 'News' },
    descriptions: { ar: 'أخبار ومستجدات القطاع', fr: 'Actualités du secteur', en: 'Sector news' }
  },
  {
    id: 'announcement',
    icon: Megaphone,
    color: 'bg-orange-500',
    names: { ar: 'إعلان', fr: 'Annonce', en: 'Announcement' },
    descriptions: { ar: 'إعلانات هندسية', fr: 'Annonces techniques', en: 'Technical announcements' }
  },
  {
    id: 'other',
    icon: FileText,
    color: 'bg-gray-500',
    names: { ar: 'أخرى', fr: 'Autre', en: 'Other' },
    descriptions: { ar: 'مواضيع متنوعة', fr: 'Sujets divers', en: 'Various topics' }
  },
];

interface GuestPost {
  id: string;
  name: string;
  content: string;
  section: string;
  category: string | null;
  images: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isLiked?: boolean;
}

interface GuestComment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export function GuestPostsSection({ onBack }: GuestPostsSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';

  const [posts, setPosts] = useState<GuestPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New post form
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPostName, setNewPostName] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [posting, setPosting] = useState(false);
  const { isValid: captchaValid, answer: captchaAnswer, correctAnswer: captchaCorrect, handleValidChange } = useCaptcha();

  // Edit code dialog (shown after creating post)
  const [showEditCodeDialog, setShowEditCodeDialog] = useState(false);
  const [createdEditCode, setCreatedEditCode] = useState('');
  const [createdPostId, setCreatedPostId] = useState('');
  const [copied, setCopied] = useState(false);

  // Post detail view
  const [selectedPost, setSelectedPost] = useState<GuestPost | null>(null);
  const [postComments, setPostComments] = useState<GuestComment[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Comment form
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [commentCaptchaValid, setCommentCaptchaValid] = useState(false);
  const [commentCaptchaAnswer, setCommentCaptchaAnswer] = useState(0);
  const [commentCaptchaCorrect, setCommentCaptchaCorrect] = useState(0);
  const [commenting, setCommenting] = useState(false);

  // Edit/Delete functionality
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCodeInputDialog, setShowCodeInputDialog] = useState(false);
  const [editCodeInput, setEditCodeInput] = useState('');
  const [actionType, setActionType] = useState<'edit' | 'delete'>('edit');
  const [postToModify, setPostToModify] = useState<GuestPost | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [processing, setProcessing] = useState(false);
  const [codeError, setCodeError] = useState('');

  const fetchPosts = useCallback(async () => {
    if (selectedCategory === null) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('section', 'posts');
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`/api/guest/posts?${params.toString()}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter posts by search
  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.content?.toLowerCase().includes(query) ||
        post.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return POST_CATEGORIES.find(c => c.id === categoryId) || POST_CATEGORIES[5];
  };

  const handleCreatePost = async () => {
    if (!newPostName.trim() || !newPostContent.trim() || !captchaValid) return;

    setPosting(true);
    try {
      const res = await fetch('/api/guest/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPostName.trim(),
          content: newPostContent.trim(),
          section: 'posts',
          category: newPostCategory || 'discussion',
          captchaAnswer,
          captchaExpected: captchaCorrect,
        }),
      });

      const data = await res.json();

      if (res.ok && data.post) {
        setPosts([data.post, ...posts]);
        setShowNewPostDialog(false);
        setNewPostName('');
        setNewPostContent('');
        setNewPostCategory('');
        
        // Show edit code dialog
        setCreatedEditCode(data.editCode);
        setCreatedPostId(data.post.id);
        setShowEditCodeDialog(true);
      } else {
        alert(data.error || 'فشل إنشاء المنشور / Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('خطأ في الاتصال / Connection error');
    } finally {
      setPosting(false);
    }
  };

  const copyEditCode = async () => {
    try {
      await navigator.clipboard.writeText(createdEditCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = createdEditCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch('/api/guest/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: data.liked,
              likeCount: data.likeCount,
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const openPostDetail = async (post: GuestPost) => {
    setSelectedPost(post);
    setLoadingDetail(true);
    setNewCommentName('');
    setNewCommentContent('');
    setCommentCaptchaValid(false);

    try {
      const res = await fetch(`/api/guest/posts/${post.id}`);
      const data = await res.json();
      setSelectedPost(data.post);
      setPostComments(data.post?.comments || []);
    } catch (error) {
      console.error('Error fetching post detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentName.trim() || !newCommentContent.trim() || !commentCaptchaValid || !selectedPost) return;

    setCommenting(true);
    try {
      const res = await fetch('/api/guest/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPost.id,
          name: newCommentName.trim(),
          content: newCommentContent.trim(),
          captchaAnswer: commentCaptchaAnswer,
          captchaExpected: commentCaptchaCorrect,
        }),
      });

      const data = await res.json();

      if (res.ok && data.comment) {
        setPostComments([data.comment, ...postComments]);
        setNewCommentContent('');
        setCommentCaptchaValid(false);
        if (selectedPost) {
          setSelectedPost({
            ...selectedPost,
            commentCount: selectedPost.commentCount + 1,
          });
        }
      } else {
        alert(data.error || 'فشل إضافة التعليق / Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('خطأ في الاتصال / Connection error');
    } finally {
      setCommenting(false);
    }
  };

  // Edit/Delete handlers
  const openEditDialog = (post: GuestPost, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPostToModify(post);
    setEditName(post.name);
    setEditContent(post.content);
    setEditCategory(post.category || 'discussion');
    setActionType('edit');
    setShowCodeInputDialog(true);
    setEditCodeInput('');
    setCodeError('');
  };

  const openDeleteDialog = (post: GuestPost, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPostToModify(post);
    setActionType('delete');
    setShowCodeInputDialog(true);
    setEditCodeInput('');
    setCodeError('');
  };

  const verifyCodeAndProceed = async () => {
    if (!editCodeInput.trim() || editCodeInput.length !== 6) {
      setCodeError(locale === 'ar' ? 'الرمز يجب أن يتكون من 6 أرقام' : 'Code must be 6 digits');
      return;
    }

    setShowCodeInputDialog(false);
    
    if (actionType === 'edit') {
      setShowEditDialog(true);
    } else {
      setShowDeleteDialog(true);
    }
  };

  const handleEditPost = async () => {
    if (!postToModify || !editName.trim() || !editContent.trim() || !editCodeInput.trim()) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/guest/posts/${postToModify.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          content: editContent.trim(),
          category: editCategory,
          editCode: editCodeInput,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPosts(posts.map(p => p.id === postToModify.id ? { ...p, name: editName, content: editContent, category: editCategory } : p));
        setShowEditDialog(false);
        setPostToModify(null);
        setEditCodeInput('');
      } else {
        alert(data.error || 'فشل التعديل / Failed to edit');
      }
    } catch (error) {
      console.error('Error editing post:', error);
      alert('خطأ في الاتصال / Connection error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToModify || !editCodeInput.trim()) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/guest/posts/${postToModify.id}?editCode=${editCodeInput}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postToModify.id));
        setShowDeleteDialog(false);
        setPostToModify(null);
        setEditCodeInput('');
      } else {
        alert(data.error || 'فشل الحذف / Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('خطأ في الاتصال / Connection error');
    } finally {
      setProcessing(false);
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

  // Category Selection View
  if (selectedCategory === null) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              {locale === 'ar' ? 'المنشورات' : locale === 'fr' ? 'Publications' : 'Posts'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'شارك أفكارك وخبراتك مع المجتمع' : locale === 'fr' ? 'Partagez vos idées et expériences' : 'Share your ideas and experiences'}
            </p>
          </div>
          {onBack && (
            <Button variant="default" onClick={onBack} className="gap-2">
              <Home className="h-4 w-4" />
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Button>
          )}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* All Posts Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white bg-primary">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {locale === 'ar' ? 'جميع المنشورات' : locale === 'fr' ? 'Toutes les publications' : 'All Posts'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {locale === 'ar' ? 'تصفح جميع المنشورات' : locale === 'fr' ? 'Parcourir toutes les publications' : 'Browse all posts'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {POST_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-xl text-white', category.color)}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {category.names[locale as 'ar' | 'fr' | 'en'] || category.names.en}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.descriptions[locale as 'ar' | 'fr' | 'en'] || category.descriptions.en}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Post Detail View
  if (selectedPost) {
    const categoryInfo = getCategoryInfo(selectedPost.category || 'other');
    const CategoryIcon = categoryInfo.icon;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedPost(null)} className="gap-2">
            <ChevronLeft className={isRTL ? "rotate-180" : ""} />
            {locale === 'ar' ? 'العودة للقائمة' : 'Back to list'}
          </Button>
        </div>

        {/* Post Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg text-white', categoryInfo.color)}>
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{selectedPost.name}</CardTitle>
                <CardDescription className="flex items-center gap-3 mt-1">
                  <span>{formatTimeAgo(selectedPost.createdAt)}</span>
                  <span>•</span>
                  <span>{categoryInfo.names[locale as 'ar' | 'fr' | 'en']}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedPost.content}</p>
            {selectedPost.images && (
              <img src={selectedPost.images} alt="" className="mt-4 rounded-lg max-h-96 object-contain" />
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {selectedPost.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {selectedPost.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {selectedPost.commentCount}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={selectedPost.isLiked ? "default" : "outline"}
                className={cn("gap-2", selectedPost.isLiked && "bg-pink-500 hover:bg-pink-600")}
                onClick={() => handleLike(selectedPost.id)}
              >
                <Heart className={cn("h-4 w-4", selectedPost.isLiked && "fill-current")} />
                {locale === 'ar' ? 'إعجاب' : "J'aime"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={(e) => openEditDialog(selectedPost, e)}
              >
                <Edit className="h-4 w-4" />
                {locale === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => openDeleteDialog(selectedPost, e)}
              >
                <Trash2 className="h-4 w-4" />
                {locale === 'ar' ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {locale === 'ar' ? `التعليقات (${postComments.length})` : `Comments (${postComments.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment Form */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{locale === 'ar' ? 'اسمك' : 'Your Name'}</Label>
                  <Input
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">{locale === 'ar' ? 'تعليقك' : 'Your Comment'}</Label>
                <Textarea
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder={locale === 'ar' ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <Captcha
                locale={locale}
                onValidChange={(valid, ans, correct) => {
                  setCommentCaptchaValid(valid);
                  setCommentCaptchaAnswer(ans);
                  setCommentCaptchaCorrect(correct);
                }}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newCommentName.trim() || !newCommentContent.trim() || !commentCaptchaValid || commenting}
                className="gap-2"
              >
                {commenting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {locale === 'ar' ? 'إرسال' : 'Send'}
              </Button>
            </div>

            {/* Comments List */}
            {loadingDetail ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : postComments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {locale === 'ar' ? 'لا توجد تعليقات بعد. كن أول من يعلق!' : 'No comments yet. Be the first to comment!'}
              </p>
            ) : (
              <div className="space-y-3">
                {postComments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-card border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.name}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Posts List View
  const currentCategory = POST_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || MessageSquare;

  return (
    <div className="space-y-6">
      {/* Back Button & New Post */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedCategory(null)} className="gap-2">
            <ChevronLeft className={isRTL ? "rotate-180" : ""} />
            {locale === 'ar' ? 'العودة' : 'Back'}
          </Button>
          {onBack && (
            <Button variant="default" onClick={onBack} className="gap-2">
              <Home className="h-4 w-4" />
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Button>
          )}
        </div>
        <Button onClick={() => setShowNewPostDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {locale === 'ar' ? 'منشور جديد' : 'New Post'}
        </Button>
      </div>

      {/* Category Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg text-white', currentCategory?.color || 'bg-primary')}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>
                {selectedCategory === 'all'
                  ? (locale === 'ar' ? 'جميع المنشورات' : 'All Posts')
                  : currentCategory?.names[locale as 'ar' | 'fr' | 'en'] || currentCategory?.names.en
                }
              </CardTitle>
              <CardDescription>
                {filteredPosts.length} {locale === 'ar' ? 'منشور' : 'posts'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'ar' ? 'ابحث في المنشورات...' : 'Search posts...'}
              className={isRTL ? "pr-10" : "pl-10"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'لا توجد منشورات' : 'No posts yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {locale === 'ar' ? 'كن أول من ينشر!' : 'Be the first to post!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const categoryInfo = getCategoryInfo(post.category || 'other');
            const IconComponent = categoryInfo.icon;

            return (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-lg transition-all"
              >
                <CardContent className="p-4">
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-3 cursor-pointer" onClick={() => openPostDetail(post)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{post.name}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {categoryInfo.names[locale as 'ar' | 'fr' | 'en']}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    <div className={cn('p-2 rounded-lg text-white shrink-0', categoryInfo.color)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="whitespace-pre-wrap mb-3 text-sm leading-relaxed line-clamp-3 cursor-pointer" onClick={() => openPostDetail(post)}>{post.content}</p>

                  {/* Post Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 py-2 border-y">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.commentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {post.viewCount}
                    </span>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("gap-1.5 h-8", post.isLiked && "text-pink-500")}
                        onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                      >
                        <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                        <span className="hidden sm:inline text-xs">
                          {locale === 'ar' ? 'إعجاب' : "Like"}
                        </span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1.5 h-8"
                        onClick={() => openPostDetail(post)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline text-xs">
                          {locale === 'ar' ? 'تعليق' : 'Comment'}
                        </span>
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => openEditDialog(post, e)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-8 text-muted-foreground hover:text-red-500"
                        onClick={(e) => openDeleteDialog(post, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Post Dialog */}
      <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {locale === 'ar' ? 'منشور جديد' : 'New Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{locale === 'ar' ? 'اسمك' : 'Your Name'}</Label>
              <Input
                value={newPostName}
                onChange={(e) => setNewPostName(e.target.value)}
                placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{locale === 'ar' ? 'القسم' : 'Category'}</Label>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
              >
                {POST_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.names[locale as 'ar' | 'fr' | 'en']}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'المحتوى' : 'Content'}</Label>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={locale === 'ar' ? 'اكتب منشورك هنا...' : 'Write your post here...'}
                className="mt-1 min-h-[120px]"
              />
            </div>
            <Captcha
              locale={locale}
              onValidChange={handleValidChange}
            />
            <Button
              onClick={handleCreatePost}
              disabled={!newPostName.trim() || !newPostContent.trim() || !captchaValid || posting}
              className="w-full gap-2"
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {locale === 'ar' ? 'نشر' : 'Publish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Code Dialog - Shown after creating post */}
      <Dialog open={showEditCodeDialog} onOpenChange={setShowEditCodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              {locale === 'ar' ? 'تم نشر منشورك بنجاح!' : 'Post Published Successfully!'}
            </DialogTitle>
            <DialogDescription className="text-left">
              {locale === 'ar' 
                ? 'احفظ هذا الرمز السري لتتمكن من تعديل أو حذف منشورك لاحقاً:'
                : 'Save this secret code to edit or delete your post later:'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
              <Key className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold tracking-widest text-primary">{createdEditCode}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyEditCode}
                className="ml-auto"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {locale === 'ar' 
                  ? '⚠️ مهم: لن يظهر هذا الرمز مرة أخرى! احفظه الآن.'
                  : '⚠️ Important: This code will not be shown again! Save it now.'}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => setShowEditCodeDialog(false)}
            >
              {locale === 'ar' ? 'فهمت' : 'Got it'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Code Input Dialog - For edit/delete verification */}
      <Dialog open={showCodeInputDialog} onOpenChange={setShowCodeInputDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {locale === 'ar' ? 'أدخل الرمز السري' : 'Enter Secret Code'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'ar' 
                ? `أدخل الرمز السري المكون من 6 أرقام لل${actionType === 'edit' ? 'تعديل' : 'حذف'}`
                : `Enter the 6-digit code to ${actionType === 'edit' ? 'edit' : 'delete'}`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              type="text"
              maxLength={6}
              value={editCodeInput}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setEditCodeInput(value);
                setCodeError('');
              }}
              placeholder="000000"
              className="text-center text-2xl tracking-widest font-bold"
            />
            {codeError && (
              <p className="text-sm text-red-500 text-center">{codeError}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCodeInputDialog(false);
                  setEditCodeInput('');
                  setPostToModify(null);
                }}
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                className="flex-1"
                onClick={verifyCodeAndProceed}
                disabled={editCodeInput.length !== 6}
              >
                {locale === 'ar' ? 'تأكيد' : 'Verify'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {locale === 'ar' ? 'تعديل المنشور' : 'Edit Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{locale === 'ar' ? 'الاسم' : 'Name'}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{locale === 'ar' ? 'القسم' : 'Category'}</Label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
              >
                {POST_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.names[locale as 'ar' | 'fr' | 'en']}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'المحتوى' : 'Content'}</Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mt-1 min-h-[120px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowEditDialog(false);
                  setPostToModify(null);
                }}
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                className="flex-1"
                onClick={handleEditPost}
                disabled={!editName.trim() || !editContent.trim() || processing}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {locale === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'ar' 
                ? 'هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this post? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPostToModify(null)}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeletePost}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {locale === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default GuestPostsSection;
