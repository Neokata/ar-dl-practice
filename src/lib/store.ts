// Gamification & state management using localStorage
// Levels: Learner → Student Driver → Road Ready → License Ready → Licensed

export interface TestResult {
  id: string;
  date: string;
  score: number;
  total: number;
  percentage: number;
  duration: number; // seconds
  categories: Record<string, { correct: number; total: number }>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const LEVELS = [
  { name: 'Learner', xpRequired: 0, icon: '🚗', color: '#94a3b8' },
  { name: 'Student Driver', xpRequired: 500, icon: '🏎️', color: '#3b82f6' },
  { name: 'Road Ready', xpRequired: 1500, icon: '🏁', color: '#8b5cf6' },
  { name: 'License Ready', xpRequired: 3500, icon: '⭐', color: '#f59e0b' },
  { name: 'Licensed', xpRequired: 6000, icon: '🏅', color: '#10b981' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_test', name: 'First Steps', description: 'Complete your first practice test', icon: '🎯' },
  { id: 'perfect_score', name: 'Ace Driver', description: 'Score 100% on a test', icon: '💎' },
  { id: 'streak_3', name: 'On Fire', description: '3-day practice streak', icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day practice streak', icon: '⚔️' },
  { id: 'streak_14', name: 'Unstoppable', description: '14-day practice streak', icon: '💪' },
  { id: 'streak_30', name: 'Dedication', description: '30-day practice streak', icon: '👑' },
  { id: 'tests_5', name: 'Getting Serious', description: 'Complete 5 practice tests', icon: '📚' },
  { id: 'tests_10', name: 'Scholar', description: 'Complete 10 practice tests', icon: '🎓' },
  { id: 'tests_25', name: 'Veteran', description: 'Complete 25 practice tests', icon: '🏆' },
  { id: 'pass_5', name: 'Consistent', description: 'Pass 5 tests in a row (≥80%)', icon: '✅' },
  { id: 'pass_10', name: 'Reliable', description: 'Pass 10 tests in a row (≥80%)', icon: '🛡️' },
  { id: 'score_90', name: 'Sharp', description: 'Score 90% or above on a test', icon: '🧠' },
  { id: 'all_categories', name: 'Well Rounded', description: 'Score 80%+ in every category', icon: '🌟' },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a test after 10 PM', icon: '🦉' },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a test before 7 AM', icon: '🐦' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a test in under 5 minutes', icon: '⚡' },
];

export interface UserProfile {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastPracticeDate: string;
  totalTests: number;
  achievements: string[];
  testHistory: TestResult[];
  categoryBest: Record<string, number>; // category -> best percentage
}

const STORAGE_KEY = 'ar-dl-practice';

function getDefaultProfile(): UserProfile {
  return {
    xp: 0,
    level: 0,
    streak: 0,
    longestStreak: 0,
    lastPracticeDate: '',
    totalTests: 0,
    achievements: [],
    testHistory: [],
    categoryBest: {},
  };
}

export function getProfile(): UserProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getDefaultProfile();
  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultProfile();
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getCurrentLevel(xp: number) {
  let levelIndex = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      levelIndex = i;
      break;
    }
  }
  return {
    level: LEVELS[levelIndex],
    levelIndex,
    xpInLevel: xp - LEVELS[levelIndex].xpRequired,
    xpForNextLevel: levelIndex < LEVELS.length - 1
      ? LEVELS[levelIndex + 1].xpRequired - LEVELS[levelIndex].xpRequired
      : Infinity,
  };
}

export function calculateXP(score: number, total: number, duration: number): number {
  const baseXP = score * 10; // 10 XP per correct answer
  const bonus = score === total ? 50 : 0; // Perfect score bonus
  const speedBonus = duration < 300 ? 20 : 0; // Under 5 min bonus
  const percentage = score / total;
  const percentageBonus = percentage >= 0.9 ? 30 : percentage >= 0.8 ? 15 : 0;
  return baseXP + bonus + speedBonus + percentageBonus;
}

export function checkAchievements(profile: UserProfile, testResult?: TestResult): string[] {
  const newAchievements: string[] = [];
  const earned = new Set(profile.achievements);

  const earn = (id: string) => {
    if (!earned.has(id)) {
      newAchievements.push(id);
    }
  };

  // First test
  if (profile.totalTests >= 1) earn('first_test');

  // Perfect score
  if (testResult && testResult.score === testResult.total) earn('perfect_score');

  // Streak achievements
  if (profile.streak >= 3) earn('streak_3');
  if (profile.streak >= 7) earn('streak_7');
  if (profile.streak >= 14) earn('streak_14');
  if (profile.streak >= 30) earn('streak_30');

  // Test count
  if (profile.totalTests >= 5) earn('tests_5');
  if (profile.totalTests >= 10) earn('tests_10');
  if (profile.totalTests >= 25) earn('tests_25');

  // Consecutive passes
  const recentResults = profile.testHistory.slice(-5);
  if (recentResults.length >= 5 && recentResults.every(r => r.percentage >= 80)) earn('pass_5');
  const recentResults10 = profile.testHistory.slice(-10);
  if (recentResults10.length >= 10 && recentResults10.every(r => r.percentage >= 80)) earn('pass_10');

  // High score
  if (testResult && testResult.percentage >= 90) earn('score_90');

  // All categories
  const allCategories = Object.values(profile.categoryBest);
  if (Object.keys(profile.categoryBest).length >= 8 && allCategories.every(p => p >= 80)) earn('all_categories');

  // Time of day
  if (testResult) {
    const hour = new Date(testResult.date).getHours();
    if (hour >= 22 || hour < 5) earn('night_owl');
    if (hour >= 5 && hour < 7) earn('early_bird');
    if (testResult.duration < 300) earn('speed_demon');
  }

  return newAchievements;
}

export function updateStreak(profile: UserProfile): UserProfile {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (profile.lastPracticeDate === today) {
    // Already practiced today, no change
    return profile;
  } else if (profile.lastPracticeDate === yesterday) {
    // Consecutive day
    profile.streak += 1;
  } else {
    // Streak broken
    profile.streak = 1;
  }

  profile.longestStreak = Math.max(profile.longestStreak, profile.streak);
  profile.lastPracticeDate = today;
  return profile;
}