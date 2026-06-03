'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuestionsByCategory, questions, categories, shuffleArray, type Question, type CategoryKey } from '@/data/questions';

type StudyMode = 'all' | 'category' | 'weak' | 'marked';

export default function StudyPage() {
  const router = useRouter();
  const [mode, setMode] = useState<StudyMode | null>(null);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [cards, setCards] = useState<Question[]>([]);
  const [cardCount, setCardCount] = useState(25);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('ar-dl-bookmarks');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [showMarkedOnly, setShowMarkedOnly] = useState(false);
  const [weakCategories, setWeakCategories] = useState<CategoryKey[]>([]);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem('ar-dl-bookmarks', JSON.stringify([...bookmarked])); } catch { /* empty */ }
  }, [bookmarked]);

  // Load weak categories from profile
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
      case 'category':
        qs = cat ? shuffleArray(getQuestionsByCategory(cat)) : shuffleArray([...questions]);
        break;
      case 'weak':
        qs = weakCategories.length > 0
          ? shuffleArray(questions.filter(q => weakCategories.includes(q.category as CategoryKey)))
          : shuffleArray([...questions]);
        break;
      case 'marked':
        qs = shuffleArray(questions.filter(q => bookmarked.has(q.id)));
        if (qs.length === 0) qs = shuffleArray([...questions]); // fallback if no bookmarks yet
        break;
      default:
        qs = shuffleArray([...questions]);
    }
    qs = qs.slice(0, Math.min(cardCount, qs.length));
    setCards(qs);
    setCurrentIndex(0);
    setFlipped(false);
    setShowMarkedOnly(studyMode === 'marked');
    setMode(studyMode);
    setCategory(cat || null);
  };

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const currentCard = cards[currentIndex];

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

          {/* Question count selector */}
          <div className="card p-4">
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>How many cards?</div>
            <div className="flex gap-2">
              {[10, 15, 25].map((count) => (
                <button key={count} onClick={() => setCardCount(count)}
                  className="flex-1 py-3 rounded-xl text-lg font-bold transition-all"
                  style={{
                    background: cardCount === count ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' : 'var(--bg-secondary)',
                    color: cardCount === count ? 'white' : 'var(--text-muted)',
                    border: cardCount === count ? 'none' : '1px solid var(--border)',
                    boxShadow: cardCount === count ? '0 0 15px rgba(139,92,246,0.3)' : 'none',
                  }}>
                  {count}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              <span>Quick</span><span>Standard</span><span>Full</span>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => startStudy('all')} className="btn-primary w-full text-lg py-4">
              🎲 All Cards ({questions.length})
            </button>

            {bookmarked.size > 0 && (
              <button onClick={() => startStudy('marked')} className="card w-full p-4 text-left" style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'var(--accent-purple)' }}>
                <div className="font-bold" style={{ color: 'var(--accent-purple)' }}>🔖 Marked for Review</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{bookmarked.size} cards bookmarked</div>
              </button>
            )}

            {weakCategories.length > 0 && (
              <button onClick={() => startStudy('weak')} className="card w-full p-4 text-left" style={{ background: 'rgba(236,72,153,0.1)', borderColor: 'var(--accent-pink)' }}>
                <div className="font-bold" style={{ color: 'var(--accent-pink)' }}>🎯 Focus on Weak Areas</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {weakCategories.length} categories below 80% — {questions.filter(q => weakCategories.includes(q.category as CategoryKey)).length} cards
                </div>
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid var(--border)' }} /></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>or pick a category</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(categories) as CategoryKey[]).map((key) => (
                <button key={key} onClick={() => startStudy('category', key)} className="card p-3 text-center hover:scale-[1.02] transition-transform">
                  <span className="text-lg">{categories[key].icon}</span>
                  <div className="text-sm font-medium mt-1">{categories[key].name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{questions.filter(q => q.category === key).length} cards</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => router.push('/')} className="btn-secondary w-full">← Back Home</button>
        </main>
      </div>
    );
  }

  const isBookmarked = currentCard ? bookmarked.has(currentCard.id) : false;

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setMode(null)} className="text-sm" style={{ color: 'var(--text-muted)' }}>← Back</button>
        <div className="text-sm font-medium">{currentIndex + 1} / {cards.length}</div>
        <button onClick={() => currentCard && toggleBookmark(currentCard.id)} className="text-lg" style={{ color: isBookmarked ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
          {isBookmarked ? '🔖' : '📑'}
        </button>
      </header>

      <div className="progress-bar mx-4 mt-2" style={{ height: '4px' }}>
        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%`, height: '100%' }} />
      </div>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col items-center justify-center">
        {currentCard && (
          <div className="w-full" onClick={() => setFlipped(!flipped)} style={{ cursor: 'pointer' }}>
            <div className="card p-6 min-h-[280px] flex flex-col items-center justify-center text-center" style={{
              borderColor: flipped ? 'var(--accent-green)' : 'var(--border)',
              transition: 'border-color 0.3s ease',
            }}>
              <div className="mb-4">
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: (categories[currentCard.category as CategoryKey]?.color || '#8b5cf6') + '20', color: categories[currentCard.category as CategoryKey]?.color || '#8b5cf6' }}>
                  {categories[currentCard.category as CategoryKey]?.icon} {categories[currentCard.category as CategoryKey]?.name}
                </span>
              </div>

              {!flipped ? (
                <>
                  <h2 className="text-xl font-semibold leading-relaxed">{currentCard.question}</h2>
                  <div className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>Tap to reveal answer</div>
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
                        <span className="text-sm text-left flex-1" style={{ color: opt.letter === currentCard.correct ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{opt.text}</span>
                        {opt.letter === currentCard.correct && <span>✓</span>}
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
            }}>← Prev</button>
          <button onClick={() => currentCard && toggleBookmark(currentCard.id)}
            className="py-3 px-4 rounded-xl text-sm" style={{
              background: isBookmarked ? 'rgba(234,179,8,0.2)' : 'var(--bg-secondary)',
              color: isBookmarked ? 'var(--accent-yellow)' : 'var(--text-muted)',
              border: isBookmarked ? '1px solid var(--accent-yellow)' : '1px solid var(--border)',
            }}>{isBookmarked ? '🔖 Marked' : '📑 Mark'}</button>
          <button onClick={handleNext} disabled={currentIndex === cards.length - 1}
            className="flex-1 py-3 rounded-xl font-bold text-sm" style={{
              background: 'var(--bg-secondary)', color: currentIndex === cards.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              border: '1px solid var(--border)', opacity: currentIndex === cards.length - 1 ? 0.5 : 1,
            }}>Next →</button>
        </div>
        <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Tap card to flip • Mark cards to review later
        </div>
      </footer>
    </div>
  );
}