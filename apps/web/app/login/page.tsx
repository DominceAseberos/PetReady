'use client';

import { useState } from 'react';
import { PawPrint } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'register' ? '/v1/auth/register' : '/v1/auth/login';
    const body = mode === 'register'
      ? { email, password, name, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      : { email, password };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Store token in localStorage AND cookie (middleware reads cookie)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      // Redirect to quiz
      window.location.href = '/quiz';
    } catch (err) {
      setError('Cannot connect to server. Is the API running on port 3001?');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <PawPrint className="h-7 w-7 text-primary-600" strokeWidth={1.8} />
          <span className="font-display text-xl font-bold text-gray-900">PetReady</span>
        </div>

        <h1 className="font-display text-2xl font-bold text-gray-900 text-center" data-testid="auth-title">
          {mode === 'register' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          {mode === 'register' ? 'Start your pet readiness journey' : 'Continue your simulation'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" data-testid="auth-form">
          {mode === 'register' && (
            <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-testid="name-input" />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-testid="email-input" />
          <input type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-testid="password-input" />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2" data-testid="auth-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full rounded-md bg-primary-600 px-4 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors" data-testid="auth-submit">
            {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
            className="font-medium text-primary-600 hover:text-primary-700">
            {mode === 'register' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </main>
  );
}
