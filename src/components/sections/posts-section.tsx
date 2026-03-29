'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { translations, Locale } from '@/lib/translations';
import {
  MessageSquare,
  Heart,
  Send,
  Home,
  Loader2,
  MessageCircle,
  Lightbulb,
  BookOpen,
  Newspaper,
  Megaphone,
  FileText,
  Search,
  ChevronLeft,
  Layers,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';

interface PostsSectionProps {
  onBack?: () => void;
}

// Post categories
const POST_CATEGORIES = [
  { id: 'discussion', icon: MessageCircle, color: 'bg-blue-500', names: { ar: 'نقاش', fr: 'Discussion', en: 'Discussion' } },
  { id: 'advice', icon: Lightbulb, color: 'bg-yellow-500', names: { ar: 'نصيحة', fr: 'Conseil', en: 'Advice' } },
  { id: 'experience', icon: BookOpen, color: 'bg-purple-500', names: { ar: 'تجربة', fr: 'Expérience', en: 'Experience' } },
  { id: 'news', icon: Newspaper, color: 'bg-green-500', names: { ar: 'أخبار', fr: 'Actualités', en: 'News' } },
  { id: 'announcement', icon: Megaphone, color: 'bg-orange-500', names: { ar: 'إعلان', fr: 'Annonce', en: 'Announcement' } },
  { id: 'other', icon: FileText, color: 'bg-gray-500', names: { ar: 'أخرى', fr: 'Autre', en: 'Other' } },
];

interface Post {
  id: string;
  title?: string;
  content: string;
  images?: string;
  category?: string;
  author: { id: string; name: string; avatar?: string; role: string; };
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: string;
  editToken?: string; // Token for editing/deleting
}

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string; avatar?: string; };
  createdAt: string;
  editToken?: string; // For ownership check
}

const roleColors: Record<string, string> = {
  CIVIL_ENGINEER: 'bg-blue-500',
  CONTRACTOR: 'bg-orange-500',
  ENGINEERING_OFFICE: 'bg-purple-500',
  CRAFTSMAN: 'bg-amber-500',
  CONSTRUCTION_COMPANY: 'bg-green-500',
  STORE_FACTORY: 'bg-cyan-500',
  NORMAL_USER: 'bg-gray-500',
  ADMIN: 'bg-red-500',
};

const roleLabelsAr: Record<string, string> = {
  CIVIL_ENGINEER: 'مهندس مدني',
  CONTRACTOR: 'مقاول',
  ENGINEERING_OFFICE: 'مكتب دراسات',
  CRAFTSMAN: 'حرفي',
  CONSTRUCTION_COMPANY: 'شركة بناء',
  STORE_FACTORY: 'متجر / مصنع',
  NORMAL_USER: 'مستخدم',
  ADMIN: 'مدير',
};

// Helper functions for localStorage
const MY_POSTS_KEY = 'dzbuild_my_posts';
const MY_COMMENTS_KEY = 'dzbuild_my_comments';

function getMyPostTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(MY_POSTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveMyPostToken(postId: string, token: string) {
  if (typeof window === 'undefined') return;
  try {
    const tokens = getMyPostTokens();
    tokens[postId] = token;
    localStorage.setItem(MY_POSTS_KEY, JSON.stringify(tokens));
  } catch {
    console.error('Failed to save post token');
  }
}

function removeMyPostToken(postId: string) {
  if (typeof window === 'undefined') return;
  try {
    const tokens = getMyPostTokens();
    delete tokens[postId];
    localStorage.setItem(MY_POSTS_KEY, JSON.stringify(tokens));
  } catch {
    console.error('Failed to remove post token');
  }
}

function getMyCommentTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(MY_COMMENTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveMyCommentToken(commentId: string, token: string) {
  if (typeof window === 'undefined') return;
  try {
    const tokens = getMyCommentTokens();
    tokens[commentId] = token;
    localStorage.setItem(MY_COMMENTS_KEY, JSON.stringify(tokens));
  } catch {
    console.error('Failed to save comment token');
  }
}

function removeMyCommentToken(commentId: string) {
  if (typeof window === 'undefined') return;
  try {
    const tokens = getMyCommentTokens();
    delete tokens[commentId];
    localStorage.setItem(MY_COMMENTS_KEY, JSON.stringify(tokens));
  } catch {
    console.error('Failed to remove comment token');
  }
}

export function PostsSection({ onBack }: PostsSectionProps) {
  const { user, locale, isLoggedIn } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.postsSection;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Edit & Delete states for posts
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Edit & Delete states for comments
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  
  // Track user's own posts and comments
  const [myPostTokens, setMyPostTokens] = useState<Record<string, string>>({});
  const [myCommentTokens, setMyCommentTokens] = useState<Record<string, string>>({});
  
  // Guest states
  const [guestName, setGuestName] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 5, num2: 3, answer: 8 });
  const [captchaInput, setCaptchaInput] = useState('');

  // Load user's post and comment tokens from localStorage
  useEffect(() => {
    setMyPostTokens(getMyPostTokens());
    setMyCommentTokens(getMyCommentTokens());
  }, []);

  useEffect(() => {
    if (selectedCategory !== null) fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      const res = await fetch(`/api/guest/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return POST_CATEGORIES.find(c => c.id === categoryId) || POST_CATEGORIES[5];
  };

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: num1 + num2 });
    setCaptchaInput('');
  };

  // Check if user owns a post
  const isPostOwner = (post: Post): boolean => {
    // Admin can always edit/delete
    if (isLoggedIn && user?.role === 'ADMIN') return true;
    // Check if user has the edit token for this post
    return myPostTokens[post.id] === post.editToken;
  };

  // Check if user owns a comment (based on localStorage token)
  const isCommentOwner = (comment: Comment): boolean => {
    // Admin can always edit/delete
    if (isLoggedIn && user?.role === 'ADMIN') return true;
    // Check if user has stored a token for this comment (means they created it)
    return !!myCommentTokens[comment.id];
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    if (!isLoggedIn) {
      if (!guestName.trim()) {
        alert(isRTL ? 'يرجى كتابة اسمك' : 'Please enter your name');
        return;
      }
      if (parseInt(captchaInput) !== captcha.answer) {
        alert(isRTL ? 'التحقق غير صحيح' : 'Invalid CAPTCHA');
        generateCaptcha();
        return;
      }
    }

    setPosting(true);
    try {
      const res = await fetch('/api/guest/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newPostContent.trim(),
          category: selectedCategory !== 'all' ? selectedCategory : 'discussion',
          name: user?.name || guestName.trim() || 'زائر'
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.post) {
        // Save the edit token to localStorage
        if (data.post.editToken) {
          saveMyPostToken(data.post.id, data.post.editToken);
          setMyPostTokens(getMyPostTokens());
        }
        
        setPosts([data.post, ...posts]);
        setNewPostContent('');
        setGuestName('');
        setCaptchaInput('');
        generateCaptcha();
      } else {
        alert(data.error || 'فشل إنشاء المنشور');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('خطأ في الاتصال');
    } finally {
      setPosting(false);
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
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, isLiked: data.liked, likeCount: data.likes }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const openComments = async (post: Post) => {
    setSelectedPost(post);
    setLoadingComments(true);
    
    try {
      const res = await fetch(`/api/guest/comments?postId=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      const res = await fetch('/api/guest/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPost.id,
          content: newComment.trim(),
          name: user?.name || guestName.trim() || 'زائر',
          captchaAnswer: 'skip',
        }),
      });

      const data = await res.json();

      if (res.ok && data.comment) {
        // Save the edit token to localStorage (for ownership tracking)
        if (data.comment.editToken) {
          saveMyCommentToken(data.comment.id, data.comment.editToken);
          setMyCommentTokens(getMyCommentTokens());
        }
        
        setComments([data.comment, ...comments]);
        setNewComment('');
        setPosts(posts.map(post => 
          post.id === selectedPost.id 
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        ));
      } else {
        alert(data.error || 'فشل إضافة التعليق');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('خطأ في الاتصال');
    }
  };

  // Edit comment
  const handleEditComment = async () => {
    if (!editingComment || !editCommentContent.trim()) return;
    
    setActionLoading(true);
    try {
      const isAdmin = isLoggedIn && user?.role === 'ADMIN';
      const editToken = myCommentTokens[editingComment.id];
      
      const res = await fetch('/api/guest/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingComment.id,
          content: editCommentContent.trim(),
          editToken: editToken,
          isAdmin: isAdmin,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.comment) {
        setComments(comments.map(c => c.id === editingComment.id ? { ...c, content: data.comment.content } : c));
        setEditingComment(null);
        setEditCommentContent('');
      } else {
        alert(data.error || 'فشل التعديل');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async () => {
    if (!deletingComment) return;
    
    setActionLoading(true);
    try {
      const isAdmin = isLoggedIn && user?.role === 'ADMIN';
      const editToken = myCommentTokens[deletingComment.id];
      
      const url = `/api/guest/comments?id=${deletingComment.id}&isAdmin=${isAdmin}${editToken ? `&editToken=${editToken}` : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      
      const data = await res.json();
      
      if (res.ok) {
        // Remove from localStorage
        removeMyCommentToken(deletingComment.id);
        setMyCommentTokens(getMyCommentTokens());
        
        setComments(comments.filter(c => c.id !== deletingComment.id));
        setPosts(posts.map(post => 
          post.id === selectedPost?.id 
            ? { ...post, commentCount: Math.max(0, post.commentCount - 1) }
            : post
        ));
        setDeletingComment(null);
      } else {
        alert(data.error || 'فشل الحذف');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit post
  const handleEditPost = async () => {
    if (!editingPost || !editContent.trim()) return;
    
    setActionLoading(true);
    try {
      const isAdmin = isLoggedIn && user?.role === 'ADMIN';
      const editToken = myPostTokens[editingPost.id];
      
      const res = await fetch('/api/guest/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPost.id,
          content: editContent.trim(),
          category: editingPost.category,
          editToken: editToken,
          isAdmin: isAdmin,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.post) {
        setPosts(posts.map(p => p.id === editingPost.id ? data.post : p));
        setEditingPost(null);
        setEditContent('');
      } else {
        alert(data.error || 'فشل التعديل');
      }
    } catch (error) {
      console.error('Error editing post:', error);
      alert('خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!deletingPost) return;
    
    setActionLoading(true);
    try {
      const isAdmin = isLoggedIn && user?.role === 'ADMIN';
      const editToken = myPostTokens[deletingPost.id];
      
      const url = `/api/guest/posts?id=${deletingPost.id}&isAdmin=${isAdmin}${editToken ? `&editToken=${editToken}` : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Remove from localStorage
        removeMyPostToken(deletingPost.id);
        setMyPostTokens(getMyPostTokens());
        
        setPosts(posts.filter(p => p.id !== deletingPost.id));
        setDeletingPost(null);
      } else {
        alert(data.error || 'فشل الحذف');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return locale === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return locale === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    return locale === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  // Category Selection View
  if (selectedCategory === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              {t.title[locale]}
            </h1>
            <p className="text-muted-foreground">{t.subtitle[locale]}</p>
          </div>
          {onBack && (
            <Button variant="default" onClick={onBack} className="gap-2">
              <Home className="h-4 w-4" />
              {translations.home[locale]}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary" onClick={() => setSelectedCategory('all')}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white bg-primary"><Layers className="h-6 w-6" /></div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{t.allPosts[locale]}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.allPostsDesc[locale]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {POST_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-all hover:border-primary" onClick={() => setSelectedCategory(category.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-xl text-white', category.color)}><IconComponent className="h-6 w-6" /></div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{category.names[locale as 'ar' | 'fr' | 'en'] || category.names.en}</h3>
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

  const currentCategory = POST_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || MessageSquare;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setSelectedCategory(null)} className="gap-2">
          <ChevronLeft className={isRTL ? "rotate-180" : ""} />
          {translations.backToList[locale]}
        </Button>
        {onBack && (
          <Button variant="default" onClick={onBack} className="gap-2">
            <Home className="h-4 w-4" />
            {translations.home[locale]}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg text-white', currentCategory?.color || 'bg-primary')}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{selectedCategory === 'all' ? t.allPosts[locale] : currentCategory?.names[locale as 'ar' | 'fr' | 'en']}</CardTitle>
              <CardDescription>{posts.length} {locale === 'ar' ? 'منشور' : 'posts'}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search[locale]} className={isRTL ? "pr-10" : "pl-10"} />
          </div>
        </CardContent>
      </Card>

      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className={cn('text-white text-sm', roleColors[user?.role || 'NORMAL_USER'])}>
                {user ? getInitials(user.name) : 'ز'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              {!isLoggedIn && (
                <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={isRTL ? "اسمك (مطلوب)" : "Your name"} className="w-full" />
              )}
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={locale === 'ar' ? 'أنشئ منشوراً...' : 'Create a post...'}
                className="w-full min-h-[80px] resize-none border-0 bg-muted/50 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {!isLoggedIn && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">{captcha.num1} + {captcha.num2} = ?</span>
                  <Input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="؟" className="w-20 h-8" />
                  <Button variant="ghost" size="sm" onClick={generateCaptcha}>🔄</Button>
                </div>
              )}
              <div className="flex justify-end">
                <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim() || posting} className="gap-2">
                  {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" />{locale === 'ar' ? 'نشر' : 'Post'}</>}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t.noPosts[locale]}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const categoryInfo = getCategoryInfo(post.category || 'other');
            const IconComponent = categoryInfo.icon;
            const canModify = isPostOwner(post);
            
            return (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={cn('text-white text-sm', roleColors[post.author.role])}>
                        {getInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{post.author.name}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">{roleLabelsAr[post.author.role] || post.author.role}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    
                    {/* Actions Menu - Show for post owners and admins */}
                    {canModify && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                          <DropdownMenuItem onClick={() => { setEditingPost(post); setEditContent(post.content); }}>
                            <Pencil className="h-4 w-4 me-2" />
                            {locale === 'ar' ? 'تعديل' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeletingPost(post)}>
                            <Trash2 className="h-4 w-4 me-2" />
                            {locale === 'ar' ? 'حذف' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    
                    <div className={cn('p-2 rounded-lg text-white shrink-0', categoryInfo.color)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap mb-3 text-sm leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 py-2 border-y">
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{post.likeCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.commentCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className={cn("gap-1.5 h-8", post.isLiked && "text-pink-500")} onClick={() => handleLike(post.id)}>
                        <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                        <span className="hidden sm:inline text-xs">{locale === 'ar' ? 'إعجاب' : "Like"}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={() => openComments(post)}>
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline text-xs">{locale === 'ar' ? 'تعليق' : 'Comment'}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comments Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              {locale === 'ar' ? 'التعليقات' : 'Comments'}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{locale === 'ar' ? 'لا توجد تعليقات' : 'No comments'}</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const canModifyComment = isCommentOwner(comment);
                  
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">{getInitials(comment.author.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                          </div>
                          
                          {/* Comment Actions Menu */}
                          {canModifyComment && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem onClick={() => {
                                  setEditingComment(comment);
                                  setEditCommentContent(comment.content);
                                }}>
                                  <Pencil className="h-4 w-4 me-2" />
                                  {locale === 'ar' ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeletingComment(comment)}>
                                  <Trash2 className="h-4 w-4 me-2" />
                                  {locale === 'ar' ? 'حذف' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex gap-2 pt-4 border-t">
            <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={locale === 'ar' ? 'أضف تعليقاً...' : 'Add a comment...'} className="flex-1" onKeyDown={(e) => { if (e.key === 'Enter' && newComment.trim()) handleAddComment(); }} />
            <Button size="sm" disabled={!newComment.trim()} onClick={handleAddComment}><Send className="h-4 w-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'تعديل المنشور' : 'Edit Post'}</DialogTitle>
          </DialogHeader>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[120px] resize-none border rounded-md p-3 text-sm"
            placeholder={locale === 'ar' ? 'محتوى المنشور...' : 'Post content...'}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingPost(null)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleEditPost} disabled={!editContent.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : locale === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPost} onOpenChange={() => setDeletingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
            <DialogDescription>
              {locale === 'ar' ? 'هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this post? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingPost(null)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleDeletePost} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : locale === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Comment Dialog */}
      <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'تعديل التعليق' : 'Edit Comment'}</DialogTitle>
          </DialogHeader>
          <textarea
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
            className="w-full min-h-[100px] resize-none border rounded-md p-3 text-sm"
            placeholder={locale === 'ar' ? 'محتوى التعليق...' : 'Comment content...'}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingComment(null)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleEditComment} disabled={!editCommentContent.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : locale === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Confirmation Dialog */}
      <Dialog open={!!deletingComment} onOpenChange={() => setDeletingComment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'تأكيد حذف التعليق' : 'Confirm Delete Comment'}</DialogTitle>
            <DialogDescription>
              {locale === 'ar' ? 'هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this comment? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingComment(null)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleDeleteComment} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : locale === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PostsSection;
