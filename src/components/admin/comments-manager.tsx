'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MessageCircle,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Filter,
} from 'lucide-react';

interface ExternalComment {
  id: string;
  targetType: string;
  targetId: string;
  authorName: string;
  content: string;
  isApproved: boolean;
  likeCount: number;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export function CommentsManager() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';

  const [comments, setComments] = useState<ExternalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedComment, setSelectedComment] = useState<ExternalComment | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [filterType, filterStatus]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType && filterType !== 'all') {
        params.append('targetType', filterType);
      }
      
      const res = await fetch(`/api/admin/comments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا التعليق؟' : 'Êtes-vous sûr de vouloir supprimer ce commentaire?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleToggleApproval = async (comment: ExternalComment) => {
    try {
      await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: comment.id, 
          isApproved: !comment.isApproved 
        }),
      });
      fetchComments();
    } catch (error) {
      console.error('Error toggling approval:', error);
    }
  };

  const openEditDialog = (comment: ExternalComment) => {
    setSelectedComment(comment);
    setEditContent(comment.content);
    setShowEditDialog(true);
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return isRTL ? 'الآن' : 'Maintenant';
    if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `Il y a ${minutes} min`;
    if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `Il y a ${hours}h`;
    if (days < 7) return isRTL ? `منذ ${days} يوم` : `Il y a ${days}j`;
    return isRTL ? `منذ ${Math.floor(days / 7)} أسبوع` : `Il y a ${Math.floor(days / 7)}sem`;
  };

  const filteredComments = comments.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.content.toLowerCase().includes(query) ||
        c.authorName.toLowerCase().includes(query) ||
        c.targetId.toLowerCase().includes(query)
      );
    }
    
    if (filterStatus === 'approved' && !c.isApproved) return false;
    if (filterStatus === 'pending' && c.isApproved) return false;
    
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">
              {isRTL ? 'إدارة التعليقات' : 'Gestion des commentaires'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filteredComments.length} {isRTL ? 'تعليق' : 'commentaires'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input
            placeholder={isRTL ? "بحث في التعليقات..." : "Rechercher..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? "pr-10" : "pl-10"}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={isRTL ? "النوع" : "Type"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? "الكل" : "Tout"}</SelectItem>
            <SelectItem value="post">{isRTL ? "منشورات" : "Posts"}</SelectItem>
            <SelectItem value="question">{isRTL ? "أسئلة" : "Questions"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={isRTL ? "الحالة" : "Statut"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? "الكل" : "Tout"}</SelectItem>
            <SelectItem value="approved">{isRTL ? "موافق عليه" : "Approuvé"}</SelectItem>
            <SelectItem value="pending">{isRTL ? "قيد المراجعة" : "En attente"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 text-start font-medium">{isRTL ? 'المعلق' : 'Auteur'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'التعليق' : 'Commentaire'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'النوع' : 'Type'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'الحالة' : 'Statut'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th className="p-4 text-start font-medium">{isRTL ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComments.map((comment) => (
                    <tr key={comment.id} className="border-t">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{comment.authorName}</p>
                          <p className="text-xs text-muted-foreground">{comment.ipAddress}</p>
                        </div>
                      </td>
                      <td className="p-4 max-w-[300px]">
                        <p className="text-sm line-clamp-2">{comment.content}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {comment.targetType === 'post' 
                            ? (isRTL ? 'منشور' : 'Post') 
                            : (isRTL ? 'سؤال' : 'Question')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          className={cn(
                            "cursor-pointer",
                            comment.isApproved 
                              ? "bg-green-500/20 text-green-600 hover:bg-green-500/30" 
                              : "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30"
                          )}
                          onClick={() => handleToggleApproval(comment)}
                        >
                          {comment.isApproved 
                            ? (isRTL ? 'موافق عليه' : 'Approuvé') 
                            : (isRTL ? 'قيد المراجعة' : 'En attente')}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(comment.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(comment)}
                            title={isRTL ? 'تعديل' : 'Modifier'}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(comment.id)}
                            title={isRTL ? 'حذف' : 'Supprimer'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredComments.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد تعليقات' : 'Aucun commentaire'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'تفاصيل التعليق' : 'Détails du commentaire'}
            </DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {isRTL ? 'المعلق' : 'Auteur'}
                </label>
                <p className="text-muted-foreground">{selectedComment.authorName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {isRTL ? 'المحتوى' : 'Contenu'}
                </label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedComment.targetType === 'post' 
                    ? (isRTL ? 'منشور' : 'Post') 
                    : (isRTL ? 'سؤال' : 'Question')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {selectedComment.targetId}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {isRTL ? 'إغلاق' : 'Fermer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
