'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MessageCircle, Send, Trash2, Loader2, Clock, Edit, CheckCircle, X, RefreshCw } from 'lucide-react';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  like_count: number;
  created_at: string;
  edit_token?: string;
}

interface CommentsSectionProps {
  itemType: 'product' | 'craftsman' | 'company' | 'job' | 'project';
  itemId: string;
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

export function CommentsSection({ itemType, itemId }: CommentsSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  
  // Track user's comment edit tokens
  const [userCommentTokens, setUserCommentTokens] = useState<Record<string, string>>({});
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [itemType, itemId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/item-comments?item_type=${itemType}&item_id=${itemId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
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
      const res = await fetch('/api/item-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId,
          name: name.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments([data.comment, ...comments]);
        setName('');
        setContent('');
        setShowForm(false);
        setCaptcha(generateCaptcha());
        setCaptchaAnswer('');
        
        // Store the edit token for this comment
        if (data.comment.edit_token) {
          setUserCommentTokens(prev => ({
            ...prev,
            [data.comment.id]: data.comment.edit_token
          }));
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

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    const editToken = userCommentTokens[commentId];
    if (!editToken) {
      alert(isRTL ? 'لا يمكنك تعديل هذا التعليق' : 'You cannot edit this comment');
      return;
    }

    try {
      const res = await fetch('/api/item-comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: commentId,
          content: editContent.trim(),
          edit_token: editToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, content: editContent.trim() } : c
        ));
        setEditingId(null);
      } else {
        alert(data.error || (isRTL ? 'فشل تحديث التعليق' : 'Failed to update comment'));
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا التعليق؟' : 'Delete this comment?')) return;
    
    const editToken = userCommentTokens[commentId];
    if (!editToken) {
      alert(isRTL ? 'لا يمكنك حذف هذا التعليق' : 'You cannot delete this comment');
      return;
    }

    try {
      const res = await fetch(`/api/item-comments?id=${commentId}&edit_token=${editToken}`, { 
        method: 'DELETE' 
      });
      
      const data = await res.json();
      if (data.success) {
        setComments(comments.filter(c => c.id !== commentId));
        // Remove the token from state
        setUserCommentTokens(prev => {
          const newTokens = { ...prev };
          delete newTokens[commentId];
          return newTokens;
        });
      } else {
        alert(data.error || (isRTL ? 'فشل حذف التعليق' : 'Failed to delete comment'));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isRTL ? 'الآن' : 'Just now';
    if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    if (days < 7) return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
    return date.toLocaleDateString(isRTL ? 'ar-DZ' : 'en-US');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Check if user owns a comment
  const canModifyComment = (commentId: string) => {
    return !!userCommentTokens[commentId];
  };

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {isRTL ? 'التعليقات' : 'Comments'}
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
            {comments.length}
          </span>
        </button>
      </div>

      {/* Comment Form */}
      {showForm && (
        <Card className="mb-4 bg-muted/30">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  placeholder={isRTL ? 'الاسم' : 'Name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background flex-1"
                  maxLength={100}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium bg-background px-3 py-2 rounded-md border">
                    {captcha.question}
                  </span>
                  <Input
                    type="number"
                    placeholder="?"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-16 bg-background"
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
              <Textarea
                placeholder={isRTL ? 'اكتب تعليقك...' : 'Write your comment...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-background min-h-[80px]"
                maxLength={1000}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setCaptcha(generateCaptcha());
                    setCaptchaAnswer('');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitting || !name.trim() || !content.trim()}
                  className="gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isRTL ? 'إرسال' : 'Send'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {getInitials(comment.author_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{comment.author_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(comment.created_at)}
                    </span>
                    {/* Show edit/delete only for user's own comments */}
                    {canModifyComment(comment.id) && editingId !== comment.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(comment)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {editingId === comment.id ? (
                  <div className="space-y-2 mt-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px]"
                      maxLength={1000}
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
                  <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : showForm ? null : (
        <p className="text-sm text-muted-foreground text-center py-2">
          {isRTL ? 'لا توجد تعليقات بعد' : 'No comments yet'}
        </p>
      )}
    </div>
  );
}
