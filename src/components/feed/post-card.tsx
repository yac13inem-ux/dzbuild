'use client';

import { useState } from 'react';
import { useAppStore, type Post } from '@/stores/app-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  MapPin,
  Briefcase,
  Send,
  Image as ImageIcon,
  Video,
  Calendar,
  Users,
  Package,
  Wrench,
  FileText,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string, liked: boolean) => void;
  onComment?: (postId: string, content: string) => void;
  onDelete?: (postId: string) => void;
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

const postTypeIcons: Record<string, React.ElementType> = {
  standard: FileText,
  project: Briefcase,
  job_offer: Users,
  service: Wrench,
  product: Package,
  consultation: MessageCircle,
  achievement: Calendar,
};

const postTypeLabelsAr: Record<string, string> = {
  standard: 'منشور',
  project: 'مشروع',
  job_offer: 'عرض عمل',
  service: 'خدمة',
  product: 'منتج',
  consultation: 'استشارة',
  problem: 'مشكلة',
  guide: 'دليل',
  achievement: 'إنجاز',
};

export function PostCard({ post, onLike, onComment, onDelete }: PostCardProps) {
  const { locale, user } = useAppStore();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const isRTL = locale === 'ar';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isRTL ? 'الآن' : 'Now';
    if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    if (days < 7) return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
    return date.toLocaleDateString(isRTL ? 'ar-DZ' : 'fr-FR');
  };

  const handleLike = async () => {
    if (!user) return;

    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      await fetch('/api/posts/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          target_type: 'post',
          target_id: post.id,
        }),
      });
    } catch (error) {
      setIsLiked(!newLiked);
      setLikesCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const handleOpenComments = async () => {
    setShowComments(true);
    if (comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/comments?postId=${post.id}`);
        const data = await res.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          post_id: post.id,
          authorId: user?.id || null,
          author_id: user?.id || null,
          authorName: user?.name || 'زائر',
          author_name: user?.name || 'زائر',
          content: commentText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments([data.comment, ...comments]);
        setCommentText('');
      } else if (data.error) {
        console.error('Server error:', data.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const PostTypeIcon = postTypeIcons[post.post_type] || FileText;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-background">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className={cn('text-white text-sm', roleColors[post.author.role])}>
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.author.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {roleLabelsAr[post.author.role] || post.author.role}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTime(post.created_at)}</span>
                {post.author.city && (
                  <>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{post.author.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {post.post_type !== 'standard' && (
              <Badge variant="outline" className="gap-1 text-xs">
                <PostTypeIcon className="h-3 w-3" />
                {postTypeLabelsAr[post.post_type] || post.post_type}
              </Badge>
            )}
            
            {user?.id === post.author.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(post.id)}>
                    {isRTL ? 'حذف المنشور' : 'Delete post'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {post.title && (
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
        
        {post.images && post.images.length > 0 && (
          <div className={cn(
            "grid gap-1 mt-3",
            post.images.length === 1 ? "grid-cols-1" :
            post.images.length === 2 ? "grid-cols-2" :
            "grid-cols-2"
          )}>
            {post.images.slice(0, 4).map((img, idx) => (
              <div key={idx} className={cn(
                "relative overflow-hidden rounded-lg bg-muted",
                post.images!.length === 3 && idx === 0 ? "col-span-2" : "",
                post.images!.length > 4 && idx === 3 ? "opacity-50" : ""
              )}>
                <img
                  src={img}
                  alt=""
                  className="w-full h-48 object-cover"
                />
                {post.images!.length > 4 && idx === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold">
                    +{post.images!.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex-col">
        {/* Stats */}
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>{likesCount}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{post.comments_count} {isRTL ? 'تعليق' : 'comments'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex items-center gap-1 border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn("flex-1 gap-1", isLiked && "text-red-500")}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span>{isRTL ? 'إعجاب' : 'Like'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-1"
            onClick={handleOpenComments}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{isRTL ? 'تعليق' : 'Comment'}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-1">
            <Share2 className="h-4 w-4" />
            <span>{isRTL ? 'مشاركة' : 'Share'}</span>
          </Button>
        </div>

        {/* Comments Dialog */}
        <Dialog open={showComments} onOpenChange={setShowComments}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'التعليقات' : 'Comments'}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Add Comment */}
              {user && (
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className={cn('text-white text-xs', roleColors[user.role])}>
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={isRTL ? 'اكتب تعليقاً...' : 'Write a comment...'}
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button size="icon" onClick={handleAddComment} disabled={!commentText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {loadingComments ? (
                <div className="text-center py-4 text-muted-foreground">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {isRTL ? 'لا توجد تعليقات بعد' : 'No comments yet'}
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment: any) => {
                    const authorName = comment.author?.name || 'زائر';
                    const authorRole = comment.author?.role || 'NORMAL_USER';
                    const authorAvatar = comment.author?.avatar || null;
                    const roleColor = roleColors[authorRole] || 'bg-gray-500';
                    
                    return (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={authorAvatar} />
                          <AvatarFallback className={cn('text-white text-xs', roleColor)}>
                            {authorName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{authorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
