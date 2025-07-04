// Import transcription service (Speech-to-Text)
import { transcribeAudio } from '../services/whisperService.js';

// Import assistant service (LLM-based conversation handler)
import askAssistant from '../services/assistantService.js';

// Import TTS service (Text-to-Speech)
import { synthesizeSpeech } from '../services/ttsService.js';

/**
 * Controller: handleVoiceFlow
 * ----------------------------
 * Handles the complete AI voice interaction:
 *  1. Transcribe uploaded audio using Whisper.
 *  2. Send transcript to assistant and get a response.
 *  3. Convert assistant reply to speech (TTS).
 *  4. Return audio buffer + thread ID.
 *
 * @param {import('express').Request} req - Express request (expects file and optional thread_id in body)
 * @param {import('express').Response} res - Express response
 */
const handleVoiceFlow = async (req, res) => {
  try {
    // ✅ Step 0: Validate input
    if (!req.file?.path) {
      console.warn("⚠️  Missing or invalid audio file in request.");
      return res.status(400).json({ error: "Audio file is required." });
    }

    // ✅ Step 1: Transcribe audio file to text using Whisper
    const userText = await transcribeAudio(req.file.path);
    console.log('📝 Transcribed text:', userText);

    if (!userText?.trim()) {
      console.warn("⚠️  Empty transcription result.");
      return res.status(422).json({ error: "Unable to transcribe the audio." });
    }

    // ✅ Step 2: Extract optional thread ID from body
    const { thread_id: incomingThread } = req.body;

    // ✅ Step 3: Get AI assistant response from conversation service
    const { replyText, threadId } = await askAssistant(userText, incomingThread);
    console.log('🤖 Assistant response:', replyText);

    if (!replyText?.trim()) {
      console.error("⚠️  Assistant returned empty response.");
      return res.status(502).json({ error: "Assistant did not provide a response." });
    }

    // ✅ Step 4: Convert reply text into audio using OpenAI TTS
    const audioBuffer = await synthesizeSpeech(replyText);

    if (!audioBuffer || !Buffer.isBuffer(audioBuffer)) {
      console.error("❌ Failed to synthesize speech.");
      return res.status(500).json({ error: "Unable to generate speech audio." });
    }

    // ✅ Step 5: Send back synthesized audio and thread ID in header
    res
      .set({
        'Content-Type': 'audio/mpeg',
        'Thread-Id': threadId || '',
      })
      .send(audioBuffer);

  } catch (err) {
    // 🔥 Global error handler
    console.error("🔥 Voice interaction pipeline failed:", err?.stack || err.message);
    res.status(500).json({ error: "Voice agent encountered an unexpected error." });
  }
};

export default handleVoiceFlow;