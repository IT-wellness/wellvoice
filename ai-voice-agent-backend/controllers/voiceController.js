// import transcribeAudio from '../services/whisperService.js';
// import generateResponse from '../services/llmService.js';
// import synthesizeSpeech from '../services/ttsService.js';

// const handleVoiceFlow = async (req, res) => {
//     try {
//         const filePath = req.file.path;
//         // const filePath = 'E:\\WellVoice\\ai-voice-agent-backend\\uploads\\ElevenLabs_2025-06-30T12_16_02_Mark - Natural Conversations_pvc_sp94_s37_sb75_v3.wav';
//         const transcription = await transcribeAudio(filePath);
//         console.log("Message: ", transcription);
//         const gptResponse = await generateResponse(transcription);
//         const audioBuffer = await synthesizeSpeech(gptResponse);

//         res.set({
//             'Content-Type': 'audio/mpeg',
//             'Content-Disposition': 'inline; filename=response.mp3',
//         });
//         res.send(audioBuffer);
//     } catch (error) {
//         console.error('Error in voice flow:', error);
//         res.status(500).json({ error: 'Voice flow failed.' });
// }
// };

// export default handleVoiceFlow;
import { transcribeAudio } from '../services/whisperService.js';
import askAssistant from '../services/assistantService.js';
import { synthesizeSpeech } from '../services/ttsService.js';

const handleVoiceFlow = async (req, res) => {
  try {
    const userText = await transcribeAudio(req.file.path);
    console.log('📝 STT:', userText);
    const { thread_id: incomingThread } = req.body;      // <— from frontend

    const { replyText, threadId } = await askAssistant(userText, incomingThread);
    console.log('🤖 Assistant:', replyText);

    const audioBuffer = await synthesizeSpeech(replyText);

    res
      .set({
        "Content-Type": "audio/mpeg",
        "Thread-Id": threadId,                           // <— expose to frontend
      })
      .send(audioBuffer);
  } catch (err) {
    console.error("Voice flow error:", err);
    res.status(500).json({ error: "Voice agent failed." });
  }
};

export default handleVoiceFlow;