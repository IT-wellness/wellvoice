import express from 'express';
import upload from '../middlewares/multerConfig.js';
import handleVoiceFlow from '../controllers/voiceController.js';

const router = express.Router();

router.post('/process', upload.single('audio'), handleVoiceFlow);
// router.post('/process', handleVoiceFlow);

export default router;