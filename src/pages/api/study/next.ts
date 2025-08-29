import { NextApiRequest, NextApiResponse } from 'next';
import { getNextSentenceToStudy, initializeDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase();

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const sentence = await getNextSentenceToStudy();
    
    if (!sentence) {
      return res.status(404).json({ error: 'No sentences available for study' });
    }

    res.status(200).json(sentence);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
