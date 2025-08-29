import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import SentenceCard from '@/components/SentenceCard';
import SentenceForm from '@/components/SentenceForm';
import { SentencePair } from '@/types';

const SentencesPage: React.FC = () => {
  const [sentences, setSentences] = useState<SentencePair[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSentence, setEditingSentence] = useState<SentencePair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSentences = async () => {
    try {
      const response = await fetch('/api/sentences');
      if (!response.ok) throw new Error('Failed to fetch sentences');
      const data = await response.json();
      setSentences(data);
    } catch (err) {
      setError('Error loading sentences');
      console.error('Error fetching sentences:', err);
    }
  };

  const handleAddSentence = async (english: string, korean: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english, korean })
      });

      if (!response.ok) throw new Error('Failed to add sentence');
      
      await fetchSentences();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Error adding sentence');
      console.error('Error adding sentence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSentence = async (english: string, korean: string) => {
    if (!editingSentence) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sentences/${editingSentence.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english, korean })
      });

      if (!response.ok) throw new Error('Failed to update sentence');
      
      await fetchSentences();
      setEditingSentence(null);
      setError(null);
    } catch (err) {
      setError('Error updating sentence');
      console.error('Error updating sentence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSentence = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sentence?')) return;

    try {
      const response = await fetch(`/api/sentences/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete sentence');
      
      await fetchSentences();
      setError(null);
    } catch (err) {
      setError('Error deleting sentence');
      console.error('Error deleting sentence:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSentence(null);
  };

  useEffect(() => {
    fetchSentences();
  }, []);

  return (
    <>
      <Head>
        <title>Sentences - English Memorizer</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📝 Sentence Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your English-Korean sentence pairs for memorization
            </p>
          </div>
          
          {!showForm && !editingSentence && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              ➕ Add New Sentence
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {(showForm || editingSentence) && (
          <SentenceForm
            sentence={editingSentence || undefined}
            onSubmit={editingSentence ? handleEditSentence : handleAddSentence}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        <div className="space-y-4">
          {sentences.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-gray-400 mb-4">
                <span className="text-6xl">📝</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No sentences yet</h2>
              <p className="text-gray-500 mb-4">
                Add your first English-Korean sentence pair to get started
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Add First Sentence
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">
                  All Sentences ({sentences.length})
                </h2>
              </div>
              
              <div className="grid gap-4">
                {sentences.map((sentence) => (
                  <SentenceCard
                    key={sentence.id}
                    sentence={sentence}
                    onEdit={setEditingSentence}
                    onDelete={handleDeleteSentence}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SentencesPage;
