'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Captcha } from '@/components/shared/captcha';
import {
  HelpCircle,
  Home,
  ChevronLeft,
  Loader2,
  MessageCircle,
  CheckCircle,
  Pin,
  Plus,
  Clock,
  Send,
  ThumbsUp,
  Eye,
  Building2,
  Cylinder,
  Layers,
  MapPin,
  Search,
  Trash2,
  Key,
} from 'lucide-react';

interface GuestQuestionsSectionProps {
  onBack?: () => void;
}

// Question categories with icons and colors
const QUESTION_CATEGORIES = [
  {
    id: 'concrete',
    icon: Layers,
    color: 'bg-blue-500',
    names: { ar: 'خرسانة', fr: 'Béton', en: 'Concrete' },
    descriptions: { ar: 'أسئلة حول الخرسانة والصب', fr: 'Questions sur le béton', en: 'Concrete questions' }
  },
  {
    id: 'reinforcement',
    icon: Cylinder,
    color: 'bg-slate-600',
    names: { ar: 'حديد التسليح', fr: 'Armature', en: 'Reinforcement' },
    descriptions: { ar: 'أسئلة حول التسليح', fr: 'Questions sur le ferraillage', en: 'Reinforcement questions' }
  },
  {
    id: 'foundations',
    icon: Building2,
    color: 'bg-stone-600',
    names: { ar: 'الأساسات', fr: 'Fondations', en: 'Foundations' },
    descriptions: { ar: 'أسئلة حول الأساسات', fr: 'Questions sur les fondations', en: 'Foundation questions' }
  },
  {
    id: 'site',
    icon: MapPin,
    color: 'bg-orange-500',
    names: { ar: 'الموقع', fr: 'Chantier', en: 'Site' },
    descriptions: { ar: 'أسئلة حول إدارة الموقع', fr: 'Questions sur le chantier', en: 'Site management questions' }
  },
];

interface GuestQuestion {
  id: string;
  name: string;
  content: string;
  section: string;
  category: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isLiked?: boolean;
}

interface GuestAnswer {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  editCode?: string; // Local edit code stored by user
}

