import openai from "./openaiClient.js";

function cleanAssistantResponse(text) {
  return text.replace(/【[^】]+】|\[\*?†[^\]]*\]/g, '').trim();
}

export const synthesizeSpeech = async (text) => {
    const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: cleanAssistantResponse(text),
        format: 'mp3'
    });

    return Buffer.from(await response.arrayBuffer());
};