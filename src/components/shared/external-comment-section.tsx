'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Send,
  Loader2,
  Trash2,
  Edit,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

interface ExternalComment {
  id: string;
  authorName: string;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  editToken?: string;
}

interface ExternalCommentSectionProps {
  targetType: 'post' | 'question';
  targetId: string;
}

// Simple Math CAPTCHA
function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return {
    question: `${num1} + ${num2} = ?`,
    answer: num1 + num2,
  };
}

export function ExternalCommentSection({ targetType, targetId }: ExternalCommentSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';

  const [comments, setComments] = useState<ExternalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [userEditToken, setUserEditToken] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [targetType, targetId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/external?targetType=${targetType}&targetId=${targetId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) {
      alert(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    if (parseInt(captchaAnswer) !== captcha.answer) {
      alert(isRTL ? 'التحقق غير صحيح' : 'Invalid CAPTCHA');
      setCaptcha(generateCaptcha());
      setCaptchaAnswer('');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments/external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          name: name.trim(),
          content: content.trim(),
          captchaAnswer: captcha.answer,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setComments([data.comment, ...comments]);
        setContent('');
        setCaptcha(generateCaptcha());
        setCaptchaAnswer('');
        // Store edit token for this user's comment
        if (data.comment?.editToken) {
          setUserEditToken(data.comment.editToken);
        }
      } else {
        alert(data.error || (isRTL ? 'فشل إرسال التعليق' : 'Failed to post comment'));
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(isRTL ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment: ExternalComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim() || !userEditToken) return;

    try {
      const res = await fetch('/api/comments/external', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: commentId,
          content: editContent.trim(),
          editToken: userEditToken,
        }),
      });

      if (res.ok) {
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, content: editContent.trim() } : c
        ));
        setEditingId(null);
      } else {
        const data = await res.json();
        alert(data.error || (isRTL ? 'فشل تحديث التعليق' : 'Failed to update comment'));
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف التعليق؟' : 'Are you sure?')) return;
    if (!userEditToken) return;

    try {
      const res = await fetch(`/api/comments/external?id=${commentId}&editToken=${userEditToken}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        const data = await res.json();
        alert(data.error || (isRTL ? 'فشل حذف التعليق' : 'Failed to delete comment'));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return isRTL ? 'الآن' : 'Just now';
    if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    if (days < 7) return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
    return isRTL ? `منذ ${Math.floor(days / 7)} أسبوع` : `${Math.floor(days / 7)}w ago`;
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <Input
                placeholder={isRTL ? 'الاسم' : 'Your Name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(isRTL && 'text-right')}
                maxLength={100}
                required
              />
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium bg-muted px-3 py-2 rounded-md">
                  {captcha.question}
                </span>
                <Input
                  type="number"
                  placeholder="?"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-16"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setCaptcha(generateCaptcha())}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <textarea
                placeholder={isRTL ? 'اكتب تعليقك...' : 'Write your comment...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={cn(
                  "flex-1 min-h-[80px] resize-none border rounded-md p-3 text-sm",
                  isRTL && 'text-right'
                )}
                maxLength={2000}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isRTL ? 'إرسال' : 'Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>{isRTL ? 'لا توجد تعليقات بعد' : 'No comments yet'}</p>
              <p className="text-sm">{isRTL ? 'كن أول من يعلق!' : 'Be the first to comment!'}</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {comment.authorName?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(comment.createdAt)}
                      </span>
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          ({isRTL ? 'تم التعديل' : 'edited'})
                        </span>
                      )}
                    </div>
                    
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className={cn(
                            "w-full min-h-[60px] resize-none border rounded-md p-2 text-sm",
                            isRTL && 'text-right'
                          )}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {isRTL ? 'حفظ' : 'Save'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            {isRTL ? 'إلغاء' : 'Cancel'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                  
                  {/* Actions - only show for user's own comments */}
                  {userEditToken && comment.editToken === userEditToken && editingId !== comment.id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(comment)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
