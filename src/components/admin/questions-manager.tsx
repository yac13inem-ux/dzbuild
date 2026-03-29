'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  Search,
  Trash2,
  Loader2,
  Clock,
  MessageCircle,
  Eye,
  ThumbsUp,
  Pin,
  PinOff,
  RefreshCw,
  Plus,
  Building2,
  Cylinder,
  Layers,
  MapPin,
} from 'lucide-react';

// Question categories
const QUESTION_CATEGORIES = [
  { id: 'concrete', icon: Layers, color: 'bg-blue-500', names: { ar: 'خرسانة', fr: 'Béton', en: 'Concrete' } },
  { id: 'reinforcement', icon: Cylinder, color: 'bg-slate-600', names: { ar: 'حديد التسليح', fr: 'Armature', en: 'Reinforcement' } },
  { id: 'foundations', icon: Building2, color: 'bg-stone-600', names: { ar: 'الأساسات', fr: 'Fondations', en: 'Foundations' } },
  { id: 'site', icon: MapPin, color: 'bg-orange-500', names: { ar: 'الموقع', fr: 'Chantier', en: 'Site' } },
];

interface Question {
  id: string;
  title: string;
  content?: string;
  category: string;
  author_name: string;
  answers_count: number;
  votes_count: number;
  views_count: number;
  is_pinned?: boolean;
  created_at: string;
}

export function QuestionsManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async () => {
    if (!questionToDelete) return;
    
    setDeletingId(questionToDelete.id);
    try {
      const res = await fetch(`/api/admin/questions/${questionToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== questionToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setQuestionToDelete(null);
    }
  };

  const handleTogglePin = async (questionId: string, currentPinned: boolean) => {
    try {
      await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !currentPinned }),
      });
      
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, is_pinned: !currentPinned } : q
      ));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return QUESTION_CATEGORIES.find(c => c.id === categoryId) || QUESTION_CATEGORIES[0];
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} ساعة`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} يوم`;
    const weeks = Math.floor(days / 7);
    return `${weeks} أسبوع`;
  };

  const filteredQuestions = questions.filter(q => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return q.title?.toLowerCase().includes(query) || 
             q.content?.toLowerCase().includes(query) ||
             q.author_name?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 right-4 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="بحث في الأسئلة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 bg-slate-800 border-white/10 text-white placeholder:text-slate-400 pr-12"
          />
        </div>
        <Button 
          onClick={fetchQuestions}
          variant="outline"
          className="h-12 gap-2 border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="h-5 w-5" />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <HelpCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{questions.length}</p>
                <p className="text-sm text-slate-400">إجمالي الأسئلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {questions.reduce((acc, q) => acc + (q.answers_count || 0), 0)}
                </p>
                <p className="text-sm text-slate-400">إجمالي الإجابات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Pin className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {questions.filter(q => q.is_pinned).length}
                </p>
                <p className="text-sm text-slate-400">أسئلة مثبتة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card className="bg-slate-800 border-white/10">
          <CardContent className="py-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-400">لا توجد أسئلة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => {
            const category = getCategoryInfo(question.category);
            const CategoryIcon = category.icon;
            
            return (
              <Card 
                key={question.id} 
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 hover:border-primary/30 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-2 rounded-lg text-white shrink-0', category.color)}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {question.is_pinned && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Pin className="h-3 w-3 mr-1" />
                            مثبت
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {category.names.ar}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-white truncate">
                        {question.title}
                      </h3>
                      
                      {question.content && (
                        <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                          {question.content}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span>{question.author_name}</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {question.answers_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {question.votes_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {question.views_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(question.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={cn(
                          "hover:bg-white/10",
                          question.is_pinned 
                            ? "text-yellow-400 hover:text-yellow-300" 
                            : "text-slate-400 hover:text-yellow-400"
                        )}
                        onClick={() => handleTogglePin(question.id, question.is_pinned || false)}
                      >
                        {question.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => {
                          setQuestionToDelete(question);
                          setShowDeleteDialog(true);
                        }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deletingId === questionToDelete?.id}
            >
              {deletingId === questionToDelete?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'حذف'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuestionsManager;
