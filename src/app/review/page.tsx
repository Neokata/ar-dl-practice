'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categories, type CategoryKey } from '@/data/questions';
import Link from 'next/link';

interface ReviewQuestion {
  id: number;
  question: string;
  options: { letter: string; text: string }[];
  correct: string;
  userAnswer: string;
  category: string;
  explanation?: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('lastTest');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setReviewQuestions(parsed.questions || []);
      } catch {
        // Invalid data
      }
    }
  }, []);

  const wrongQuestions = reviewQuestions.filter(q => q.userAnswer !== q.correct);
  const correctQuestions = reviewQuestions.filter(q => q.userAnswer === q.correct);

  if (reviewQuestions.length === 0) {
    return (
      <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">No Test to Review</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Take a practice test first, then you can review your answers here.</p>
          <Link href="/test">
            <button className="btn-primary">Start a Test</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg pb-8">
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>← Home</Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--accent-pink)' }}>🔍 Review Answers</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Correct</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-green)' }}>{correctQuestions.length}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Wrong</div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-pink)' }}>{wrongQuestions.length}</div>
          </div>
        </div>

        {/* Toggle: show wrong only vs all */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(false)}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: !showAll ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))' : 'var(--bg-secondary)',
              color: !showAll ? 'white' : 'var(--text-muted)',
            }}
          >
            ❌ Wrong Only ({wrongQuestions.length})
          </button>
          <button
            onClick={() => setShowAll(true)}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: showAll ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' : 'var(--bg-secondary)',
              color: showAll ? 'white' : 'var(--text-muted)',
            }}
          >
            📋 All ({reviewQuestions.length})
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {(showAll ? reviewQuestions : wrongQuestions).map((q, i) => {
            const isCorrect = q.userAnswer === q.correct;
            const catInfo = categories[q.category as CategoryKey];
            return (
              <div key={q.id} className="card p-4" style={{ borderColor: isCorrect ? 'var(--border)' : 'var(--accent-pink)' }}>
                <div className="flex items-center gap-2 mb-2">
                  {catInfo && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: (catInfo.color || '#8b5cf6') + '20', color: catInfo.color || '#8b5cf6' }}>
                      {catInfo.icon} {catInfo.name}
                    </span>
                  )}
                  <span className="text-xs font-bold ml-auto" style={{ color: isCorrect ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
                    {isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>

                <h3 className="font-semibold mb-3 leading-relaxed">{q.question}</h3>

                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isUserAnswer = opt.letter === q.userAnswer;
                    const isCorrectAnswer = opt.letter === q.correct;
                    let bg = 'var(--bg-secondary)';
                    let border = '1px solid var(--border)';
                    let textColor = 'var(--text-secondary)';

                    if (isCorrectAnswer) {
                      bg = 'rgba(16,185,129,0.15)';
                      border = '1px solid var(--accent-green)';
                      textColor = 'var(--accent-green)';
                    } else if (isUserAnswer && !isCorrect) {
                      bg = 'rgba(236,72,153,0.15)';
                      border = '1px solid var(--accent-pink)';
                      textColor = 'var(--accent-pink)';
                    }

                    return (
                      <div key={opt.letter} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: bg, border }}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: isCorrectAnswer ? 'var(--accent-green)' : isUserAnswer ? 'var(--accent-pink)' : 'var(--bg-secondary)', color: isCorrectAnswer || isUserAnswer ? 'white' : 'var(--text-muted)' }}>
                          {opt.letter}
                        </span>
                        <span className="text-sm flex-1" style={{ color: textColor }}>{opt.text}</span>
                        {isCorrectAnswer && <span style={{ color: 'var(--accent-green)' }}>✓</span>}
                        {isUserAnswer && !isCorrect && <span style={{ color: 'var(--accent-pink)' }}>✗</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-purple)' }}>💡 Explanation</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {wrongQuestions.length === 0 && !showAll && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold" style={{ color: 'var(--accent-green)' }}>No wrong answers! Perfect score!</p>
          </div>
        )}
      </main>
    </div>
  );
}