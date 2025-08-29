import { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase, getDatabase } from '@/lib/database';
import { StudyStats } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase();
    const db = await getDatabase();

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Get total sentences
    const totalSentencesResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM sentence_pairs'
    );
    const totalSentences = totalSentencesResult?.count || 0;

    // Get memorized sentences
    const memorizedResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM memorization_records WHERE is_memorized = TRUE'
    );
    const memorizedSentences = memorizedResult?.count || 0;

    // Get average accuracy
    const accuracyResult = await db.get<{ avg_accuracy: number }>(
      `SELECT 
         AVG(CASE WHEN attempts > 0 THEN CAST(correct_attempts AS FLOAT) / attempts ELSE 0 END) as avg_accuracy
       FROM memorization_records WHERE attempts > 0`
    );
    const averageAccuracy = accuracyResult?.avg_accuracy || 0;

    // Get total study sessions and time
    const sessionResult = await db.get<{ total_sessions: number, total_time: number }>(
      `SELECT 
         COUNT(*) as total_sessions,
         COALESCE(SUM(avg_response_time * total_attempts), 0) as total_time
       FROM study_sessions WHERE ended_at IS NOT NULL`
    );
    const totalStudyTime = sessionResult?.total_time || 0;

    // Get last study date
    const lastStudyResult = await db.get<{ last_study: string }>(
      'SELECT MAX(last_attempt_at) as last_study FROM memorization_records'
    );
    const lastStudyDate = lastStudyResult?.last_study ? new Date(lastStudyResult.last_study) : undefined;

    // Calculate streak days (simplified - consecutive days with study activity)
    let streakDays = 0;
    if (lastStudyDate) {
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastStudyDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If studied within last 2 days, start counting streak
      if (diffDays <= 2) {
        const streakResult = await db.all<{ study_date: string }[]>(
          `SELECT DISTINCT DATE(last_attempt_at) as study_date 
           FROM memorization_records 
           WHERE last_attempt_at IS NOT NULL 
           ORDER BY study_date DESC LIMIT 30`
        );
        
        let currentDate = new Date();
        for (const row of streakResult) {
          const studyDate = new Date(row.study_date + 'T00:00:00');
          const dayDiff = Math.floor((currentDate.getTime() - studyDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff <= streakDays + 1) {
            streakDays++;
            currentDate = new Date(studyDate.getTime() - 24 * 60 * 60 * 1000);
          } else {
            break;
          }
        }
      }
    }

    const stats: StudyStats = {
      totalSentences,
      memorizedSentences,
      totalStudyTime: Math.round(totalStudyTime / 1000), // Convert to seconds
      averageAccuracy: Math.round(averageAccuracy * 100), // Convert to percentage
      streakDays,
      lastStudyDate
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
