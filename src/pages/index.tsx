import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import StudyInterface from '@/components/StudyInterface';
import { SentencePair } from '@/types';

const StudyPage: React.FC = () => {
  const [currentSentence, setCurrentSentence] = useState<SentencePair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextSentence = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/study/next');
      
      if (response.status === 404) {
        setError('No sentences available. Please add some sentences first.');
        setCurrentSentence(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch sentence');
      }
      
      const sentence = await response.json();
      setCurrentSentence(sentence);
    } catch (err) {
      setError('Error loading sentence. Please try again.');
      console.error('Error fetching sentence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (userInput: string, responseTime: number) => {
    if (!currentSentence) return;

    try {
      const response = await fetch('/api/study/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentencePairId: currentSentence.id,
          userInput,
          correctAnswer: currentSentence.english,
          responseTime
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const result = await response.json();
      console.log('Answer submitted:', result);
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const handleMarkMemorized = async () => {
    if (!currentSentence) return;

    try {
      const response = await fetch('/api/study/memorized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentencePairId: currentSentence.id })
      });

      if (!response.ok) {
        throw new Error('Failed to mark as memorized');
      }

      // Automatically move to next sentence after marking as memorized
      fetchNextSentence();
    } catch (err) {
      console.error('Error marking as memorized:', err);
    }
  };

  // Load first sentence on component mount
  useEffect(() => {
    fetchNextSentence();
  }, []);

  return (
    <>
      <Head>
        <title>Study - English Memorizer</title>
      </Head>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 English Study Session
          </h1>
          <p className="text-gray-600">
            Translate the Korean sentence into English
          </p>
        </div>

        {error ? (
          <div className="card text-center py-12">
            <div className="text-red-600 mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">{error}</h2>
            {error.includes('No sentences available') && (
              <div className="space-y-3">
                <p className="text-gray-600">Get started by adding your first sentence pair!</p>
                <a href="/sentences" className="btn-primary inline-block">
                  Add Sentences
                </a>
              </div>
            )}
            {!error.includes('No sentences available') && (
              <button 
                onClick={fetchNextSentence}
                className="btn-primary"
              >
                Try Again
              </button>
            )}
          </div>
        ) : isLoading ? (
          <div className="card text-center py-12">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <p className="text-gray-600">Loading sentence...</p>
          </div>
        ) : (
          <StudyInterface
            sentence={currentSentence}
            onSubmit={handleSubmitAnswer}
            onNext={fetchNextSentence}
            onMarkMemorized={handleMarkMemorized}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  );
};

export default StudyPage;
