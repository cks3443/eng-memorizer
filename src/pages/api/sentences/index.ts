import { NextApiRequest, NextApiResponse } from 'next';
import { createSentencePair, getAllSentencePairs, initializeDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase();

    switch (req.method) {
      case 'GET':
        const sentences = await getAllSentencePairs();
        res.status(200).json(sentences);
        break;

      case 'POST':
        const { english, korean } = req.body;
        
        if (!english || !korean) {
          return res.status(400).json({ error: 'English and Korean sentences are required' });
        }

        const newSentence = await createSentencePair(english, korean);
        res.status(201).json(newSentence);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
