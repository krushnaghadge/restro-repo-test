'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, DEMO_USERNAME, DEMO_PASSWORD } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate slight network delay for UX
    await new Promise((r) => setTimeout(r, 400));

    if (login(username, password)) {
      router.replace('/analytics');
    } else {
      setError('Invalid username or password.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-800/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-8 py-7 text-white text-center">
            <div className="text-3xl mb-2">🍽</div>
            <h1 className="text-xl font-bold">Bistro Table</h1>
            <p className="text-amber-100 text-sm mt-1">Analytics Dashboard</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-bold text-stone-800 mb-1">Sign in</h2>
            <p className="text-stone-400 text-sm mb-6">Enter your credentials to access the dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  <span>⚠</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-900 font-bold py-3.5 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign in to Dashboard →'
                )}
              </button>
            </form>

            {/* Demo credentials hint */}
            <button
              type="button"
              onClick={() => { setUsername(DEMO_USERNAME); setPassword(DEMO_PASSWORD); }}
              className="mt-6 w-full text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-400 rounded-xl px-4 py-3 transition-colors group cursor-pointer"
            >
              <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center justify-between">
                Demo credentials
                <span className="text-amber-500 font-normal group-hover:underline">Click to autofill</span>
              </p>
              <div className="flex gap-4 text-xs text-amber-800 font-mono">
                <span>Username: <strong>{DEMO_USERNAME}</strong></span>
                <span>Password: <strong>{DEMO_PASSWORD}</strong></span>
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-stone-500 text-xs mt-6">
          <a href="/" className="hover:text-amber-400 transition-colors">← Back to Bistro Table</a>
        </p>
      </div>
    </div>
  );
}
