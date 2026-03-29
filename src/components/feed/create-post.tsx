'use client';

import { useState, useRef } from 'react';
import { useAppStore, type UserRole } from '@/stores/app-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Image as ImageIcon,
  Video,
  Calendar,
  Briefcase,
  Users,
  Package,
  Wrench,
  FileText,
  Send,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
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

// What each role can post
const rolePostTypes: Record<UserRole, { type: string; labelAr: string; icon: React.ElementType }[]> = {
  CIVIL_ENGINEER: [
    { type: 'standard', labelAr: 'منشور عادي', icon: FileText },
    { type: 'consultation', labelAr: 'استشارة هندسية', icon: Wrench },
    { type: 'project', labelAr: 'مشروع', icon: Briefcase },
    { type: 'guide', labelAr: 'دليل تقني', icon: FileText },
  ],
  CONTRACTOR: [
    { type: 'standard', labelAr: 'منشور عادي', icon: FileText },
    { type: 'project', labelAr: 'مشروع منجز', icon: Briefcase },
    { type: 'job_offer', labelAr: 'طلب عمال', icon: Users },
  ],
  ENGINEERING_OFFICE: [
    { type: 'standard', labelAr: 'منشور عادي', icon: FileText },
    { type: 'service', labelAr: 'خدمة هندسية', icon: Wrench },
    { type: 'project', labelAr: 'مشروع', icon: Briefcase },
  ],
  CRAFTSMAN: [
    { type: 'standard', labelAr: 'منشور عادي', icon: FileText },
    { type: 'service', labelAr: 'خدمة', icon: Wrench },
    { type: 'achievement', labelAr: 'إنجاز', icon: Calendar },
  ],
  CONSTRUCTION_COMPANY: [
    { type: 'standard', labelAr: 'منشور عادي', icon: FileText },
    { type: 'project', labelAr: 'مشروع', icon: Briefcase },
    { type: 'job_offer', labelAr: 'وظيفة', icon: Users },
  ],
  STORE_FACTORY: [
    { type: 'standard', labelAr: 'منشور عادي', icon: FileText },
    { type: 'product', labelAr: 'منتج', icon: Package },
  ],
  NORMAL_USER: [
    { type: 'standard', labelAr: 'منشور عادي', icon: FileText },
    { type: 'problem', labelAr: 'مشكلة', icon: Wrench },
  ],
  ADMIN: [
    { type: 'standard', labelAr: 'منشور عادي', icon: FileText },
    { type: 'guide', labelAr: 'دليل', icon: FileText },
  ],
};

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user, locale, addPost } = useAppStore();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('standard');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRTL = locale === 'ar';

  if (!user) return null;

  const availablePostTypes = rolePostTypes[user.role] || rolePostTypes.NORMAL_USER;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          content: content.trim(),
          post_type: postType,
          images,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Show appropriate error message based on locale
        const errorMsg = locale === 'ar' 
          ? (data.errorAr || data.error || 'فشل إنشاء المنشور')
          : locale === 'fr'
          ? (data.errorFr || data.error || 'Échec de la création du post')
          : (data.error || 'Failed to create post');
        
        setError(errorMsg);
        console.error('Post creation failed:', data);
        return;
      }
      
      if (data.post) {
        addPost(data.post);
        onPostCreated?.(data.post);
        setContent('');
        setImages([]);
        setPostType('standard');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(isRTL ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.urls) {
        setImages([...images, ...data.urls]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Quick post box
  if (!isOpen) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className={cn('text-white text-sm', roleColors[user.role])}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsOpen(true)}
              className="flex-1 text-start px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              {isRTL ? 'ماذا يدور في ذهنك؟' : "What's on your mind?"}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            {availablePostTypes.slice(0, 4).map((pt) => (
              <Button
                key={pt.type}
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground"
                onClick={() => { setPostType(pt.type); setIsOpen(true); }}
              >
                <pt.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{pt.labelAr}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full create post form
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className={cn('text-white text-sm', roleColors[user.role])}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {availablePostTypes.find(pt => pt.type === postType)?.labelAr || 'منشور'}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  {availablePostTypes.map((pt) => (
                    <DropdownMenuItem
                      key={pt.type}
                      onClick={() => setPostType(pt.type)}
                      className="gap-2"
                    >
                      <pt.icon className="h-4 w-4" />
                      {pt.labelAr}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isRTL ? 'ماذا يدور في ذهنك؟' : "What's on your mind?"}
          className="min-h-[100px] border-0 resize-none focus-visible:ring-0 text-base"
          autoFocus
        />

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline">{isRTL ? 'صورة' : 'Photo'}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Video className="h-4 w-4 text-blue-500" />
              <span className="hidden sm:inline">{isRTL ? 'فيديو' : 'Video'}</span>
            </Button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && images.length === 0)}
            className="gap-1"
          >
            <Send className="h-4 w-4" />
            {isRTL ? 'نشر' : 'Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
