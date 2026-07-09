import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// @ts-ignore - for TypeScript to ignore the middleware type mismatch
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Received audio file:', audioFile.originalname);
    console.log('📦 File size:', audioFile.size, 'bytes');

    res.json({ 
      success: true, 
      userTranscription: "Testing, testing, 1 2 3!", 
      raniReply: "Loud and clear! I caught your audio file." 
    });

  } catch (error) {
    console.error('Error processing voice upload:', error);
    res.status(500).json({ error: 'Internal server error processing voice' });
  }
});

export default router;