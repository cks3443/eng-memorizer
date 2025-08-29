import { NextApiRequest, NextApiResponse } from 'next';
import { updateSentencePair, deleteSentencePair, initializeDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase();
    
    const { id } = req.query;
    const sentenceId = parseInt(id as string);

    if (isNaN(sentenceId)) {
      return res.status(400).json({ error: 'Invalid sentence ID' });
    }

    switch (req.method) {
      case 'PUT':
        const { english, korean } = req.body;
        
        if (!english || !korean) {
          return res.status(400).json({ error: 'English and Korean sentences are required' });
        }

        const updatedSentence = await updateSentencePair(sentenceId, english, korean);
        res.status(200).json(updatedSentence);
        break;

      case 'DELETE':
        await deleteSentencePair(sentenceId);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
