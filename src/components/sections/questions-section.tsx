'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
  User,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';

interface QuestionsSectionProps {
  onBack?: () => void;
}

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
  author_name?: string;
  answers_count: number;
  votes_count: number;
  views_count: number;
  is_solved?: boolean;
  is_pinned?: boolean;
  created_at: string;
  editToken?: string; // Token for editing/deleting
}

interface Solution {
  id: string;
  content: string;
  isAccepted?: boolean;
  upvoteCount?: number;
  createdAt: string;
  author_name: string;
  author_avatar?: string;
  editToken?: string; // For ownership check
}

// Helper functions for localStorage
const MY_QUESTIONS_KEY = 'dzbuild_my_questions';
const MY_SOLUTIONS_KEY = 'dzbuild_my_solutions';

function getMyQuestionTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(MY_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveMyQuestionToken(questionId: string, token: string) {
  if (typeof window === 'undefined') return;
  try {
    const tokens = getMyQuestionTokens();
    tokens[questionId] = token;
    localStorage.setItem(MY_QUESTIONS_KEY, JSON.stringify(tokens));
  } catch {
    console.error('Failed to save question token');
  }
}

function removeMyQuestionToken(questionId: string) {
  if (typeof window === 'undefined') return;
  try {
    const tokens = getMyQuestionTokens();
    delete tokens[questionId];
    localStorage.setItem(MY_QUESTIONS_KEY, JSON.stringify(tokens));
  } catch {
    console.error('Failed to remove question token');
  }
}

function getMySolutionTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(MY_SOLUTIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveMySolutionToken(solutionId: string, token: string) {
  if (typeof window === 'undefined') return;
  try {
    const tokens = getMySolutionTokens();
    tokens[solutionId] = token;
    localStorage.setItem(MY_SOLUTIONS_KEY, JSON.stringify(tokens));
  } catch {
    console.error('Failed to save solution token');
  }
}

function removeMySolutionToken(solutionId: string) {
  if (typeof window === 'undefined') return;
  try {
    const tokens = getMySolutionTokens();
    delete tokens[solutionId];
    localStorage.setItem(MY_SOLUTIONS_KEY, JSON.stringify(tokens));
  } catch {
    console.error('Failed to remove solution token');
  }
}

export function QuestionsSection({ onBack }: QuestionsSectionProps) {
  const { locale, isLoggedIn, user } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.questionsSection;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', category: '' });
  
  // Solutions/Answers state
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  
  // Guest state
  const [guestName, setGuestName] = useState('');
  const [guestNameAnswer, setGuestNameAnswer] = useState('');
  
  // Edit & Delete states for questions
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit & Delete states for solutions
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [editSolutionContent, setEditSolutionContent] = useState('');
  const [deletingSolution, setDeletingSolution] = useState<Solution | null>(null);

  // Track user's own questions and solutions
  const [myQuestionTokens, setMyQuestionTokens] = useState<Record<string, string>>({});
  const [mySolutionTokens, setMySolutionTokens] = useState<Record<string, string>>({});

  const isAdmin = isLoggedIn && user?.role === 'ADMIN';

  // Load user's question and solution tokens from localStorage
  useEffect(() => {
    setMyQuestionTokens(getMyQuestionTokens());
    setMySolutionTokens(getMySolutionTokens());
  }, []);

  useEffect(() => {
    if (selectedCategory !== null) fetchQuestions();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedQuestion) fetchSolutions(selectedQuestion.id);
    else setSolutions([]);
  }, [selectedQuestion]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolutions = async (questionId: string) => {
    setSolutionsLoading(true);
    try {
      const res = await fetch(`/api/questions/${questionId}/solutions`);
      const data = await res.json();
      setSolutions(data.solutions || []);
    } catch (error) {
      console.error('Error fetching solutions:', error);
      setSolutions([]);
    } finally {
      setSolutionsLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return q.title?.toLowerCase().includes(query) || q.content?.toLowerCase().includes(query);
    }
    return true;
  });

  const getCategoryInfo = (categoryId: string) => QUESTION_CATEGORIES.find(c => c.id === categoryId);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return isRTL ? `${hours} ساعة` : `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return isRTL ? `${days} يوم` : `${days}d`;
    const weeks = Math.floor(days / 7);
    return isRTL ? `${weeks} أسبوع` : `${weeks}w`;
  };

  // Check if user owns a question
  const isQuestionOwner = (question: Question): boolean => {
    // Admin can always edit/delete
    if (isAdmin) return true;
    // Check if user has the edit token for this question
    return myQuestionTokens[question.id] === question.editToken;
  };

  // Check if user owns a solution
  const isSolutionOwner = (solution: Solution): boolean => {
    // Admin can always edit/delete
    if (isAdmin) return true;
    // Check if user has the edit token for this solution
    return mySolutionTokens[solution.id] === solution.editToken;
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.title || newQuestion.title.length < 5) {
      alert(isRTL ? 'العنوان مطلوب (5 أحرف على الأقل)' : 'Title required (min 5 chars)');
      return;
    }
    if (!user && !guestName.trim()) {
      alert(isRTL ? 'يرجى كتابة اسمك' : 'Please enter your name');
      return;
    }
    if (!newQuestion.category) {
      alert(isRTL ? 'يرجى اختيار القسم' : 'Please select a category');
      return;
    }
    
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuestion,
          authorName: user?.name || guestName.trim() || 'زائر'
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Save the edit token to localStorage
        if (data.question?.editToken) {
          saveMyQuestionToken(data.question.id, data.question.editToken);
          setMyQuestionTokens(getMyQuestionTokens());
        }
        
        setShowAskDialog(false);
        setNewQuestion({ title: '', content: '', category: '' });
        setGuestName('');
        fetchQuestions();
      } else {
        alert(data.error || 'فشل في نشر السؤال');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      alert(isRTL ? 'خطأ في الاتصال' : 'Connection error');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) {
      alert(isRTL ? 'يرجى كتابة الإجابة' : 'Please write your answer');
      return;
    }
    if (!user && !guestNameAnswer.trim()) {
      alert(isRTL ? 'يرجى كتابة اسمك' : 'Please enter your name');
      return;
    }
    if (!selectedQuestion) return;

    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/questions/${selectedQuestion.id}/solutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newAnswer,
          authorName: user?.name || guestNameAnswer.trim() || 'زائر'
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.solution) {
        // Save the edit token to localStorage
        if (data.solution.editToken) {
          saveMySolutionToken(data.solution.id, data.solution.editToken);
          setMySolutionTokens(getMySolutionTokens());
        }
        
        setNewAnswer('');
        setGuestNameAnswer('');
        fetchSolutions(selectedQuestion.id);
      } else {
        alert(data.error || 'فشل في إرسال الإجابة');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert(isRTL ? 'خطأ في الاتصال' : 'Connection error');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Edit solution
  const handleEditSolution = async () => {
    if (!editingSolution || !editSolutionContent.trim()) return;
    if (!selectedQuestion) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/questions/${selectedQuestion.id}/solutions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solutionId: editingSolution.id,
          content: editSolutionContent.trim(),
          editToken: mySolutionTokens[editingSolution.id],
          isAdmin: isAdmin,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.solution) {
        setSolutions(solutions.map(s => s.id === editingSolution.id ? { ...s, content: data.solution.content } : s));
        setEditingSolution(null);
        setEditSolutionContent('');
      } else {
        alert(data.error || 'فشل التعديل');
      }
    } catch (error) {
      console.error('Error editing solution:', error);
      alert('خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete solution
  const handleDeleteSolution = async () => {
    if (!deletingSolution || !selectedQuestion) return;
    
    setActionLoading(true);
    try {
      const url = `/api/questions/${selectedQuestion.id}/solutions?solutionId=${deletingSolution.id}&isAdmin=${isAdmin}${mySolutionTokens[deletingSolution.id] ? `&editToken=${mySolutionTokens[deletingSolution.id]}` : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      
      const data = await res.json();
      
      if (res.ok) {
        // Remove from localStorage
        removeMySolutionToken(deletingSolution.id);
        setMySolutionTokens(getMySolutionTokens());
        
        setSolutions(solutions.filter(s => s.id !== deletingSolution.id));
        setDeletingSolution(null);
      } else {
        alert(data.error || 'فشل الحذف');
      }
    } catch (error) {
      console.error('Error deleting solution:', error);
      alert('خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit question
  const handleEditQuestion = async () => {
    if (!editingQuestion || !editTitle.trim()) return;
    
    setActionLoading(true);
    try {
      const editToken = myQuestionTokens[editingQuestion.id];
      
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingQuestion.id,
          title: editTitle.trim(),
          content: editContent.trim(),
          category: editingQuestion.category,
          editToken: editToken,
          isAdmin: isAdmin,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.question) {
        setQuestions(questions.map(q => q.id === editingQuestion.id ? data.question : q));
        setEditingQuestion(null);
        setEditTitle('');
        setEditContent('');
      } else {
        alert(data.error || 'فشل التعديل');
      }
    } catch (error) {
      console.error('Error editing question:', error);
      alert('خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;
    
    setActionLoading(true);
    try {
      const editToken = myQuestionTokens[deletingQuestion.id];
      
      const url = `/api/questions?id=${deletingQuestion.id}&isAdmin=${isAdmin}${editToken ? `&editToken=${editToken}` : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok) {
        // Remove from localStorage
        removeMyQuestionToken(deletingQuestion.id);
        setMyQuestionTokens(getMyQuestionTokens());
        
        setQuestions(questions.filter(q => q.id !== deletingQuestion.id));
        setDeletingQuestion(null);
      } else {
        alert(data.error || 'فشل الحذف');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('خطأ في الاتصال');
    } finally {
      setActionLoading(false);
    }
  };

  // Question Detail View
  if (selectedQuestion) {
    const categoryInfo = getCategoryInfo(selectedQuestion.category);
    const CategoryIcon = categoryInfo?.icon || HelpCircle;
    const canModify = isQuestionOwner(selectedQuestion);
    
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedQuestion(null)} className="gap-2">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg text-white', categoryInfo?.color || 'bg-primary')}>
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">{selectedQuestion.title}</CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-1">
                    <span>{selectedQuestion.author_name || (isRTL ? 'مجهول' : 'Anonyme')}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(selectedQuestion.created_at)}
                  </CardDescription>
                </div>
              </div>
              
              {/* Actions Menu - Show for question owners and admins */}
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                    <DropdownMenuItem onClick={() => {
                      setEditingQuestion(selectedQuestion);
                      setEditTitle(selectedQuestion.title);
                      setEditContent(selectedQuestion.content || '');
                    }}>
                      <Pencil className="h-4 w-4 me-2" />
                      {isRTL ? 'تعديل' : 'Edit'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeletingQuestion(selectedQuestion)}>
                      <Trash2 className="h-4 w-4 me-2" />
                      {isRTL ? 'حذف' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
        </Card>

        {selectedQuestion.is_pinned && (
          <Badge className="bg-yellow-500 text-white w-fit">
            <Pin className="h-3 w-3 me-1" />
            {isRTL ? 'مثبت' : 'Pinned'}
          </Badge>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><ThumbsUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" /><p className="font-bold text-lg">{selectedQuestion.votes_count || 0}</p><p className="text-xs text-muted-foreground">{isRTL ? 'تصويت' : 'votes'}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><MessageCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" /><p className="font-bold text-lg">{solutions.length}</p><p className="text-xs text-muted-foreground">{isRTL ? 'إجابة' : 'answers'}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" /><p className="font-bold text-lg">{selectedQuestion.views_count || 0}</p><p className="text-xs text-muted-foreground">{isRTL ? 'مشاهدة' : 'views'}</p></CardContent></Card>
        </div>

        {selectedQuestion.content && (
          <Card><CardContent className="p-6"><p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedQuestion.content}</p></CardContent></Card>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {isRTL ? `الإجابات (${solutions.length})` : `Answers (${solutions.length})`}
          </h3>

          {solutionsLoading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : solutions.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><MessageCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">{isRTL ? 'لا توجد إجابات بعد' : 'No answers yet'}</p></CardContent></Card>
          ) : (
            solutions.map((solution) => {
              const canModifySolution = isSolutionOwner(solution);
              
              return (
                <Card key={solution.id} className={cn(solution.isAccepted && 'border-green-500 border-2')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {solution.author_avatar ? <img src={solution.author_avatar} alt={solution.author_name} className="w-10 h-10 rounded-full object-cover" /> : <User className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{solution.author_name}</p>
                            <p className="text-xs text-muted-foreground">{getTimeAgo(solution.createdAt)}</p>
                          </div>
                          
                          {/* Solution Actions Menu */}
                          {canModifySolution && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem onClick={() => {
                                  setEditingSolution(solution);
                                  setEditSolutionContent(solution.content);
                                }}>
                                  <Pencil className="h-4 w-4 me-2" />
                                  {isRTL ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeletingSolution(solution)}>
                                  <Trash2 className="h-4 w-4 me-2" />
                                  {isRTL ? 'حذف' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mt-2">{solution.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">{isRTL ? 'أضف إجابتك' : 'Add your answer'}</h3>
            {!user && <Input value={guestNameAnswer} onChange={(e) => setGuestNameAnswer(e.target.value)} placeholder={isRTL ? "اسمك (مطلوب)" : "Your name"} />}
            <Textarea placeholder={isRTL ? "اكتب إجابتك هنا..." : "Write your answer..."} className="min-h-[100px]" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} disabled={submittingAnswer} />
            <Button className="gap-2" onClick={handleSubmitAnswer} disabled={submittingAnswer || !newAnswer.trim() || (!user && !guestNameAnswer.trim())}>
              {submittingAnswer ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" />{isRTL ? 'إرسال الإجابة' : 'Submit'}</>}
            </Button>
          </CardContent>
        </Card>
        
        {/* Edit Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تعديل السؤال' : 'Edit Question'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder={isRTL ? 'عنوان السؤال' : 'Question title'} />
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder={isRTL ? 'تفاصيل السؤال...' : 'Question details...'} className="min-h-[120px]" />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleEditQuestion} disabled={!editTitle.trim() || actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deletingQuestion} onOpenChange={() => setDeletingQuestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
              <DialogDescription>{isRTL ? 'هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure? This cannot be undone.'}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeletingQuestion(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button variant="destructive" onClick={handleDeleteQuestion} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isRTL ? 'حذف' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Solution Dialog */}
        <Dialog open={!!editingSolution} onOpenChange={() => setEditingSolution(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تعديل الإجابة' : 'Edit Answer'}</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editSolutionContent}
              onChange={(e) => setEditSolutionContent(e.target.value)}
              className="w-full min-h-[100px] resize-none border rounded-md p-3 text-sm"
              placeholder={isRTL ? 'محتوى الإجابة...' : 'Answer content...'}
            />
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditingSolution(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleEditSolution} disabled={!editSolutionContent.trim() || actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Solution Confirmation Dialog */}
        <Dialog open={!!deletingSolution} onOpenChange={() => setDeletingSolution(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تأكيد حذف الإجابة' : 'Confirm Delete Answer'}</DialogTitle>
              <DialogDescription>{isRTL ? 'هل أنت متأكد من حذف هذه الإجابة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this answer? This action cannot be undone.'}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeletingSolution(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button variant="destructive" onClick={handleDeleteSolution} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isRTL ? 'حذف' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Category Selection View
  if (selectedCategory === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="h-6 w-6 text-primary" />{t.title[locale]}</h1>
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
                <div className="p-3 rounded-xl text-white bg-primary"><HelpCircle className="h-6 w-6" /></div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{t.allQuestions[locale]}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.allQuestionsDesc[locale]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {QUESTION_CATEGORIES.map((category) => {
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

  // Questions List View
  const currentCategory = QUESTION_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || HelpCircle;

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg text-white', currentCategory?.color || 'bg-primary')}>
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{selectedCategory === 'all' ? t.allQuestions[locale] : currentCategory?.names[locale as 'ar' | 'fr' | 'en']}</CardTitle>
                <CardDescription>{filteredQuestions.length} {isRTL ? 'سؤال' : 'questions'}</CardDescription>
              </div>
            </div>
            <Dialog open={showAskDialog} onOpenChange={setShowAskDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />{isRTL ? 'اطرح سؤالاً' : 'Ask'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{isRTL ? 'طرح سؤال جديد' : 'New Question'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {!user && <div><label className="text-sm font-medium mb-1 block">{isRTL ? 'اسمك' : 'Your name'}</label><Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={isRTL ? "أدخل اسمك" : "Enter your name"} /></div>}
                  <div><label className="text-sm font-medium mb-1 block">{isRTL ? 'عنوان السؤال' : 'Title'}</label><Input value={newQuestion.title} onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})} placeholder={isRTL ? "مثال: كيف أحسب نسبة الخلطة؟" : "How to calculate...?"} /></div>
                  <div><label className="text-sm font-medium mb-1 block">{isRTL ? 'القسم' : 'Category'}</label><select value={newQuestion.category} onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3"><option value="">{isRTL ? "اختر القسم" : "Select"}</option>{QUESTION_CATEGORIES.map(cat => (<option key={cat.id} value={cat.id}>{cat.names[locale as 'ar' | 'fr' | 'en']}</option>))}</select></div>
                  <div><label className="text-sm font-medium mb-1 block">{isRTL ? 'تفاصيل السؤال' : 'Details'}</label><Textarea value={newQuestion.content} onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})} placeholder={isRTL ? "اشرح مشكلتك..." : "Explain your problem..."} className="min-h-[150px]" /></div>
                  <Button className="w-full gap-2" onClick={handleAskQuestion} disabled={!newQuestion.title || newQuestion.title.length < 5 || (!user && !guestName.trim())}><Send className="h-4 w-4" />{isRTL ? 'نشر السؤال' : 'Post'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input placeholder={t.search[locale]} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={isRTL ? "pr-10" : "pl-10"} />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filteredQuestions.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">{t.noQuestions[locale]}</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question) => {
            const category = getCategoryInfo(question.category);
            const IconComponent = category?.icon || HelpCircle;
            const canModify = isQuestionOwner(question);
            
            return (
              <Card key={question.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedQuestion(question)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-lg">{question.votes_count || 0}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {question.is_pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                        {question.is_solved && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <h3 className="font-semibold text-lg truncate">{question.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                        <Badge variant="secondary" className="text-xs">{category?.names[locale as 'ar' | 'fr' | 'en']}</Badge>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{question.answers_count || 0}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{question.views_count || 0}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{getTimeAgo(question.created_at)}</span>
                      </div>
                    </div>
                    
                    {/* Actions Menu - Show for question owners and admins */}
                    {canModify && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingQuestion(question); setEditTitle(question.title); setEditContent(question.content || ''); }}>
                            <Pencil className="h-4 w-4 me-2" />{isRTL ? 'تعديل' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeletingQuestion(question); }}>
                            <Trash2 className="h-4 w-4 me-2" />{isRTL ? 'حذف' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعديل السؤال' : 'Edit Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder={isRTL ? 'عنوان السؤال' : 'Question title'} />
            <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder={isRTL ? 'تفاصيل السؤال...' : 'Question details...'} className="min-h-[120px]" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleEditQuestion} disabled={!editTitle.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingQuestion} onOpenChange={() => setDeletingQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
            <DialogDescription>{isRTL ? 'هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure? This cannot be undone.'}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingQuestion(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleDeleteQuestion} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuestionsSection;
