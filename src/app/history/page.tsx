'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfile, type UserProfile } from '@/lib/store';

export default function HistoryPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (!profile) return null;

  const tests = [...profile.testHistory].reverse();

  return (
    <div className="min-h-screen grid-bg pb-8">
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>← Back</Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--accent-cyan)' }}>📊 Test History</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-4">
        {tests.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold mb-2">No Tests Yet</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Take your first practice test to see your history here.</p>
            <Link href="/test">
              <button className="btn-primary mt-6">Start a Test</button>
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="stat-card">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Tests</div>
                <div className="text-xl font-bold" style={{ color: 'var(--accent-cyan)' }}>{profile.totalTests}</div>
              </div>
              <div className="stat-card">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Average</div>
                <div className="text-xl font-bold" style={{ color: 'var(--accent-green)' }}>
                  {tests.length > 0 ? Math.round(tests.reduce((a, t) => a + t.percentage, 0) / tests.length) : 0}%
                </div>
              </div>
              <div className="stat-card">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Best</div>
                <div className="text-xl font-bold" style={{ color: 'var(--accent-purple)' }}>
                  {tests.length > 0 ? Math.round(Math.max(...tests.map(t => t.percentage))) : 0}%
                </div>
              </div>
            </div>

            {/* Test history list */}
            <div className="space-y-2">
              {tests.map((test) => {
                const passed = test.percentage >= 80;
                return (
                  <div key={test.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {test.percentage >= 90 ? '🌟' : test.percentage >= 80 ? '✅' : test.percentage >= 60 ? '📝' : '📚'}
                        </span>
                        <div>
                          <div className="font-bold" style={{ color: passed ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                            {test.score}/{test.total} — {Math.round(test.percentage)}%
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(test.date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: 'numeric', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full font-medium" style={{
                        background: passed ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.15)',
                        color: passed ? 'var(--accent-green)' : 'var(--accent-pink)'
                      }}>
                        {passed ? 'PASS' : 'STUDY'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>⏱️ {Math.floor(test.duration / 60)}:{(test.duration % 60).toString().padStart(2, '0')}</span>
                      {Object.entries(test.categories).slice(0, 3).map(([cat, stats]) => (
                        <span key={cat}>{Math.round((stats.correct / stats.total) * 100)}% {cat.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}