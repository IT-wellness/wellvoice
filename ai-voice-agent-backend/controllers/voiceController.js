import transcribeAudio from '../services/whisperService.js';
import generateResponse from '../services/llmService.js';
import synthesizeSpeech from '../services/ttsService.js';

const handleVoiceFlow = async (req, res) => {
    try {
        const filePath = req.file.path;
        // const filePath = 'E:\\WellVoice\\ai-voice-agent-backend\\uploads\\ElevenLabs_2025-06-30T12_16_02_Mark - Natural Conversations_pvc_sp94_s37_sb75_v3.wav';
        const transcription = await transcribeAudio(filePath);
        console.log("Message: ", transcription);
        const gptResponse = await generateResponse(transcription);
        const audioBuffer = await synthesizeSpeech(gptResponse);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': 'inline; filename=response.mp3',
        });
        res.send(audioBuffer);
    } catch (error) {
        console.error('Error in voice flow:', error);
        res.status(500).json({ error: 'Voice flow failed.' });
}
};

export default handleVoiceFlow;