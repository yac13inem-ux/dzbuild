'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const { user, isLoggedIn } = useAppStore();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const data = await res.json();
      setSessionInfo(data);
    } catch (error) {
      setSessionInfo({ error: 'Failed to fetch session' });
    }
    setLoading(false);
  };

  const testPost = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          content: 'Test post from debug page',
          category: 'discussion'
        }),
      });
      const data = await res.json();
      setTestResult({ status: res.status, data });
    } catch (error) {
      setTestResult({ error: 'Failed to create post' });
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check session on mount
    const initSession = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        const data = await res.json();
        setSessionInfo(data);
      } catch (error) {
        setSessionInfo({ error: 'Failed to fetch session' });
      }
      setLoading(false);
    };
    initSession();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Page</h1>
        
        {/* Local Storage User */}
        <Card>
          <CardHeader>
            <CardTitle>Local Storage (Zustand)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify({ 
                isLoggedIn,
                user: user ? {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                } : null 
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Session (Cookie/Server)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkSession} disabled={loading}>
              Refresh Session
            </Button>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Test Post */}
        <Card>
          <CardHeader>
            <CardTitle>Test Create Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testPost} disabled={loading || !user}>
              Create Test Post
            </Button>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {typeof document !== 'undefined' ? document.cookie : 'SSR'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
