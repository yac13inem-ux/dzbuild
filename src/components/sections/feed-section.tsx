'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Wrench,
  FileText,
  MoreHorizontal,
  Loader2,
  Home,
  ChevronLeft,
  Trash2,
  Edit,
  Clock,
  Users,
  Eye,
  X,
} from 'lucide-react';

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

const postTypeIcons: Record<string, any> = {
  standard: FileText,
  project: Building2,
  job: Briefcase,
  service: Wrench,
  product: FileText,
};

interface Author {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  specialization?: string;
  city?: string;
  wilaya?: string;
}

interface Post {
  id: string;
  content: string;
  title?: string;
  post_type: string;
  images?: string[];
  videos?: string[];
  category?: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count?: number;
  views_count?: number;
  is_featured?: boolean;
  is_sponsored?: boolean;
  is_liked?: boolean;
  created_at: string;
  author: Author;
}

interface FeedSectionProps {
  onBack?: () => void;
}

export function FeedSection({ onBack }: FeedSectionProps) {
  const { locale, user, isLoggedIn } = useAppStore();
  const isRTL = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?limit=20');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && selectedImages.length === 0) || !user) return;
    
    setPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: user.id,
          content: newPostContent.trim(),
          post_type: 'standard',
          images: selectedImages,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => [data.post, ...prev]);
        setNewPostContent('');
        setSelectedImages([]);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const maxImages = 4;
    const remainingSlots = maxImages - selectedImages.length;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === Math.min(files.length, remainingSlots)) {
              setSelectedImages(prev => [...prev, ...newImages].slice(0, maxImages));
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLike = async (postId: string) => {
    if (!isLoggedIn) return;
    
    try {
      await fetch('/api/posts/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          target_id: postId,
          target_type: 'post',
        }),
      });
      
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: !p.is_liked,
            likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1,
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim() || !user) return;
    
    setSubmittingComment(postId);
    try {
      await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          post_id: postId,
          content: text.trim(),
        }),
      });
      
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, comments_count: p.comments_count + 1 };
        }
        return p;
      }));
      
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error commenting:', error);
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user || !confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنشور؟' : 'Êtes-vous sûr de vouloir supprimer ce post?')) {
      return;
    }
    
    try {
      await fetch(`/api/posts?id=${postId}&userId=${user.id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return isRTL ? 'الآن' : 'Maintenant';
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      return isRTL ? `منذ ${mins} دقيقة` : `Il y a ${mins} min`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return isRTL ? `منذ ${hours} ساعة` : `Il y a ${hours}h`;
    }
    if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      return isRTL ? `منذ ${days} يوم` : `Il y a ${days}j`;
    }
    return date.toLocaleDateString(isRTL ? 'ar-DZ' : 'fr-FR');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <div className="space-y-4" ref={feedRef}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {isRTL ? 'المنشورات' : 'Publications'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'آخر أخبار مجتمع البناء' : 'Dernières actualités de la communauté'}
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="gap-2">
            <Home className="h-4 w-4" />
            {translations.home[locale]}
          </Button>
        )}
      </div>

      {/* Create Post Card */}
      {isLoggedIn && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className={cn('text-white', roleColors[user?.role || 'NORMAL_USER'])}>
                  {getInitials(user?.name || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder={isRTL ? 'شارك شيئاً مع المجتمع...' : 'Partagez quelque chose avec la communauté...'}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                  disabled={posting}
                />

                {/* Selected Images Preview */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    {selectedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-muted-foreground"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={selectedImages.length >= 4}
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{isRTL ? 'صورة' : 'Photo'}</span>
                      {selectedImages.length > 0 && (
                        <span className="text-xs">({selectedImages.length}/4)</span>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">{isRTL ? 'موقع' : 'Lieu'}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span className="hidden sm:inline">{isRTL ? 'وظيفة' : 'Emploi'}</span>
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={handleCreatePost}
                    disabled={(!newPostContent.trim() && selectedImages.length === 0) || posting}
                  >
                    {posting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isRTL ? 'نشر' : 'Publier'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login prompt if not logged in */}
      {!isLoggedIn && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">
              {isRTL 
                ? 'سجل الدخول للمشاركة في المنشورات والتعليقات' 
                : 'Connectez-vous pour participer aux publications et commentaires'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const TypeIcon = postTypeIcons[post.post_type] || FileText;
            
            return (
              <Card key={post.id} className="shadow-sm overflow-hidden">
                {/* Sponsored/Featured Badge */}
                {(post.is_featured || post.is_sponsored) && (
                  <div className="bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary flex items-center gap-1">
                    {post.is_sponsored ? (
                      <>
                        <Eye className="h-3 w-3" />
                        {isRTL ? 'إعلان ممول' : 'Sponsorisé'}
                      </>
                    ) : (
                      <>
                        <Building2 className="h-3 w-3" />
                        {isRTL ? 'منشور مميز' : 'En vedette'}
                      </>
                    )}
                  </div>
                )}
                
                <CardContent className="p-4">
                  {/* Author Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author?.avatar} />
                      <AvatarFallback className={cn('text-white text-sm', roleColors[post.author?.role || 'NORMAL_USER'])}>
                        {getInitials(post.author?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{post.author?.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {roleLabelsAr[post.author?.role] || post.author?.role}
                        </Badge>
                        {post.author?.specialization && (
                          <span className="text-xs text-muted-foreground">
                            • {post.author.specialization}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(post.created_at)}
                        {post.author?.city && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{post.author.city}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {user?.id === post.author?.id && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  {post.title && (
                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                  )}
                  <p className="text-foreground whitespace-pre-wrap break-words mb-3">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 5).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className={cn(
                      "grid gap-1 mb-3 rounded-lg overflow-hidden",
                      post.images.length === 1 ? "grid-cols-1" :
                      post.images.length === 2 ? "grid-cols-2" :
                      "grid-cols-2"
                    )}>
                      {post.images.slice(0, 4).map((img, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "relative bg-muted",
                            post.images!.length === 3 && i === 0 && "col-span-2"
                          )}
                        >
                          <img 
                            src={img} 
                            alt="" 
                            className="w-full h-48 sm:h-64 object-cover"
                          />
                          {i === 3 && post.images!.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-xl font-bold">
                                +{post.images!.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground py-2 border-t border-b mb-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-red-500" />
                      {post.likes_count} {isRTL ? 'إعجاب' : 'J\'aime'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.comments_count} {isRTL ? 'تعليق' : 'commentaires'}
                    </span>
                    {post.views_count && post.views_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.views_count} {isRTL ? 'مشاهدة' : 'vues'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "flex-1 gap-1",
                          post.is_liked && "text-red-500"
                        )}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={cn("h-4 w-4", post.is_liked && "fill-current")} />
                        {isRTL ? 'إعجاب' : 'J\'aime'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 gap-1"
                        onClick={() => setExpandedComments(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(post.id)) {
                            newSet.delete(post.id);
                          } else {
                            newSet.add(post.id);
                          }
                          return newSet;
                        })}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {isRTL ? 'تعليق' : 'Commenter'}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 gap-1">
                        <Share2 className="h-4 w-4" />
                        {isRTL ? 'مشاركة' : 'Partager'}
                      </Button>
                    </div>
                  </div>

                  {/* Comment Input */}
                  {expandedComments.has(post.id) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={cn('text-white text-xs', roleColors[user?.role || 'NORMAL_USER'])}>
                            {user ? getInitials(user.name || '') : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder={isRTL ? 'اكتب تعليقاً...' : 'Écrire un commentaire...'}
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                            className="flex-1"
                            disabled={!isLoggedIn || submittingComment === post.id}
                          />
                          <Button 
                            size="icon" 
                            onClick={() => handleComment(post.id)}
                            disabled={!isLoggedIn || !commentText[post.id]?.trim() || submittingComment === post.id}
                          >
                            {submittingComment === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isRTL ? 'لا توجد منشورات' : 'Aucune publication'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'كن أول من ينشر شيئاً!' : 'Soyez le premier à publier!'}
          </p>
        </div>
      )}
    </div>
  );
}

export default FeedSection;
