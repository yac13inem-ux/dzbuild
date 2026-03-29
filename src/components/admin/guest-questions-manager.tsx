'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Pencil,
  X,
  Save,
} from 'lucide-react';

interface GuestQuestion {
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

interface EditFormData {
  name: string;
  content: string;
  category: string;
}

export function GuestQuestionsManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<GuestQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<GuestQuestion | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({ name: '', content: '', category: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/guest-posts?section=questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا السؤال؟' : 'Are you sure you want to delete this question?')) return;
    
    try {
      const res = await fetch(`/api/admin/guest-posts/${questionId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleEditQuestion = (question: GuestQuestion) => {
    setEditingQuestion(question);
    setEditFormData({
      name: question.name,
      content: question.content,
      category: question.category || 'general',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/guest-posts/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      
      if (res.ok) {
        setEditDialogOpen(false);
        setEditingQuestion(null);
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.error || (isRTL ? 'فشل في حفظ التغييرات' : 'Failed to save changes'));
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert(isRTL ? 'فشل في حفظ التغييرات' : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComment = async (questionId: string, commentId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا التعليق؟' : 'Are you sure you want to delete this comment?')) return;
    
    try {
      const res = await fetch(`/api/guest/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const filterQuestions = (items: GuestQuestion[]) => {
    let filtered = items;
    
    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter((q) => q.category === filterCategory);
    }
    
    return filtered;
  };

  const filteredQuestions = filterQuestions(questions);

  // Get unique categories
  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))];

  // Category labels in Arabic
  const categoryLabels: Record<string, string> = {
    'structural': 'إنشائي',
    'architectural': 'معماري',
    'electrical': 'كهربائي',
    'plumbing': 'صحي/سباكة',
    'materials': 'مواد بناء',
    'foundations': 'أساسات',
    'general': 'عام',
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return isRTL ? 'عام' : 'General';
    return categoryLabels[category] || category;
  };

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
    <>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{questions.length}</p>
                  <p className="text-sm text-slate-400">
                    {isRTL ? 'إجمالي الأسئلة' : 'Total Questions'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {questions.filter(q => q.comments && q.comments.length > 0).length}
                  </p>
                  <p className="text-sm text-slate-400">
                    {isRTL ? 'تم الرد عليها' : 'Answered'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {questions.filter(q => !q.comments || q.comments.length === 0).length}
                  </p>
                  <p className="text-sm text-slate-400">
                    {isRTL ? 'بانتظار الرد' : 'Pending'}
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
              placeholder={isRTL ? "بحث في الأسئلة..." : "Search questions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "h-12 bg-slate-800 border-white/10 text-white placeholder:text-slate-400",
                isRTL ? "pr-12" : "pl-12"
              )}
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                filterCategory === 'all' 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                  : "border-white/20 text-white"
              )}
              onClick={() => setFilterCategory('all')}
            >
              {isRTL ? 'الكل' : 'All'}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  filterCategory === cat 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                    : "border-white/20 text-white"
                )}
                onClick={() => setFilterCategory(cat as string)}
              >
                {getCategoryLabel(cat as string)}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            className="gap-2 border-white/20 text-white hover:bg-white/10"
            onClick={fetchQuestions}
          >
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <Card
                key={question.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 hover:border-amber-500/30 transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-amber-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg">
                        {question.name?.[0]?.toUpperCase() || 'Q'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-white text-lg">{question.name}</span>
                        {question.category && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {getCategoryLabel(question.category)}
                          </Badge>
                        )}
                        {question.comments && question.comments.length > 0 ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {isRTL ? 'تم الرد' : 'Answered'}
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {isRTL ? 'بانتظار الرد' : 'Pending'}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-300 mb-4 leading-relaxed whitespace-pre-wrap">
                        {question.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(question.createdAt).toLocaleDateString(isRTL ? 'ar-DZ' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {question.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {question.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {question.commentCount || question.comments?.length || 0}
                        </span>
                      </div>
                      
                      {/* Answers/Comments */}
                      {question.comments && question.comments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {isRTL ? `الإجابات (${question.comments.length})` : `Answers (${question.comments.length})`}
                          </p>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {question.comments.map((comment) => (
                              <div 
                                key={comment.id} 
                                className="bg-slate-800/50 p-3 rounded-lg border border-white/5"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                                        {comment.name?.[0]?.toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-slate-300 text-sm">{comment.name}</span>
                                    <span className="text-xs text-slate-500">
                                      {new Date(comment.createdAt).toLocaleDateString(isRTL ? 'ar-DZ' : 'en-US')}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                                    onClick={() => handleDeleteComment(question.id, comment.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-slate-400 text-sm">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-amber-400 hover:bg-amber-400/10"
                        onClick={() => handleEditQuestion(question)}
                        title={isRTL ? 'تعديل' : 'Edit'}
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => handleDeleteQuestion(question.id)}
                        title={isRTL ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
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
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {isRTL ? 'تعديل السؤال' : 'Edit Question'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {isRTL ? 'اسم الكاتب' : 'Author Name'}
              </label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="bg-slate-800 border-white/10 text-white"
                placeholder={isRTL ? 'الاسم' : 'Name'}
              />
            </div>
            
            {/* Category Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {isRTL ? 'التصنيف' : 'Category'}
              </label>
              <Select
                value={editFormData.category}
                onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
              >
                <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                  <SelectValue placeholder={isRTL ? 'اختر التصنيف' : 'Select category'} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-slate-700">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Content Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {isRTL ? 'محتوى السؤال' : 'Question Content'}
              </label>
              <Textarea
                value={editFormData.content}
                onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                className="bg-slate-800 border-white/10 text-white min-h-[150px]"
                placeholder={isRTL ? 'محتوى السؤال...' : 'Question content...'}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4 mr-2" />
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editFormData.name || !editFormData.content}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