export function GuestQuestionsSection({ onBack }: GuestQuestionsSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';

  const [questions, setQuestions] = useState<GuestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New question form
  const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false);
  const [newQuestionName, setNewQuestionName] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('');
  const [posting, setPosting] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [captchaExpected, setCaptchaExpected] = useState(0);

  // Question detail view
  const [selectedQuestion, setSelectedQuestion] = useState<GuestQuestion | null>(null);
  const [answers, setAnswers] = useState<GuestAnswer[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Answer form
  const [newAnswerName, setNewAnswerName] = useState('');
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [answerCaptchaValid, setAnswerCaptchaValid] = useState(false);
  const [answerCaptchaAnswer, setAnswerCaptchaAnswer] = useState(0);
  const [answerCaptchaExpected, setAnswerCaptchaExpected] = useState(0);
  const [answering, setAnswering] = useState(false);

  // Delete comment dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<GuestAnswer | null>(null);
  const [deleteEditCode, setDeleteEditCode] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Edit codes storage (in memory for this session)
  const [commentEditCodes, setCommentEditCodes] = useState<Record<string, string>>({});

  const fetchQuestions = useCallback(async () => {
    if (selectedCategory === null) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('section', 'questions');
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`/api/guest/posts?${params.toString()}`);
      const data = await res.json();
      setQuestions(data.posts || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Filter questions by search
  const filteredQuestions = questions.filter(q => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        q.content?.toLowerCase().includes(query) ||
        q.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return QUESTION_CATEGORIES.find(c => c.id === categoryId);
  };

  const handleCreateQuestion = async () => {
    if (!newQuestionName.trim() || !newQuestionContent.trim() || !captchaValid) return;

    setPosting(true);
    try {
      const res = await fetch('/api/guest/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newQuestionName.trim(),
          content: newQuestionContent.trim(),
          section: 'questions',
          category: newQuestionCategory || 'concrete',
          captchaAnswer,
          captchaExpected,
        }),
      });

      const data = await res.json();

      if (res.ok && data.post) {
        setQuestions([data.post, ...questions]);
        setShowNewQuestionDialog(false);
        setNewQuestionName('');
        setNewQuestionContent('');
        setNewQuestionCategory('');
        setCaptchaValid(false);
      } else {
        alert(data.error || 'فشل إنشاء السؤال / Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('خطأ في الاتصال / Connection error');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (questionId: string) => {
    try {
      const res = await fetch('/api/guest/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: questionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions(questions.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              isLiked: data.liked,
              likeCount: data.likeCount,
            };
          }
          return q;
        }));
      }
    } catch (error) {
      console.error('Error liking question:', error);
    }
  };

  const openQuestionDetail = async (question: GuestQuestion) => {
    setSelectedQuestion(question);
    setLoadingDetail(true);
    setNewAnswerName('');
    setNewAnswerContent('');
    setAnswerCaptchaValid(false);

    try {
      const res = await fetch(`/api/guest/posts/${question.id}`);
      const data = await res.json();
      setSelectedQuestion(data.post);
      setAnswers(data.post?.comments || []);
    } catch (error) {
      console.error('Error fetching question detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAddAnswer = async () => {
    if (!newAnswerName.trim() || !newAnswerContent.trim() || !answerCaptchaValid || !selectedQuestion) return;

    setAnswering(true);
    try {
      const res = await fetch('/api/guest/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedQuestion.id,
          name: newAnswerName.trim(),
          content: newAnswerContent.trim(),
          captchaAnswer: answerCaptchaAnswer,
          captchaExpected: answerCaptchaExpected,
        }),
      });

      const data = await res.json();

      if (res.ok && data.comment) {
        // Store the edit code for this comment
        if (data.editCode) {
          setCommentEditCodes(prev => ({
            ...prev,
            [data.comment.id]: data.editCode
          }));
          
          // Show the edit code to the user
          alert(
            locale === 'ar' 
              ? `تم إضافة تعليقك بنجاح!\n\nكود الحذف: ${data.editCode}\n\nاحفظ هذا الكود لحذف تعليقك لاحقاً.`
              : `Your comment has been added!\n\nDelete code: ${data.editCode}\n\nSave this code to delete your comment later.`
          );
        }
        
        setAnswers([{ ...data.comment, editCode: data.editCode }, ...answers]);
        setNewAnswerContent('');
        setAnswerCaptchaValid(false);
        if (selectedQuestion) {
          setSelectedQuestion({
            ...selectedQuestion,
            commentCount: selectedQuestion.commentCount + 1,
          });
        }
      } else {
        alert(data.error || 'فشل إضافة الإجابة / Failed to add answer');
      }
    } catch (error) {
      console.error('Error adding answer:', error);
      alert('خطأ في الاتصال / Connection error');
    } finally {
      setAnswering(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete || !deleteEditCode.trim()) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/guest/comments/${commentToDelete.id}?editCode=${deleteEditCode.trim()}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAnswers(answers.filter(a => a.id !== commentToDelete.id));
        setShowDeleteDialog(false);
        setCommentToDelete(null);
        setDeleteEditCode('');
        
        // Remove from stored edit codes
        setCommentEditCodes(prev => {
          const newCodes = { ...prev };
          delete newCodes[commentToDelete.id];
          return newCodes;
        });
        
        if (selectedQuestion) {
          setSelectedQuestion({
            ...selectedQuestion,
            commentCount: Math.max(0, selectedQuestion.commentCount - 1),
          });
        }
      } else {
        alert(data.error || 'فشل حذف التعليق / Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('خطأ في الاتصال / Connection error');
    } finally {
      setDeleting(false);
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
              <HelpCircle className="h-6 w-6 text-primary" />
              {locale === 'ar' ? 'الأسئلة الهندسية' : locale === 'fr' ? 'Questions Techniques' : 'Engineering Questions'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'اطرح سؤالك واحصل على إجابات من الخبراء' : locale === 'fr' ? 'Posez vos questions aux experts' : 'Ask questions and get expert answers'}
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
          {/* All Questions Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white bg-primary">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {locale === 'ar' ? 'جميع الأسئلة' : locale === 'fr' ? 'Toutes les questions' : 'All Questions'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {locale === 'ar' ? 'تصفح جميع الأسئلة' : locale === 'fr' ? 'Parcourir toutes les questions' : 'Browse all questions'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {QUESTION_CATEGORIES.map((category) => {
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

  // Question Detail View
  if (selectedQuestion) {
    const categoryInfo = getCategoryInfo(selectedQuestion.category || 'concrete');
    const CategoryIcon = categoryInfo?.icon || HelpCircle;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedQuestion(null)} className="gap-2">
            <ChevronLeft className={isRTL ? "rotate-180" : ""} />
            {locale === 'ar' ? 'العودة للقائمة' : 'Back to list'}
          </Button>
        </div>

        {/* Question Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg text-white', categoryInfo?.color || 'bg-primary')}>
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{selectedQuestion.name}</CardTitle>
                <CardDescription className="flex items-center gap-3 mt-1">
                  <span>{formatTimeAgo(selectedQuestion.createdAt)}</span>
                  <span>•</span>
                  <span>{categoryInfo?.names[locale as 'ar' | 'fr' | 'en']}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedQuestion.content}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <ThumbsUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-bold">{selectedQuestion.likeCount}</p>
                <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'تصويت' : 'votes'}</p>
              </div>
              <div className="text-center">
                <MessageCircle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-bold">{answers.length}</p>
                <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'إجابة' : 'answers'}</p>
              </div>
              <div className="text-center">
                <Eye className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-bold">{selectedQuestion.viewCount}</p>
                <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'مشاهدة' : 'views'}</p>
              </div>
            </div>

            {/* Vote Button */}
            <Button
              variant={selectedQuestion.isLiked ? "default" : "outline"}
              className={cn("mt-4 gap-2", selectedQuestion.isLiked && "bg-pink-500 hover:bg-pink-600")}
              onClick={() => handleLike(selectedQuestion.id)}
            >
              <ThumbsUp className="h-4 w-4" />
              {locale === 'ar' ? 'تصويت' : 'Vote'}
            </Button>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {locale === 'ar' ? `الإجابات (${answers.length})` : `Answers (${answers.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Answer Form */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{locale === 'ar' ? 'اسمك' : 'Your Name'}</Label>
                  <Input
                    value={newAnswerName}
                    onChange={(e) => setNewAnswerName(e.target.value)}
                    placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">{locale === 'ar' ? 'إجابتك' : 'Your Answer'}</Label>
                <Textarea
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  placeholder={locale === 'ar' ? 'اكتب إجابتك هنا...' : 'Write your answer here...'}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <Captcha
                locale={locale}
                onValidChange={(valid, ans, expected) => {
                  setAnswerCaptchaValid(valid);
                  setAnswerCaptchaAnswer(ans);
                  setAnswerCaptchaExpected(expected);
                }}
              />
              <Button
                onClick={handleAddAnswer}
                disabled={!newAnswerName.trim() || !newAnswerContent.trim() || !answerCaptchaValid || answering}
                className="gap-2"
              >
                {answering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {locale === 'ar' ? 'إرسال' : 'Send'}
              </Button>
            </div>

            {/* Answers List */}
            {loadingDetail ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : answers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {locale === 'ar' ? 'لا توجد إجابات بعد. كن أول من يجيب!' : 'No answers yet. Be the first to answer!'}
              </p>
            ) : (
              <div className="space-y-3">
                {answers.map((answer) => (
                  <div key={answer.id} className="p-3 bg-card border rounded-lg group">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{answer.name}</span>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(answer.createdAt)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setCommentToDelete(answer);
                          // Pre-fill edit code if we have it stored
                          if (commentEditCodes[answer.id]) {
                            setDeleteEditCode(commentEditCodes[answer.id]);
                          } else {
                            setDeleteEditCode('');
                          }
                          setShowDeleteDialog(true);
                        }}
                        title={locale === 'ar' ? 'حذف التعليق' : 'Delete comment'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{answer.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Comment Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                {locale === 'ar' ? 'حذف التعليق' : 'Delete Comment'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                {locale === 'ar' 
                  ? 'أدخل كود الحذف الخاص بالتعليق:'
                  : 'Enter the delete code for this comment:'}
              </p>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={deleteEditCode}
                  onChange={(e) => setDeleteEditCode(e.target.value)}
                  placeholder={locale === 'ar' ? 'كود الحذف (6 أرقام)' : 'Delete code (6 digits)'}
                  maxLength={6}
                  className="font-mono text-center tracking-widest"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setCommentToDelete(null);
                    setDeleteEditCode('');
                  }}
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteComment}
                  disabled={!deleteEditCode.trim() || deleting}
                  className="gap-2"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {locale === 'ar' ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Questions List View
  const currentCategory = QUESTION_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || HelpCircle;

  return (
    <div className="space-y-6">
      {/* Back Button & New Question */}
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
        <Button onClick={() => setShowNewQuestionDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {locale === 'ar' ? 'سؤال جديد' : 'Ask Question'}
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
                  ? (locale === 'ar' ? 'جميع الأسئلة' : 'All Questions')
                  : currentCategory?.names[locale as 'ar' | 'fr' | 'en'] || currentCategory?.names.en
                }
              </CardTitle>
              <CardDescription>
                {filteredQuestions.length} {locale === 'ar' ? 'سؤال' : 'questions'}
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
              placeholder={locale === 'ar' ? 'ابحث في الأسئلة...' : 'Search questions...'}
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
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'لا توجد أسئلة' : 'No questions yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {locale === 'ar' ? 'كن أول من يطرح سؤالاً!' : 'Be the first to ask!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question) => {
            const category = getCategoryInfo(question.category || 'concrete');
            const IconComponent = category?.icon || HelpCircle;

            return (
              <Card
                key={question.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => openQuestionDetail(question)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Vote count */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => { e.stopPropagation(); handleLike(question.id); }}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-lg">{question.likeCount}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{question.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{question.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {category?.names[locale as 'ar' | 'fr' | 'en']}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{question.commentCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{question.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(question.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Question Dialog */}
      <Dialog open={showNewQuestionDialog} onOpenChange={setShowNewQuestionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {locale === 'ar' ? 'طرح سؤال جديد' : 'Ask a Question'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{locale === 'ar' ? 'اسمك' : 'Your Name'}</Label>
              <Input
                value={newQuestionName}
                onChange={(e) => setNewQuestionName(e.target.value)}
                placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{locale === 'ar' ? 'القسم' : 'Category'}</Label>
              <select
                value={newQuestionCategory}
                onChange={(e) => setNewQuestionCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
              >
                {QUESTION_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.names[locale as 'ar' | 'fr' | 'en']}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'السؤال' : 'Question'}</Label>
              <Textarea
                value={newQuestionContent}
                onChange={(e) => setNewQuestionContent(e.target.value)}
                placeholder={locale === 'ar' ? 'اكتب سؤالك هنا...' : 'Write your question here...'}
                className="mt-1 min-h-[120px]"
              />
            </div>
            <Captcha
              locale={locale}
              onValidChange={(valid, ans) => {
                setCaptchaValid(valid);
                setCaptchaAnswer(ans);
                if (valid) setCaptchaExpected(ans);
              }}
            />
            <Button
              onClick={handleCreateQuestion}
              disabled={!newQuestionName.trim() || !newQuestionContent.trim() || !captchaValid || posting}
              className="w-full gap-2"
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {locale === 'ar' ? 'نشر السؤال' : 'Post Question'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GuestQuestionsSection;
