'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Bell,
  Heart,
  MessageSquare,
  Users,
  Star,
  Briefcase,
  Check,
  Trash2,
  Loader2,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  data?: string;
}

const notificationIcons: Record<string, React.ElementType> = {
  like: Heart,
  comment: MessageSquare,
  follow: Users,
  mention: MessageSquare,
  system: Bell,
  job: Briefcase,
  star: Star,
};

const notificationColors: Record<string, string> = {
  like: 'text-pink-500 bg-pink-500/10',
  comment: 'text-blue-500 bg-blue-500/10',
  follow: 'text-green-500 bg-green-500/10',
  mention: 'text-purple-500 bg-purple-500/10',
  system: 'text-amber-500 bg-amber-500/10',
  job: 'text-orange-500 bg-orange-500/10',
};

export function NotificationsCenter() {
  const { user, locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/user/notifications?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    
    try {
      await fetch('/api/user/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    
    try {
      await fetch('/api/user/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, markAllRead: true }),
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    
    try {
      await fetch(`/api/user/notifications?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
      return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    }
    if (hours < 24) {
      return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    }
    return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
  };

  const t = {
    title: isRTL ? 'الإشعارات' : 'Notifications',
    all: isRTL ? 'الكل' : 'All',
    unread: isRTL ? 'غير مقروءة' : 'Unread',
    markAllRead: isRTL ? 'تحديد الكل كمقروء' : 'Mark all as read',
    noNotifications: isRTL ? 'لا توجد إشعارات' : 'No notifications',
    noNotificationsDesc: isRTL ? 'ستظهر الإشعارات هنا عند وجود نشاط جديد' : 'Notifications will appear here when there is new activity',
    clearAll: isRTL ? 'مسح الكل' : 'Clear all',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} {isRTL ? 'جديد' : 'new'}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 me-1" />
            {t.markAllRead}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            {t.all}
            <Badge variant="secondary" className="ms-2">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            {t.unread}
            <Badge variant="secondary" className="ms-2">{unreadCount}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{t.noNotifications}</p>
                <p className="text-sm text-muted-foreground mt-2">{t.noNotificationsDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {filteredNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell;
                  const colorClass = notificationColors[notification.type] || 'text-muted-foreground bg-muted';
                  
                  return (
                    <Card 
                      key={notification.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        !notification.isRead && "border-primary/50 bg-primary/5"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={cn('p-2 rounded-full', colorClass)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{notification.title}</span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {notification.content}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>

                          {/* Actions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
