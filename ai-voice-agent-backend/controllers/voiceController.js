import { transcribeAudio } from '../services/whisperService.js';
import askAssistant from '../services/assistantService.js';
import { synthesizeSpeech } from '../services/ttsService.js';

const handleVoiceFlow = async (req, res) => {
  try {
    const userText = await transcribeAudio(req.file.path);
    console.log('📝 STT:', userText);
    const { thread_id: incomingThread } = req.body;

    const { replyText, threadId } = await askAssistant(userText, incomingThread);
    console.log('🤖 Assistant:', replyText);

    const audioBuffer = await synthesizeSpeech(replyText);

    res
      .set({
        "Content-Type": "audio/mpeg",
        "Thread-Id": threadId,
      })
      .send(audioBuffer);
  } catch (err) {
    console.error("Voice flow error:", err);
    res.status(500).json({ error: "Voice agent failed." });
  }
};

export default handleVoiceFlow;