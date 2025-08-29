import React from 'react';
import { SentencePair } from '@/types';

interface SentenceCardProps {
  sentence: SentencePair;
  onEdit?: (sentence: SentencePair) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

const SentenceCard: React.FC<SentenceCardProps> = ({ 
  sentence, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">English</label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-lg text-gray-900">{sentence.english}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Korean</label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-lg text-gray-900">{sentence.korean}</p>
          </div>
        </div>
        
        {showActions && (
          <div className="flex justify-end space-x-2 pt-2">
            {onEdit && (
              <button
                onClick={() => onEdit(sentence)}
                className="btn-secondary text-sm"
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(sentence.id)}
                className="btn-danger text-sm"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentenceCard;
