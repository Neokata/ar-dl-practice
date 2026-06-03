'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRandomQuestions, getQuestionsByCategory, questions, categories, type Question, type CategoryKey } from '@/data/questions';
import { signQuestionVisuals } from '@/components/RoadSigns';
import React from 'react';

type StudyMode = 'all' | 'category' | 'weak' | 'missed';

export default function StudyPage() {
  const [mode, setMode] = useState<StudyMode | null>(null);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [cards, setCards] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

  // Load weak/missed categories from profile
  const [weakCategories, setWeakCategories] = useState<CategoryKey[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ar-dl-practice');
      if (stored) {
        const profile = JSON.parse(stored);
        const weak: CategoryKey[] = [];
        for (const [cat, best] of Object.entries(profile.categoryBest || {})) {
          if ((best as number) < 80) weak.push(cat as CategoryKey);
        }
        setWeakCategories(weak);
      }
    } catch { /* empty */ }
  }, []);

  const startStudy = (studyMode: StudyMode, cat?: CategoryKey) => {
    let qs: Question[];
    switch (studyMode) {
      case 'all':
        qs = [...questions].sort(() => Math.random() - 0.5);
        break;
      case 'category':
        qs = cat ? getQuestionsByCategory(cat).sort(() => Math.random() - 0.5) : [...questions].sort(() => Math.random() - 0.5);
        break;
      case 'weak':
        qs = weakCategories.length > 0
          ? questions.filter(q => weakCategories.includes(q.category as CategoryKey)).sort(() => Math.random() - 0.5)
          : [...questions].sort(() => Math.random() - 0.5);
        break;
      default:
        qs = [...questions].sort(() => Math.random() - 0.5);
    }
    setCards(qs);
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards(new Set());
    setMode(studyMode);
    setCategory(cat || null);
  };

  const markKnown = () => {
    setKnownCards(prev => new Set([...prev, cards[currentIndex].id]));
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
    }
  };

  const handleFlip = () => setFlipped(!flipped);

  const currentCard = cards[currentIndex];

  // Setup screen
  if (mode === null) {
    return (
      <div className="min-h-screen grid-bg pb-8">
        <header className="px-4 pt-6 pb-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>← Home</Link>
            <h1 className="text-xl font-bold" style={{ color: 'var(--accent-purple)' }}>📚 Study Mode</h1>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 space-y-5">
          <div className="text-center py-4">
            <p style={{ color: 'var(--text-secondary)' }}>
              Flip through cards to learn at your own pace. No score, no pressure — just learning.
            </p>
          </div>

          <div className="space-y-3">
            <button onClick={() => startStudy('all')} className="btn-primary w-full py-4 text-lg">
              🎲 All Questions ({questions.length})
            </button>

            {weakCategories.length > 0 && (
              <button onClick={() => startStudy('weak')} className="card w-full p-4 text-left hover:border-[var(--accent-pink)]" style={{ background: 'rgba(236,72,153,0.1)' }}>
                <div className="font-bold" style={{ color: 'var(--accent-pink)' }}>🎯 Focus on Weak Areas</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {weakCategories.length} categories below 80% — {questions.filter(q => weakCategories.includes(q.category as CategoryKey)).length} cards
                </div>
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid var(--border)' }} /></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>or study by category</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(categories) as CategoryKey[]).map((key) => (
                <button key={key} onClick={() => startStudy('category', key)}
                  className="card p-3 text-center hover:scale-[1.02] transition-transform">
                  <span className="text-lg">{categories[key].icon}</span>
                  <div className="text-sm font-medium mt-1">{categories[key].name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {questions.filter(q => q.category === key).length} cards
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Card view
  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setMode(null)} className="text-sm" style={{ color: 'var(--text-muted)' }}>← Back</button>
        <div className="text-sm font-medium">
          {currentIndex + 1} / {cards.length}
        </div>
        <div className="text-xs" style={{ color: 'var(--accent-green)' }}>
          ✓ {knownCards.size}
        </div>
      </header>

      <div className="progress-bar mx-4 mt-2" style={{ height: '4px' }}>
        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%`, height: '100%' }} />
      </div>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col items-center justify-center">
        {currentCard && (
          <div className="w-full" onClick={handleFlip} style={{ cursor: 'pointer' }}>
            <div className="card p-6 min-h-[280px] flex flex-col items-center justify-center text-center" style={{
              transform: flipped ? 'rotateY(0deg)' : 'rotateY(0deg)',
              transition: 'transform 0.3s ease',
              borderColor: flipped ? 'var(--accent-green)' : 'var(--border)',
            }}>
              {/* Category badge */}
              <div className="mb-4">
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: (categories[currentCard.category as CategoryKey]?.color || '#8b5cf6') + '20', color: categories[currentCard.category as CategoryKey]?.color || '#8b5cf6' }}>
                  {categories[currentCard.category as CategoryKey]?.icon} {categories[currentCard.category as CategoryKey]?.name}
                </span>
              </div>

              {/* Visual sign if available */}
              {signQuestionVisuals[currentCard.id] && !flipped && (
                <div className="flex justify-center mb-4">
                  {React.createElement(signQuestionVisuals[currentCard.id], { size: 90 })}
                </div>
              )}

              {!flipped ? (
                <>
                  <h2 className="text-xl font-semibold leading-relaxed">{currentCard.question}</h2>
                  <div className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Tap to reveal answer
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-medium mb-4 leading-relaxed">{currentCard.question}</h2>
                  <div className="w-full space-y-2 mb-4">
                    {currentCard.options.map((opt) => (
                      <div key={opt.letter} className="flex items-center gap-3 p-3 rounded-lg" style={{
                        background: opt.letter === currentCard.correct ? 'rgba(16,185,129,0.15)' : 'transparent',
                        border: opt.letter === currentCard.correct ? '1px solid var(--accent-green)' : '1px solid transparent',
                      }}>
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ background: opt.letter === currentCard.correct ? 'var(--accent-green)' : 'var(--bg-secondary)', color: opt.letter === currentCard.correct ? 'white' : 'var(--text-muted)' }}>
                          {opt.letter}
                        </span>
                        <span className="text-sm text-left" style={{ color: opt.letter === currentCard.correct ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                          {opt.text}
                        </span>
                        {opt.letter === currentCard.correct && <span className="ml-auto">✓</span>}
                      </div>
                    ))}
                  </div>
                  {currentCard.explanation && (
                    <div className="p-3 rounded-lg w-full text-left" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-purple)' }}>💡 Explanation</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{currentCard.explanation}</div>
                    </div>
                  )}
                  <div className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>Tap to hide</div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-3">
          <button onClick={handlePrev} disabled={currentIndex === 0}
            className="flex-1 py-3 rounded-xl font-bold text-sm" style={{
              background: 'var(--bg-secondary)', color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              border: '1px solid var(--border)', opacity: currentIndex === 0 ? 0.5 : 1,
            }}>
            ← Prev
          </button>
          <button onClick={markKnown}
            className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)' }}>
            ✓ Know It
          </button>
          <button onClick={handleNext} disabled={currentIndex === cards.length - 1}
            className="flex-1 py-3 rounded-xl font-bold text-sm" style={{
              background: 'var(--bg-secondary)', color: currentIndex === cards.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              border: '1px solid var(--border)', opacity: currentIndex === cards.length - 1 ? 0.5 : 1,
            }}>
            Next →
          </button>
        </div>
        <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Tap card to flip • Mark &quot;Know It&quot; to track progress
        </div>
      </footer>
    </div>
  );
}