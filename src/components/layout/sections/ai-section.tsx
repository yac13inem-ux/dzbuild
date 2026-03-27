'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Sparkles, Loader2, MessageCircle } from 'lucide-react';

const suggestedQuestions = {
  ar: [
    'كيف أحسب كمية الإسمنت للبناء؟',
    'ما هي مراحل البناء الأساسية؟',
    'كيف أختار المقاول المناسب؟',
  ],
  fr: [
    'Comment calculer la quantité de ciment?',
    'Quelles sont les étapes de construction?',
    'Comment choisir le bon entrepreneur?',
  ],
  en: [
    'How to calculate cement quantity?',
    'What are the construction stages?',
    'How to choose the right contractor?',
  ],
};

export function AISection() {
  const { locale } = useAppStore();
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user' as const,
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: locale === 'ar' 
          ? 'شكراً لسؤالك! للحصول على إجابة دقيقة، يرجى التواصل مع أحد المهندسين المتخصصين من خلال المنصة.'
          : locale === 'fr'
          ? 'Merci pour votre question! Pour une réponse précise, veuillez contacter un ingénieur spécialisé via la plateforme.'
          : 'Thank you for your question! For an accurate answer, please contact a specialized engineer through the platform.',
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <section id="ai" className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-4 w-4 me-2" />
            {locale === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : locale === 'fr' ? 'Propulsé par l\'IA' : 'AI Powered'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'المساعد الذكي للبناء' : locale === 'fr' ? 'Assistant IA Construction' : 'AI Construction Assistant'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' ? 'اسأل أي سؤال عن البناء والهندسة' : locale === 'fr' ? 'Posez n\'importe quelle question sur la construction' : 'Ask any question about construction'}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <span>DzBuild AI</span>
                  <p className="text-sm font-normal text-muted-foreground">
                    {locale === 'ar' ? 'مساعدك في البناء والهندسة' : locale === 'fr' ? 'Votre assistant construction' : 'Your construction assistant'}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Bot className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {locale === 'ar' ? 'مرحباً! كيف يمكنني مساعدتك؟' : locale === 'fr' ? 'Bonjour! Comment puis-je vous aider?' : 'Hello! How can I help you?'}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestedQuestions[locale as 'ar' | 'fr' | 'en'].map((q, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedQuestion(q)}
                          className="text-xs"
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl px-4 py-2 bg-muted flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">
                        {locale === 'ar' ? 'جاري التفكير...' : locale === 'fr' ? 'Réflexion...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={locale === 'ar' ? 'اكتب سؤالك هنا...' : locale === 'fr' ? 'Écrivez votre question...' : 'Type your question...'}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
