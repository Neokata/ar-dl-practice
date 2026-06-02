'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProfile, getCurrentLevel, ACHIEVEMENTS, LEVELS } from '@/lib/store';

export default function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ReturnType<typeof getProfile> | null>(null);

  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '25');
  const pct = parseInt(searchParams.get('pct') || '0');
  const xp = parseInt(searchParams.get('xp') || '0');
  const time = parseInt(searchParams.get('time') || '0');
  const newAchStr = searchParams.get('newAch') || '';
  const newAchievements = newAchStr ? newAchStr.split(',').filter(Boolean) : [];

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const passed = pct >= 80;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const levelInfo = profile ? getCurrentLevel(profile.xp) : null;

  const getGradeEmoji = () => {
    if (pct === 100) return '🏆';
    if (pct >= 90) return '🌟';
    if (pct >= 80) return '✅';
    if (pct >= 70) return '📝';
    if (pct >= 60) return '📖';
    return '📚';
  };

  const getGradeMessage = () => {
    if (pct === 100) return "Perfect Score! You're ready for the real thing!";
    if (pct >= 90) return 'Excellent work! Almost perfect!';
    if (pct >= 80) return 'You passed! Keep it up!';
    if (pct >= 70) return 'Almost there! A few more topics to review.';
    if (pct >= 60) return 'Good effort! More practice will help.';
    return "Keep studying! You'll get there.";
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-score-pop">{getGradeEmoji()}</div>
          <h1 className="text-4xl font-bold mb-2 animate-score-pop" style={{ color: passed ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
            {score}/{total}
          </h1>
          <div className="text-2xl font-bold mb-2" style={{ color: passed ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
            {pct}%{passed ? ' — PASSED!' : ' — Keep Practicing'}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{getGradeMessage()}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Time</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-cyan)' }}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="stat-card">
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>XP Earned</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-purple)' }}>+{xp}</div>
          </div>
        </div>

        {profile && levelInfo && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{levelInfo.level.icon} {levelInfo.level.name}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.xp} XP</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${levelInfo.xpForNextLevel !== Infinity ? (levelInfo.xpInLevel / levelInfo.xpForNextLevel) * 100 : 100}%`
              }} />
            </div>
            {levelInfo.levelIndex < LEVELS.length - 1 && (
              <div className="text-xs mt-1 text-center" style={{ color: 'var(--text-muted)' }}>
                Next: {LEVELS[levelInfo.levelIndex + 1].name} at {LEVELS[levelInfo.levelIndex + 1].xpRequired} XP
              </div>
            )}
          </div>
        )}

        {newAchievements.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-yellow)' }}>
              🏅 New Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!
            </h2>
            {newAchievements.map(achId => {
              const achievement = ACHIEVEMENTS.find(a => a.id === achId);
              if (!achievement) return null;
              return (
                <div key={achId} className="card p-3 flex items-center gap-3 animate-slide-up glow-purple">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <div className="font-bold" style={{ color: 'var(--accent-yellow)' }}>{achievement.name}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{achievement.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button onClick={() => router.push('/test')} className="btn-primary w-full">
            🚗 Take Another Test
          </button>
          <button onClick={() => router.push('/')} className="btn-secondary w-full">
            🏠 Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}