// Import required modules
import express from 'express';

// Middleware for handling file uploads
import upload from '../middlewares/multerConfig.js';

// Controller function for handling voice interactions
import handleVoiceFlow from '../controllers/voiceController.js';

// Create Express Router instance
const router = express.Router();

/**
 * @route   POST /api/voice/process
 * @desc    Handles uploaded audio file, processes it through AI pipeline, and responds with audio buffer.
 * @access  Public
 * 
 * Middleware Chain:
 * - `upload.single('audio')` handles file upload, expecting field named "audio".
 * - `handleVoiceFlow` performs AI processing and response.
 */
router.post('/process', upload.single('audio'), async (req, res, next) => {
  try {
    await handleVoiceFlow(req, res);
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
});

export default router;