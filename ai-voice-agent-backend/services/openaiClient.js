// Import OpenAI Node.js SDK
import OpenAI from 'openai';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

/**
 * Validate required environment variable before initializing the OpenAI client.
 * Throws an error during startup if the key is missing.
 */
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('❌ Missing OPENAI_API_KEY in environment variables');
}

/**
 * openai
 * -----------------------------------
 * Initializes and exports a configured OpenAI client instance.
 * This client enables access to:
 *  - Assistants API
 *  - Whisper (Speech-to-Text)
 *  - TTS (Text-to-Speech)
 *  - Embeddings
 *  - GPT chat and completions
 *
 * @see https://platform.openai.com/docs
 */
const openai = new OpenAI({ apiKey });

// Export the configured client for reuse in services
export default openai;