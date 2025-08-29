import { NextApiRequest, NextApiResponse } from 'next';
import { updateMemorizationRecord, initializeDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase();

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { sentencePairId, userInput, correctAnswer, responseTime } = req.body;
    
    if (!sentencePairId || userInput === undefined || !correctAnswer || !responseTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if answer is correct (normalize text for comparison)
    const normalizeText = (text: string) => 
      text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    
    const isCorrect = normalizeText(userInput) === normalizeText(correctAnswer);
    
    const updatedRecord = await updateMemorizationRecord(sentencePairId, isCorrect, responseTime);
    
    res.status(200).json({
      isCorrect,
      record: updatedRecord
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
