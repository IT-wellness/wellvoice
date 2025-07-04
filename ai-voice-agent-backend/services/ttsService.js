// Import the configured OpenAI client
import openai from './openaiClient.js';

/**
 * cleanAssistantResponse
 * -----------------------------------
 * Removes special formatting tags or references like 【...】 or [†...]
 * from the assistant's text before speech synthesis to improve TTS quality.
 *
 * @param {string} text - The raw response text from the assistant.
 * @returns {string} - Cleaned text ready for TTS.
 */
function cleanAssistantResponse(text) {
  return text.replace(/【[^】]+】|\[\*?†[^\]]*\]/g, '').trim();
}

/**
 * synthesizeSpeech
 * -----------------------------------
 * Converts cleaned assistant text into speech using OpenAI's TTS API (tts-1).
 * Returns MP3 audio as a binary buffer.
 *
 * @param {string} text - The assistant’s reply (cleaned or raw).
 * @returns {Promise<Buffer>} - Audio content in MP3 format.
 */
export const synthesizeSpeech = async (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input text for TTS');
    }

    const cleanedText = cleanAssistantResponse(text);

    const response = await openai.audio.speech.create({
      model: 'tts-1',           // Text-to-Speech model
      voice: 'alloy',           // Voice preset
      input: cleanedText,
      format: 'mp3',            // Output format
    });

    // Convert and return as Node.js Buffer
    return Buffer.from(await response.arrayBuffer());

  } catch (err) {
    console.error('❌ TTS synthesis failed:', err?.response?.data || err.message);
    throw new Error('Failed to synthesize speech.');
  }
};