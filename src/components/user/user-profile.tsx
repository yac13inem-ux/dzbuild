'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  User,
  MapPin,
  Link as LinkIcon,
  Camera,
  Plus,
  Star,
  Users,
  Award,
  Loader2,
  Check,
  X,
  Pencil,
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

export function UserProfile() {
  const { user, locale, setUser } = useAppStore();
  const isRTL = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Inline editing states
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  
  const [formData, setFormData] = useState({
    bio: '',
    city: user?.city || '',
    wilaya: user?.wilaya || '',
    specialization: user?.specialization || '',
    website: '',
    skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      // Upload to server
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'avatars');
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });
      
      const uploadData = await uploadRes.json();
      
      if (uploadData.url) {
        const avatarUrl = uploadData.url;
        
        // Update user profile with new avatar
        const res = await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            userId: user.id,
            avatar: avatarUrl,
          }),
        });
        
        const data = await res.json();
        
        if (data.success && data.user) {
          // Update local state
          setUser({
            ...user,
            avatar: avatarUrl,
          });
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle name save
  const handleNameSave = async () => {
    if (!user || !nameValue.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          name: nameValue.trim(),
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.user) {
        setUser({
          ...user,
          name: nameValue.trim(),
        });
        setEditingName(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className={cn('text-white text-2xl', roleColors[user.role])}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload overlay - always visible on hover */}
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Name and info */}
            <div className="flex-1 text-center sm:text-start">
              {/* Editable Name */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="text-xl font-bold h-9 w-48"
                      autoFocus
                      disabled={saving}
                      onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    />
                    <Button 
                      size="sm"
                      onClick={handleNameSave}
                      disabled={saving || !nameValue.trim()}
                      variant="default"
                      className="h-8 px-3"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setNameValue(user.name);
                        setEditingName(false);
                      }}
                      className="h-8 px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingName(true)}
                      className="h-8 px-2 opacity-60 hover:opacity-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge className={cn('text-white', roleColors[user.role])}>
                  {roleLabelsAr[user.role] || user.role}
                </Badge>
                {user.specialization && (
                  <Badge variant="outline">{user.specialization}</Badge>
                )}
              </div>
              
              {user.city && (
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.city}{user.wilaya ? `, ${user.wilaya}` : ''}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xl font-bold">{user.followersCount || 0}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'متابع' : 'Followers'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xl font-bold">{user.followingCount || 0}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'يتابع' : 'Following'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xl font-bold">{user.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'التقييم' : 'Rating'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bio & Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isRTL ? 'نبذة عني' : 'About Me'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={isRTL ? 'اكتب نبذة عن نفسك...' : 'Write something about yourself...'}
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                {isRTL ? 'المدينة' : 'City'}
              </Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder={isRTL ? 'المدينة' : 'City'}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                {isRTL ? 'الولاية' : 'Wilaya'}
              </Label>
              <Input
                value={formData.wilaya}
                onChange={(e) => setFormData(prev => ({ ...prev, wilaya: e.target.value }))}
                placeholder={isRTL ? 'الولاية' : 'Wilaya'}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">
              {isRTL ? 'الموقع الإلكتروني' : 'Website'}
            </Label>
            <Input
              placeholder="https://"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            {isRTL ? 'المهارات' : 'Skills'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.skills.map((skill, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {skill}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeSkill(skill)} 
                />
              </Badge>
            ))}
            {formData.skills.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {isRTL ? 'لم تتم إضافة مهارات بعد' : 'No skills added yet'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={isRTL ? 'مهارة جديدة' : 'New skill'}
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button size="icon" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
