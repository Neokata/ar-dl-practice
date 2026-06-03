'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRandomQuestions, getQuestionsByCategory, questions, categories, type Question, type CategoryKey } from '@/data/questions';
import { getProfile, saveProfile, updateStreak, calculateXP, checkAchievements, type TestResult } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { signQuestionVisuals } from '@/components/RoadSigns';

type QuizState = 'setup' | 'playing' | 'exiting';

export default function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as CategoryKey | null;

  const [state, setState] = useState<QuizState>('setup');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [questionCount, setQuestionCount] = useState(25);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Haptic feedback
  const vibrateWrong = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100);
  };
  const vibrateCorrect = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  };

  const startTest = useCallback((category?: CategoryKey, count?: number) => {
    const numQ = count || questionCount;
    const qs = category ? getQuestionsByCategory(category) : getRandomQuestions(numQ);
    const shuffled = [...qs].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled.slice(0, Math.min(numQ, shuffled.length)));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResult(false);
    setStartTime(Date.now());
    setState('playing');
  }, [questionCount]);

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
    if (selectedAnswer === currentQuestion?.correct) vibrateCorrect();
    else vibrateWrong();
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

  const handleExit = () => {
    if (Object.keys(answers).length > 0) setState('exiting');
    else router.push('/');
  };

  const finishTest = () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    let correct = 0;
    const categoryStats: Record<string, { correct: number; total: number }> = {};

    quizQuestions.forEach((q, i) => {
      if (!categoryStats[q.category]) categoryStats[q.category] = { correct: 0, total: 0 };
      categoryStats[q.category].total++;
      if (answers[i] === q.correct) { correct++; categoryStats[q.category].correct++; }
    });

    const total = quizQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    const xp = calculateXP(correct, total, duration);

    const result: TestResult = {
      id: generateId(), date: new Date().toISOString(),
      score: correct, total, percentage, duration, categories: categoryStats,
    };

    const profile = getProfile();
    profile.testHistory.push(result);
    profile.totalTests += 1;
    profile.xp += xp;
    updateStreak(profile);

    Object.entries(categoryStats).forEach(([cat, stats]) => {
      const pct = Math.round((stats.correct / stats.total) * 100);
      if (!profile.categoryBest[cat] || pct > profile.categoryBest[cat]) profile.categoryBest[cat] = pct;
    });

    const newAchievements = checkAchievements(profile, result);
    profile.achievements.push(...newAchievements);
    saveProfile(profile);

    sessionStorage.setItem('lastTest', JSON.stringify({
      questions: quizQuestions.map((q, i) => ({
        id: q.id, question: q.question, options: q.options, correct: q.correct,
        userAnswer: answers[i] || '', category: q.category, explanation: q.explanation,
      })),
      result, xp, newAchievements,
    }));

    router.push(`/results?${new URLSearchParams({
      score: correct.toString(), total: total.toString(), pct: percentage.toString(),
      xp: xp.toString(), time: duration.toString(), newAch: newAchievements.join(','),
    })}`);
  };

  if (state === 'setup') {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 animate-slide-up">
          <div className="text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h1 className="text-3xl font-bold glow-text-purple mb-2">Practice Test</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Random questions • No time limit</p>
          </div>

          <div className="card p-4">
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>How many questions?</div>
            <div className="flex gap-2">
              {[10, 15, 25].map((count) => (
                <button key={count} onClick={() => setQuestionCount(count)}
                  className="flex-1 py-3 rounded-xl text-lg font-bold transition-all"
                  style={{
                    background: questionCount === count ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' : 'var(--bg-secondary)',
                    color: questionCount === count ? 'white' : 'var(--text-muted)',
                    border: questionCount === count ? 'none' : '1px solid var(--border)',
                    boxShadow: questionCount === count ? '0 0 15px rgba(139,92,246,0.3)' : 'none',
                  }}>
                  {count}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              <span>Quick</span><span>Standard</span><span>Full</span>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={() => startTest()} className="btn-primary w-full text-lg py-4">
              🎲 Random Test (All Categories)
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid var(--border)' }} /></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>or pick a category</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(categories) as CategoryKey[]).map((key) => (
                <button key={key} onClick={() => startTest(key)} className="card p-3 text-center hover:scale-[1.02] transition-transform">
                  <span className="text-lg">{categories[key].icon}</span>
                  <div className="text-sm font-medium mt-1">{categories[key].name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{questions.filter(q => q.category === key).length} questions</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => router.push('/')} className="btn-secondary w-full">← Back Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {state === 'exiting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card p-6 max-w-sm w-full animate-slide-up" style={{ borderColor: 'var(--accent-pink)' }}>
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-xl font-bold mb-2">Leave Test?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                You&apos;ve answered {Object.keys(answers).length} of {quizQuestions.length} questions. Your progress will be lost.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setState('playing')} className="btn-secondary flex-1">Keep Going</button>
                <button onClick={() => router.push('/')} className="flex-1 py-3 px-4 rounded-xl font-bold text-white" style={{ background: 'var(--accent-pink)' }}>Leave</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={handleExit} className="text-sm" style={{ color: 'var(--text-muted)' }}>✕ Exit</button>
        <div className="text-sm font-medium">{currentIndex + 1} / {quizQuestions.length}</div>
        <div style={{ width: 40 }} /> {/* spacer for centering */}
      </header>

      <div className="progress-bar mx-4 mt-2" style={{ height: '4px' }}>
        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`, height: '100%' }} />
      </div>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="animate-fade-in" key={currentIndex}>
          {currentQuestion && (
            <>
              <div className="mb-3">
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: (categories[currentQuestion.category as CategoryKey]?.color || '#8b5cf6') + '20', color: categories[currentQuestion.category as CategoryKey]?.color || '#8b5cf6' }}>
                  {categories[currentQuestion.category as CategoryKey]?.icon} {categories[currentQuestion.category as CategoryKey]?.name}
                </span>
              </div>

              {/* Visual road sign for sign questions */}
              {currentQuestion && signQuestionVisuals[currentQuestion.id] && (
                <div className="flex justify-center mb-4">
                  {React.createElement(signQuestionVisuals[currentQuestion.id], { size: 90 })}
                </div>
              )}
              <h2 className="text-xl font-semibold mb-6 leading-relaxed">{currentQuestion.question}</h2>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  let className = 'answer-option';
                  if (showResult) {
                    if (option.letter === currentQuestion.correct) className += ' correct';
                    else if (option.letter === selectedAnswer) className += ' incorrect';
                  } else if (option.letter === selectedAnswer) className += ' selected';
                  return (
                    <button key={option.letter} className={className} onClick={() => handleSelectAnswer(option.letter)} disabled={showResult}>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: showResult && option.letter === currentQuestion.correct ? 'var(--accent-green)' :
                            showResult && option.letter === selectedAnswer ? 'var(--accent-pink)' :
                            selectedAnswer === option.letter ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                          color: (showResult && option.letter === currentQuestion.correct) || selectedAnswer === option.letter ? 'white' : 'var(--text-secondary)'
                        }}>
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
          <button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="btn-primary w-full" style={{ opacity: selectedAnswer ? 1 : 0.5 }}>Submit Answer</button>
        ) : (
          <button onClick={handleNext} className="btn-primary w-full">
            {currentIndex < quizQuestions.length - 1 ? 'Next Question →' : 'See Results 🎉'}
          </button>
        )}
      </footer>
    </div>
  );
}