'use client';

import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'ar-dl-onboarded';

export default function OnboardingOverlay() {
  const [step, setStep] = useState(-1); // -1 means not showing

  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDING_KEY);
    if (!onboarded) {
      setStep(0);
    }
  }, []);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setStep(-1);
    }
  };

  if (step === -1) return null;

  const steps = [
    {
      icon: '🚗',
      title: 'AR DL Practice',
      subtitle: 'Your Arkansas driver\'s license study buddy',
      description: 'Practice tests, flashcards, and progress tracking — all designed to help you pass the first time.',
    },
    {
      icon: '🎮',
      title: 'Level Up as You Learn',
      subtitle: 'Earn XP, unlock achievements, build streaks',
      description: 'Every correct answer earns XP. Hit milestones to level up from Learner to Licensed. Keep your daily streak alive!',
    },
    {
      icon: '📚',
      title: 'Study Your Way',
      subtitle: 'Practice tests or flashcards — you choose',
      description: 'Take 10, 15, or 25-question tests, or flip through study cards at your own pace. Focus on weak categories to improve faster.',
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
      <div className="max-w-sm w-full text-center animate-slide-up">
        <div className="text-7xl mb-6 animate-float">{current.icon}</div>
        <h1 className="text-2xl font-bold mb-1 glow-text-purple">{current.title}</h1>
        <p className="text-sm font-medium mb-4" style={{ color: 'var(--accent-cyan)' }}>{current.subtitle}</p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>{current.description}</p>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{
              background: i === step ? 'var(--accent-purple)' : 'var(--border)',
              boxShadow: i === step ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
            }} />
          ))}
        </div>

        <button onClick={handleNext} className="btn-primary w-full py-4 text-lg">
          {step < 2 ? 'Next →' : "Let's Go! 🎉"}
        </button>

        {step < 2 && (
          <button onClick={() => { localStorage.setItem(ONBOARDING_KEY, 'true'); setStep(-1); }}
            className="mt-3 text-sm w-full py-2" style={{ color: 'var(--text-muted)' }}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}