export interface SentencePair {
  id: number;
  english: string;
  korean: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorizationRecord {
  id: number;
  sentencePairId: number;
  attempts: number;
  correctAttempts: number;
  lastAttemptAt: Date;
  isMemorized: boolean;
  memorizedAt?: Date;
  exposureCount: number;
  difficultyScore: number; // 0-1, higher = more difficult
}

export interface StudySession {
  id: number;
  startedAt: Date;
  endedAt?: Date;
  totalAttempts: number;
  correctAttempts: number;
  sentencesStudied: number;
  avgResponseTime: number;
}

export interface StudyStats {
  totalSentences: number;
  memorizedSentences: number;
  totalStudyTime: number;
  averageAccuracy: number;
  streakDays: number;
  lastStudyDate?: Date;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  preferredLanguage: 'ko' | 'en';
  timezone: string;
  dailyGoal: number; // target sentences per day
  reminderEnabled: boolean;
  reminderTime?: string; // HH:MM format
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
