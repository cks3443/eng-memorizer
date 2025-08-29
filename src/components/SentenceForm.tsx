import React, { useState } from 'react';
import { SentencePair } from '@/types';

interface SentenceFormProps {
  sentence?: SentencePair;
  onSubmit: (english: string, korean: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SentenceForm: React.FC<SentenceFormProps> = ({
  sentence,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [english, setEnglish] = useState(sentence?.english || '');
  const [korean, setKorean] = useState(sentence?.korean || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (english.trim() && korean.trim()) {
      onSubmit(english.trim(), korean.trim());
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">
        {sentence ? 'Edit Sentence' : 'Add New Sentence'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="english" className="block text-sm font-medium text-gray-700 mb-2">
            English Sentence
          </label>
          <textarea
            id="english"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="Enter the English sentence..."
            className="textarea-large"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="korean" className="block text-sm font-medium text-gray-700 mb-2">
            Korean Translation
          </label>
          <textarea
            id="korean"
            value={korean}
            onChange={(e) => setKorean(e.target.value)}
            placeholder="Enter the Korean translation..."
            className="textarea-large"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !english.trim() || !korean.trim()}
          >
            {isLoading ? 'Saving...' : sentence ? 'Update' : 'Add'} Sentence
          </button>
        </div>
      </form>
    </div>
  );
};

export default SentenceForm;
