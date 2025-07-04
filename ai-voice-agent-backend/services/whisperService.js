// Import Node.js and external dependencies
import fs from 'fs';                           // Stream file input to OpenAI
import fsPromises from 'fs/promises';          // For file deletion (async/await)
import path from 'path';                       // Path utilities
import openai from './openaiClient.js';        // OpenAI client
import ffmpeg from 'fluent-ffmpeg';            // Audio converter
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'; // FFmpeg binary

// Use bundled FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Converts audio to Whisper-compatible format and transcribes speech to text.
 *
 * @param {string} inputPath - Path to uploaded audio (e.g., .webm)
 * @returns {Promise<string>} - Transcribed text from audio
 */
export const transcribeAudio = async (inputPath) => {
  const wavPath = inputPath.replace(path.extname(inputPath), '.wav');

  try {
    // 🎙️ Step 1: Convert to WAV (mono, 16kHz)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFrequency(16000)
        .audioChannels(1)
        .format('wav')
        .on('end', () => {
          console.log(`✅ Converted audio to WAV: ${wavPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error("❌ FFmpeg conversion failed:", err);
          reject(new Error("Audio conversion failed."));
        })
        .save(wavPath);
    });

    // 🧠 Step 2: Send to OpenAI Whisper
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(wavPath),
      model: 'whisper-1',
      response_format: 'text',
    });

    console.log("📝 Transcription successful:", transcript);
    return transcript;
  } catch (err) {
    console.error("🔥 Failed to transcribe audio:", err.message);
    throw new Error("Transcription failed: " + err.message);
  } finally {
    // 🧹 Step 3: Clean up temp files (even on error)
    try {
      await fsPromises.unlink(inputPath);
      await fsPromises.unlink(wavPath);
      console.log("🧼 Cleaned up temp audio files.");
    } catch (cleanupErr) {
      console.warn("⚠️ Failed to delete temp files:", cleanupErr.message);
    }
  }
};