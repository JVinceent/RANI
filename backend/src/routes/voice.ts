import { Router } from 'express';
import multer = require('multer');

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('audio') as any, async (req, res) => {
  try {
    // Grabs the file from the incoming request
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Received audio file:', audioFile.originalname);
    console.log('📦 File size:', audioFile.size, 'bytes');

    // Sends a temporary success response back to the frontend
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