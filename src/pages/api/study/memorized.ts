import { NextApiRequest, NextApiResponse } from 'next';
import { markAsMemorized, initializeDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase();

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { sentencePairId } = req.body;
    
    if (!sentencePairId) {
      return res.status(400).json({ error: 'Sentence pair ID is required' });
    }

    const updatedRecord = await markAsMemorized(sentencePairId);
    
    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
