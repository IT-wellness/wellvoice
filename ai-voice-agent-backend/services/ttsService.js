// import axios from "axios";
// // import { text } from "express";

// const synthesizeSpeech = async (text) => {
//     const voiceId = 'UgBBYS2sOqTuMpoF3BR0';
//     const response = await axios.post(
//         `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
//         {
//             text,
//             model_id: 'eleven_monolingual_v1',
//             voice_settings: {
//                 stability: 0.5,
//                 similarity_boost: 0.75,
//             }
//         },
//         {
//             headers: {
//                 'xi-api-key': process.env.ELEVENLABS_API_KEY,
//                 'Content-Type': 'application/json',
//                 'Accept': 'audio/mpeg',
//         },
//         responseType: 'arraybuffer',
//     }
//     );

//     return response.data;
// };

// export default synthesizeSpeech;

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