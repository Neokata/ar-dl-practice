'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfile, ACHIEVEMENTS, LEVELS, getCurrentLevel, type UserProfile } from '@/lib/store';

export default function AchievementsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (!profile) return null;

  const levelInfo = getCurrentLevel(profile.xp);
  const earnedSet = new Set(profile.achievements);

  return (
    <div className="min-h-screen grid-bg pb-8">
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>← Back</Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--accent-yellow)' }}>🏅 Achievements</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-6">
        {/* Level Progress */}
        <div className="card p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl animate-float">{levelInfo.level.icon}</div>
            <div className="flex-1">
              <div className="text-lg font-bold" style={{ color: levelInfo.level.color }}>{levelInfo.level.name}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.xp} XP total</div>
            </div>
          </div>
          <div className="progress-bar mb-2">
            <div className="progress-fill" style={{
              width: `${levelInfo.xpForNextLevel !== Infinity ? (levelInfo.xpInLevel / levelInfo.xpForNextLevel) * 100 : 100}%`
            }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            {LEVELS.map((lvl, i) => (
              <span key={i} style={{ color: i <= levelInfo.levelIndex ? lvl.color : 'var(--text-muted)' }}>
                {lvl.icon} {lvl.name}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Streak</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-orange)' }}>🔥 {profile.streak}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Best: {profile.longestStreak}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total XP</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-purple)' }}>{profile.xp}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Level {levelInfo.levelIndex + 1}</div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Badges ({profile.achievements.length}/{ACHIEVEMENTS.length})
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {ACHIEVEMENTS.map((ach) => {
              const earned = earnedSet.has(ach.id);
              return (
                <div key={ach.id} className="card p-3 flex items-center gap-3" style={{
                  opacity: earned ? 1 : 0.5,
                  borderColor: earned ? 'var(--accent-yellow)' : 'var(--border)',
                }}>
                  <span className="text-3xl" style={{ filter: earned ? 'none' : 'grayscale(100%)' }}>{ach.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold" style={{ color: earned ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
                      {ach.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ach.description}</div>
                  </div>
                  {earned && (
                    <span className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}