'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRandomQuestions, getQuestionsByCategory, questions, categories, type Question, type CategoryKey } from '@/data/questions';
import { getProfile, saveProfile, updateStreak, calculateXP, checkAchievements, type TestResult } from '@/lib/store';
import { generateId } from '@/lib/utils';

type QuizState = 'setup' | 'playing' | 'review';

export default function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as CategoryKey | null;

  const [state, setState] = useState<QuizState>('setup');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const startTest = useCallback((category?: CategoryKey) => {
    const qs = category
      ? getQuestionsByCategory(category)
      : getRandomQuestions(25);
    const shuffled = [...qs].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled.slice(0, Math.min(25, shuffled.length)));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResult(false);
    setStartTime(Date.now());
    setState('playing');
  }, []);

  useEffect(() => {
    if (categoryParam && categories[categoryParam]) {
      startTest(categoryParam);
    }
  }, [categoryParam, startTest]);

  const currentQuestion = quizQuestions[currentIndex];

  const handleSelectAnswer = (letter: string) => {
    if (showResult) return;
    setSelectedAnswer(letter);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: selectedAnswer }));
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    let correct = 0;
    const categoryStats: Record<string, { correct: number; total: number }> = {};

    quizQuestions.forEach((q, i) => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { correct: 0, total: 0 };
      }
      categoryStats[q.category].total++;
      if (answers[i] === q.correct) {
        correct++;
        categoryStats[q.category].correct++;
      }
    });

    const total = quizQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    const xp = calculateXP(correct, total, duration);

    const result: TestResult = {
      id: generateId(),
      date: new Date().toISOString(),
      score: correct,
      total,
      percentage,
      duration,
      categories: categoryStats,
    };

    const profile = getProfile();
    profile.testHistory.push(result);
    profile.totalTests += 1;
    profile.xp += xp;
    updateStreak(profile);

    Object.entries(categoryStats).forEach(([cat, stats]) => {
      const pct = Math.round((stats.correct / stats.total) * 100);
      if (!profile.categoryBest[cat] || pct > profile.categoryBest[cat]) {
        profile.categoryBest[cat] = pct;
      }
    });

    const newAchievements = checkAchievements(profile, result);
    profile.achievements.push(...newAchievements);

    saveProfile(profile);

    const params = new URLSearchParams({
      score: correct.toString(),
      total: total.toString(),
      pct: percentage.toString(),
      xp: xp.toString(),
      time: duration.toString(),
      newAch: newAchievements.join(','),
    });
    router.push(`/results?${params.toString()}`);
  };

  if (state === 'setup') {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 animate-slide-up">
          <div className="text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h1 className="text-3xl font-bold glow-text-purple mb-2">Practice Test</h1>
            <p style={{ color: 'var(--text-secondary)' }}>25 random questions • No time limit</p>
          </div>

          <div className="space-y-4">
            <button onClick={() => startTest()} className="btn-primary w-full text-lg py-4">
              🎲 Random Test (All Categories)
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid var(--border)' }}></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>or pick a category</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(categories) as CategoryKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => startTest(key)}
                  className="card p-3 text-center hover:scale-[1.02] transition-transform"
                >
                  <span className="text-lg">{categories[key].icon}</span>
                  <div className="text-sm font-medium mt-1">{categories[key].name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {questions.filter(q => q.category === key).length} questions
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => router.push('/')} className="btn-secondary w-full">
            ← Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.push('/')} className="text-sm" style={{ color: 'var(--text-muted)' }}>
          ✕ Exit
        </button>
        <div className="text-sm font-medium">
          {currentIndex + 1} / {quizQuestions.length}
        </div>
        <div className="text-sm" style={{ color: 'var(--accent-cyan)' }}>
          {(() => {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
          })()}
        </div>
      </header>

      <div className="progress-bar mx-4 mt-2" style={{ height: '4px' }}>
        <div
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`, height: '100%' }}
        />
      </div>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="animate-fade-in" key={currentIndex}>
          {currentQuestion && (
            <>
              <div className="mb-3">
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: (categories[currentQuestion.category as CategoryKey]?.color || '#8b5cf6') + '20', color: categories[currentQuestion.category as CategoryKey]?.color || '#8b5cf6' }}
                >
                  {categories[currentQuestion.category as CategoryKey]?.icon} {categories[currentQuestion.category as CategoryKey]?.name}
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  let className = 'answer-option';
                  if (showResult) {
                    if (option.letter === currentQuestion.correct) className += ' correct';
                    else if (option.letter === selectedAnswer) className += ' incorrect';
                  } else if (option.letter === selectedAnswer) className += ' selected';

                  return (
                    <button
                      key={option.letter}
                      className={className}
                      onClick={() => handleSelectAnswer(option.letter)}
                      disabled={showResult}
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: showResult && option.letter === currentQuestion.correct ? 'var(--accent-green)' :
                            showResult && option.letter === selectedAnswer ? 'var(--accent-pink)' :
                            selectedAnswer === option.letter ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                          color: (showResult && option.letter === currentQuestion.correct) || selectedAnswer === option.letter ? 'white' : 'var(--text-secondary)'
                        }}
                      >
                        {option.letter}
                      </span>
                      <span className="text-left flex-1">{option.text}</span>
                      {showResult && option.letter === currentQuestion.correct && <span className="text-lg">✓</span>}
                      {showResult && option.letter === selectedAnswer && option.letter !== currentQuestion.correct && <span className="text-lg">✗</span>}
                    </button>
                  );
                })}
              </div>

              {showResult && currentQuestion.explanation && (
                <div className="mt-4 p-4 rounded-xl animate-slide-up" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-purple)' }}>💡 Explanation</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{currentQuestion.explanation}</div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        {!showResult ? (
          <button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="btn-primary w-full" style={{ opacity: selectedAnswer ? 1 : 0.5 }}>
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary w-full">
            {currentIndex < quizQuestions.length - 1 ? 'Next Question →' : 'See Results 🎉'}
          </button>
        )}
      </footer>
    </div>
  );
}