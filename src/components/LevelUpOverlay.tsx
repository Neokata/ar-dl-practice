'use client';

import { useEffect, useState } from 'react';
import { getProfile, getCurrentLevel, LEVELS } from '@/lib/store';

export default function LevelUpOverlay() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<typeof LEVELS[number] | null>(null);

  useEffect(() => {
    const checkLevelUp = () => {
      try {
        const stored = localStorage.getItem('ar-dl-level-up');
        if (stored) {
          const { levelIndex } = JSON.parse(stored);
          setNewLevel(LEVELS[levelIndex]);
          setShowLevelUp(true);
          localStorage.removeItem('ar-dl-level-up');
        }
      } catch { /* empty */ }
    };

    checkLevelUp();
    // Also check on storage events (in case another tab triggered it)
    window.addEventListener('storage', checkLevelUp);
    return () => window.removeEventListener('storage', checkLevelUp);
  }, []);

  useEffect(() => {
    if (!showLevelUp) return;
    const timer = setTimeout(() => setShowLevelUp(false), 4000);
    return () => clearTimeout(timer);
  }, [showLevelUp]);

  if (!showLevelUp || !newLevel) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="text-center animate-score-pop">
        <div className="text-8xl mb-4 animate-float">{newLevel.icon}</div>
        <div className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--accent-cyan)' }}>Level Up!</div>
        <div className="text-3xl font-bold mb-2" style={{ color: newLevel.color }}>{newLevel.name}</div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {newLevel.xpRequired} XP reached
        </div>
        {/* Confetti-like particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                background: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'][i % 5],
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animation: `confetti-fall ${2 + Math.random() * 2}s ${Math.random() * 1.5}s ease-in forwards`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}