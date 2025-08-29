import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { SentencePair, MemorizationRecord, StudySession } from '@/types';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function initializeDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (db) return db;

  db = await open({
    filename: './memorizer.db',
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sentence_pairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      english TEXT NOT NULL,
      korean TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS memorization_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sentence_pair_id INTEGER NOT NULL,
      attempts INTEGER DEFAULT 0,
      correct_attempts INTEGER DEFAULT 0,
      last_attempt_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_memorized BOOLEAN DEFAULT FALSE,
      memorized_at DATETIME,
      exposure_count INTEGER DEFAULT 0,
      difficulty_score REAL DEFAULT 0.5,
      FOREIGN KEY (sentence_pair_id) REFERENCES sentence_pairs (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      total_attempts INTEGER DEFAULT 0,
      correct_attempts INTEGER DEFAULT 0,
      sentences_studied INTEGER DEFAULT 0,
      avg_response_time REAL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_memorization_sentence_pair ON memorization_records(sentence_pair_id);
    CREATE INDEX IF NOT EXISTS idx_difficulty_score ON memorization_records(difficulty_score);
  `);

  return db;
}

export async function getDatabase() {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
}

// Sentence Pair CRUD operations
export async function createSentencePair(english: string, korean: string): Promise<SentencePair> {
  const database = await getDatabase();
  const result = await database.run(
    'INSERT INTO sentence_pairs (english, korean) VALUES (?, ?)',
    [english, korean]
  );
  
  const sentencePair = await database.get<SentencePair>(
    'SELECT * FROM sentence_pairs WHERE id = ?',
    [result.lastID]
  );
  
  if (!sentencePair) throw new Error('Failed to create sentence pair');
  return sentencePair;
}

export async function getAllSentencePairs(): Promise<SentencePair[]> {
  const database = await getDatabase();
  return database.all<SentencePair[]>('SELECT * FROM sentence_pairs ORDER BY created_at DESC');
}

export async function updateSentencePair(id: number, english: string, korean: string): Promise<SentencePair> {
  const database = await getDatabase();
  await database.run(
    'UPDATE sentence_pairs SET english = ?, korean = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [english, korean, id]
  );
  
  const sentencePair = await database.get<SentencePair>(
    'SELECT * FROM sentence_pairs WHERE id = ?',
    [id]
  );
  
  if (!sentencePair) throw new Error('Sentence pair not found');
  return sentencePair;
}

export async function deleteSentencePair(id: number): Promise<void> {
  const database = await getDatabase();
  await database.run('DELETE FROM sentence_pairs WHERE id = ?', [id]);
}

// Memorization Record operations
export async function getOrCreateMemorizationRecord(sentencePairId: number): Promise<MemorizationRecord> {
  const database = await getDatabase();
  let record = await database.get<MemorizationRecord>(
    'SELECT * FROM memorization_records WHERE sentence_pair_id = ?',
    [sentencePairId]
  );
  
  if (!record) {
    const result = await database.run(
      'INSERT INTO memorization_records (sentence_pair_id) VALUES (?)',
      [sentencePairId]
    );
    record = await database.get<MemorizationRecord>(
      'SELECT * FROM memorization_records WHERE id = ?',
      [result.lastID]
    );
  }
  
  if (!record) throw new Error('Failed to get or create memorization record');
  return record;
}

export async function updateMemorizationRecord(
  sentencePairId: number, 
  isCorrect: boolean, 
  responseTime: number
): Promise<MemorizationRecord> {
  const database = await getDatabase();
  const record = await getOrCreateMemorizationRecord(sentencePairId);
  
  const newAttempts = record.attempts + 1;
  const newCorrectAttempts = record.correctAttempts + (isCorrect ? 1 : 0);
  const newExposureCount = record.exposureCount + 1;
  
  // Calculate difficulty score based on accuracy and response time
  const accuracy = newCorrectAttempts / newAttempts;
  const timeScore = Math.min(responseTime / 30000, 1); // Normalize to 30 seconds
  const difficultyScore = 1 - (accuracy * 0.7 + (1 - timeScore) * 0.3);
  
  await database.run(`
    UPDATE memorization_records 
    SET attempts = ?, correct_attempts = ?, last_attempt_at = CURRENT_TIMESTAMP,
        exposure_count = ?, difficulty_score = ?
    WHERE sentence_pair_id = ?
  `, [newAttempts, newCorrectAttempts, newExposureCount, difficultyScore, sentencePairId]);
  
  const updatedRecord = await database.get<MemorizationRecord>(
    'SELECT * FROM memorization_records WHERE sentence_pair_id = ?',
    [sentencePairId]
  );
  
  if (!updatedRecord) throw new Error('Failed to update memorization record');
  return updatedRecord;
}

export async function markAsMemorized(sentencePairId: number): Promise<MemorizationRecord> {
  const database = await getDatabase();
  await database.run(`
    UPDATE memorization_records 
    SET is_memorized = TRUE, memorized_at = CURRENT_TIMESTAMP, difficulty_score = 0.1
    WHERE sentence_pair_id = ?
  `, [sentencePairId]);
  
  const record = await database.get<MemorizationRecord>(
    'SELECT * FROM memorization_records WHERE sentence_pair_id = ?',
    [sentencePairId]
  );
  
  if (!record) throw new Error('Failed to mark as memorized');
  return record;
}

// Smart recommendation algorithm
export async function getNextSentenceToStudy(): Promise<SentencePair | null> {
  const database = await getDatabase();
  
  // Get sentences with their memorization records, prioritizing by difficulty and recency
  const sentences = await database.all<(SentencePair & { 
    difficulty_score: number; 
    exposure_count: number; 
    is_memorized: boolean;
    last_attempt_at: string;
  })[]>(`
    SELECT sp.*, 
           COALESCE(mr.difficulty_score, 0.8) as difficulty_score,
           COALESCE(mr.exposure_count, 0) as exposure_count,
           COALESCE(mr.is_memorized, FALSE) as is_memorized,
           COALESCE(mr.last_attempt_at, '1970-01-01') as last_attempt_at
    FROM sentence_pairs sp
    LEFT JOIN memorization_records mr ON sp.id = mr.sentence_pair_id
    ORDER BY 
      -- Prioritize non-memorized sentences
      CASE WHEN mr.is_memorized THEN 1 ELSE 0 END,
      -- Then by difficulty (harder sentences more often)
      mr.difficulty_score DESC,
      -- Then by how long ago they were attempted
      CASE WHEN mr.last_attempt_at IS NULL THEN 0 ELSE julianday('now') - julianday(mr.last_attempt_at) END DESC,
      -- Finally random for variety
      RANDOM()
    LIMIT 1
  `);
  
  return sentences.length > 0 ? sentences[0] : null;
}
