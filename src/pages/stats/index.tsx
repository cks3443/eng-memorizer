import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { StudyStats } from '@/types';

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Error loading statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date?: Date): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Statistics - English Memorizer</title>
        </Head>
        <div className="card text-center py-12">
          <div className="animate-spin text-4xl mb-4">📊</div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Statistics - English Memorizer</title>
        </Head>
        <div className="card text-center py-12">
          <div className="text-red-600 mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">{error}</h2>
          <button onClick={fetchStats} className="btn-primary">
            Try Again
          </button>
        </div>
      </>
    );
  }

  if (!stats) return null;

  const progressPercentage = stats.totalSentences > 0 
    ? Math.round((stats.memorizedSentences / stats.totalSentences) * 100)
    : 0;

  return (
    <>
      <Head>
        <title>Statistics - English Memorizer</title>
      </Head>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Study Statistics
          </h1>
          <p className="text-gray-600">
            Track your progress and memorization achievements
          </p>
        </div>

        {/* Progress Overview */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Progress Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Memorization Progress</span>
                <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{stats.memorizedSentences} memorized</span>
                <span>{stats.totalSentences} total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalSentences}</div>
            <div className="text-sm text-gray-600">Total Sentences</div>
          </div>

          <div className="card text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">{stats.memorizedSentences}</div>
            <div className="text-sm text-gray-600">Memorized</div>
          </div>

          <div className="card text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-purple-600">{stats.averageAccuracy}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>

          <div className="card text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-600">{stats.streakDays}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⏱️ Study Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Study Time</span>
                <span className="font-medium">{formatTime(stats.totalStudyTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Study Session</span>
                <span className="font-medium">{formatDate(stats.lastStudyDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Streak</span>
                <span className="font-medium flex items-center">
                  {stats.streakDays} days
                  {stats.streakDays > 0 && <span className="ml-1">🔥</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.totalSentences >= 10 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-sm font-medium text-blue-800">Collector</div>
                  <div className="text-xs text-blue-600">10+ sentences</div>
                </div>
              )}
              
              {stats.memorizedSentences >= 5 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🧠</div>
                  <div className="text-sm font-medium text-green-800">Memorizer</div>
                  <div className="text-xs text-green-600">5+ memorized</div>
                </div>
              )}
              
              {stats.averageAccuracy >= 80 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-sm font-medium text-purple-800">Accurate</div>
                  <div className="text-xs text-purple-600">80%+ accuracy</div>
                </div>
              )}
              
              {stats.streakDays >= 7 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-sm font-medium text-orange-800">Consistent</div>
                  <div className="text-xs text-orange-600">7-day streak</div>
                </div>
              )}
            </div>
            
            {stats.totalSentences < 10 && stats.memorizedSentences < 5 && 
             stats.averageAccuracy < 80 && stats.streakDays < 7 && (
              <div className="text-center text-gray-500 py-4">
                <div className="text-3xl mb-2">🏁</div>
                <p className="text-sm">Keep studying to unlock achievements!</p>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Messages */}
        {stats.totalSentences === 0 ? (
          <div className="card text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Start Learning?</h3>
            <p className="text-gray-600 mb-4">Add your first sentence pair to begin your memorization journey!</p>
            <a href="/sentences" className="btn-primary">
              Add Your First Sentence
            </a>
          </div>
        ) : progressPercentage === 100 ? (
          <div className="card text-center py-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Congratulations!</h3>
            <p className="text-gray-600 mb-4">You've memorized all your sentences! Add more to continue learning.</p>
            <a href="/sentences" className="btn-success">
              Add More Sentences
            </a>
          </div>
        ) : (
          <div className="card text-center py-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Keep Going!</h3>
            <p className="text-gray-600 mb-4">
              You're {progressPercentage}% of the way to memorizing all sentences. 
              {stats.streakDays > 0 ? ` Your ${stats.streakDays}-day streak is impressive!` : ' Start a streak today!'}
            </p>
            <a href="/" className="btn-primary">
              Continue Studying
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default StatsPage;
