'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Loader2,
  Check,
  CheckCheck,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    isOnline?: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
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

export function MessagesCenter() {
  const { user, locale } = useAppStore();
  const isRTL = locale === 'ar';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/messages?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedConversation.user.id,
          content: newMessage.trim(),
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const message: Message = data.message || {
          id: Date.now().toString(),
          content: newMessage.trim(),
          senderId: user.id,
          receiverId: selectedConversation.user.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        // Update conversation locally
        const updatedConversations = conversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
            };
          }
          return conv;
        });

        setConversations(updatedConversations);
        setSelectedConversation({
          ...selectedConversation,
          messages: [...selectedConversation.messages, message],
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastMessageTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
      return isRTL ? `${minutes} د` : `${minutes}m`;
    }
    if (hours < 24) {
      return isRTL ? `${hours} س` : `${hours}h`;
    }
    if (days < 7) {
      return isRTL ? `${days} ي` : `${days}d`;
    }
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const t = {
    title: isRTL ? 'الرسائل' : 'Messages',
    search: isRTL ? 'بحث...' : 'Rechercher...',
    typeMessage: isRTL ? 'اكتب رسالة...' : 'Tapez un message...',
    noMessages: isRTL ? 'لا توجد رسائل' : 'Aucun message',
    noMessagesDesc: isRTL ? 'ابدأ محادثة جديدة مع مستخدمين آخرين' : 'Start a new conversation with other users',
    selectConversation: isRTL ? 'اختر محادثة' : 'Sélectionnez une conversation',
    online: isRTL ? 'متصل' : 'En ligne',
    offline: isRTL ? 'غير متصل' : 'Hors ligne',
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      <div className="grid h-full lg:grid-cols-3 gap-4">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t.title}
              </CardTitle>
              <Badge variant="secondary">
                {conversations.filter(c => c.unreadCount > 0).length}
              </Badge>
            </div>
            {/* Search */}
            <div className="relative mt-2">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="ps-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t.noMessages}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.noMessagesDesc}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={cn(
                        "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                        selectedConversation?.id === conversation.id && "bg-muted"
                      )}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.user.avatar} />
                          <AvatarFallback className={cn('text-white', roleColors[conversation.user.role])}>
                            {getInitials(conversation.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.user.isOnline && (
                          <div className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{conversation.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatLastMessageTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.user.avatar} />
                        <AvatarFallback className={cn('text-white', roleColors[selectedConversation.user.role])}>
                          {getInitials(selectedConversation.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.user.isOnline && (
                        <div className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selectedConversation.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.user.isOnline ? t.online : t.offline}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        {isRTL ? 'ابدأ المحادثة' : 'Start the conversation'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message) => {
                        const isOwn = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-2xl px-4 py-2",
                                isOwn 
                                  ? "bg-primary text-primary-foreground rounded-bl-md" 
                                  : "bg-muted rounded-br-md"
                              )}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className={cn(
                                "flex items-center gap-1 mt-1",
                                isOwn ? "justify-end" : "justify-start"
                              )}>
                                <span className="text-xs opacity-70">
                                  {formatTime(message.createdAt)}
                                </span>
                                {isOwn && (
                                  message.isRead 
                                    ? <CheckCheck className="h-3 w-3 opacity-70" />
                                    : <Check className="h-3 w-3 opacity-70" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="p-3 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.typeMessage}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t.selectConversation}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
