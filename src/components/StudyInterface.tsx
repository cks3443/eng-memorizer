import React, { useState, useEffect, useRef } from 'react';
import { SentencePair } from '@/types';

interface StudyInterfaceProps {
  sentence: SentencePair | null;
  onSubmit: (userInput: string, responseTime: number) => void;
  onNext: () => void;
  onMarkMemorized: () => void;
  isLoading?: boolean;
}

const StudyInterface: React.FC<StudyInterfaceProps> = ({
  sentence,
  onSubmit,
  onNext,
  onMarkMemorized,
  isLoading = false
}) => {
  const [userInput, setUserInput] = useState('');
  const [showEnglish, setShowEnglish] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when sentence changes
  useEffect(() => {
    if (sentence) {
      setUserInput('');
      setShowEnglish(false);
      setHasSubmitted(false);
      setStartTime(Date.now());
      textareaRef.current?.focus();
    }
  }, [sentence?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter: Submit answer
      if (e.ctrlKey && e.key === 'Enter' && !hasSubmitted && userInput.trim()) {
        e.preventDefault();
        handleSubmit();
      }
      // Ctrl+Space: Show English sentence
      else if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        setShowEnglish(true);
      }
      // Ctrl+N: Next sentence
      else if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNext();
      }
      // Ctrl+M: Mark as memorized
      else if (e.ctrlKey && e.key === 'm' && hasSubmitted) {
        e.preventDefault();
        onMarkMemorized();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [userInput, hasSubmitted, showEnglish]);

  const handleSubmit = () => {
    if (!userInput.trim() || hasSubmitted || !sentence) return;
    
    const responseTime = Date.now() - startTime;
    onSubmit(userInput.trim(), responseTime);
    setHasSubmitted(true);
    setShowEnglish(true);
  };

  const handleNext = () => {
    onNext();
  };

  const checkAccuracy = (): boolean => {
    if (!sentence || !userInput.trim()) return false;
    
    const normalizeText = (text: string) => 
      text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    
    const userNormalized = normalizeText(userInput);
    const correctNormalized = normalizeText(sentence.english);
    
    return userNormalized === correctNormalized;
  };

  if (!sentence) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">No sentences available. Please add some sentences first.</p>
      </div>
    );
  }

  const isCorrect = hasSubmitted ? checkAccuracy() : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Korean sentence display */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Korean Sentence</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-2xl text-blue-900 font-medium leading-relaxed">
            {sentence.korean}
          </p>
        </div>
      </div>

      {/* User input area */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Your English Translation</h2>
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your English translation here..."
          className={`textarea-large ${
            hasSubmitted
              ? isCorrect
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
              : ''
          }`}
          disabled={hasSubmitted || isLoading}
        />
        
        {!hasSubmitted && (
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Shortcuts:</span> Ctrl+Enter to submit, Ctrl+Space to show answer
            </div>
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim() || isLoading}
              className="btn-primary"
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>

      {/* Show English sentence after submission or when revealed */}
      {showEnglish && (
        <div className="card animate-fade-in">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Correct English Sentence</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-2xl text-gray-900 font-medium leading-relaxed">
              {sentence.english}
            </p>
          </div>
          
          {hasSubmitted && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                  <span className="font-medium">
                    {isCorrect ? 'Correct!' : 'Not quite right'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={onMarkMemorized}
                  className="btn-success"
                  title="Ctrl+M"
                >
                  ✓ Memorized
                </button>
                <button
                  onClick={handleNext}
                  className="btn-primary"
                  title="Ctrl+N"
                >
                  Next Sentence →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="text-center text-sm text-gray-500 bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Ctrl + Enter:</span> Submit Answer
          </div>
          <div>
            <span className="font-medium">Ctrl + Space:</span> Show English
          </div>
          <div>
            <span className="font-medium">Ctrl + N:</span> Next Sentence
          </div>
        </div>
        {hasSubmitted && (
          <div className="mt-2">
            <span className="font-medium">Ctrl + M:</span> Mark as Memorized
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyInterface;
