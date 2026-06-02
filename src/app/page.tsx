'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfile, getCurrentLevel, LEVELS, ACHIEVEMENTS, type UserProfile } from '@/lib/store';
import { categories, type CategoryKey } from '@/data/questions';

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse" style={{ color: 'var(--accent-purple)' }}>Loading...</div>
      </div>
    );
  }

  const levelInfo = getCurrentLevel(profile.xp);
  const xpProgress = levelInfo.xpForNextLevel !== Infinity
    ? (levelInfo.xpInLevel / levelInfo.xpForNextLevel) * 100
    : 100;

  const hour = new Date().getHours();
  const greeting = hour < 7 ? 'Early Bird' : hour >= 22 ? 'Night Owl' : 'Road Warrior';

  return (
    <div className="min-h-screen grid-bg pb-8">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--accent-purple)' }}>AR DL Practice</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Arkansas Driver&apos;s License</p>
          </div>
          <div className="flex gap-3">
            <Link href="/history" className="p-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} title="History">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-cyan)' }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
              </svg>
            </Link>
            <Link href="/achievements" className="p-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} title="Achievements">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-yellow)' }}>
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.9 6 20.32 6 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.9 18 20.32 18 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-5">
        {/* Level & XP Card */}
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="text-4xl animate-float">{levelInfo.level.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold" style={{ color: levelInfo.level.color }}>{levelInfo.level.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>Lv.{levelInfo.levelIndex + 1}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${xpProgress}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{profile.xp} XP</span>
                {levelInfo.levelIndex < LEVELS.length - 1 && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{LEVELS[levelInfo.levelIndex + 1].xpRequired} XP</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Streak & Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-orange)' }}>{profile.streak}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-cyan)' }}>{profile.totalTests}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Tests Done</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-yellow)' }}>{profile.achievements.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Badges</div>
          </div>
        </div>

        {/* Average Score */}
        {profile.testHistory.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Average</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent-green)' }}>
                  {Math.round(profile.testHistory.reduce((acc, t) => acc + t.percentage, 0) / profile.testHistory.length)}%
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Best</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent-purple)' }}>
                  {Math.round(Math.max(...profile.testHistory.map(t => t.percentage)))}%
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Last</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent-cyan)' }}>
                  {profile.testHistory[profile.testHistory.length - 1].score}/{profile.testHistory[profile.testHistory.length - 1].total}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Practice Test Button */}
        <Link href="/test" className="block">
          <button className="btn-primary w-full text-lg py-4">
            🚗 Start Practice Test
          </button>
        </Link>

        {/* Category Quick Stats */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Categories</h2>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(categories) as CategoryKey[]).map((key) => {
              const cat = categories[key];
              const best = profile.categoryBest[key];
              return (
                <Link href={`/test?category=${key}`} key={key} className="card p-3 flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{cat.name}</div>
                    {best !== undefined ? (
                      <div className="text-xs" style={{ color: best >= 80 ? 'var(--accent-green)' : best >= 60 ? 'var(--accent-yellow)' : 'var(--accent-pink)' }}>
                        Best: {best}%
                      </div>
                    ) : (
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Not tested</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Results */}
        {profile.testHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recent Tests</h2>
              <Link href="/history" className="text-xs" style={{ color: 'var(--accent-purple)' }}>View All →</Link>
            </div>
            <div className="space-y-2">
              {profile.testHistory.slice(-3).reverse().map((test) => (
                <Link href="/history" key={test.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: test.percentage >= 80 ? 'var(--accent-green)' : test.percentage >= 60 ? 'var(--accent-yellow)' : 'var(--accent-pink)' }}>
                      {test.score}/{test.total} — {Math.round(test.percentage)}%
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(test.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg">
                    {test.percentage >= 90 ? '🌟' : test.percentage >= 80 ? '✅' : test.percentage >= 60 ? '📝' : '📚'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Motivational message */}
        <div className="text-center py-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {profile.totalTests === 0
              ? '🚗 Ready to start? Take your first practice test!'
              : profile.streak > 0
              ? `🔥 ${profile.streak} day streak! Keep it going!`
              : `${greeting}! Time to practice!`}
          </p>
        </div>
      </main>
    </div>
  );
}