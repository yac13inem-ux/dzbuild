'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkDatabase = async () => {
    setLoading(true);
    setStatus('Checking database...');
    try {
      const res = await fetch('/api/setup/db');
      const data = await res.json();
      setResult(data);
      setStatus(data.message || JSON.stringify(data));
    } catch (error: any) {
      setStatus('Error: ' + error.message);
    }
    setLoading(false);
  };

  const createAdmin = async () => {
    setLoading(true);
    setStatus('Creating admin user...');
    try {
      const res = await fetch('/api/setup/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'yac13inem@gmail.com',
          password: 'Amina022000l',
          name: 'Admin',
          secretKey: 'dzbuild-secret-2026'
        })
      });
      const data = await res.json();
      setResult(data);
      setStatus(data.success ? 'Admin created successfully!' : data.error);
    } catch (error: any) {
      setStatus('Error: ' + error.message);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    setStatus('Testing login...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'yac13inem@gmail.com',
          password: 'Amina022000l'
        })
      });
      const data = await res.json();
      setResult(data);
      setStatus(data.success ? 'Login successful!' : data.error);
    } catch (error: any) {
      setStatus('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">DzBuild Setup</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 px-6 rounded-lg font-medium"
          >
            1. Check Database Connection
          </button>
          
          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-3 px-6 rounded-lg font-medium"
          >
            2. Create Admin User
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 py-3 px-6 rounded-lg font-medium"
          >
            3. Test Login
          </button>
        </div>
        
        {status && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <p className="font-medium">{status}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
