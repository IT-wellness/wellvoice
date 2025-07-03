import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import openai from './openaiClient.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const transcribeAudio = async (inputPath) => {
  const wavPath = inputPath.replace(path.extname(inputPath), '.wav');
  await new Promise((res, rej) =>
    ffmpeg(inputPath)
      .audioFrequency(16000)
      .audioChannels(1)
      .format('wav')
      .on('end', res)
      .on('error', rej)
      .save(wavPath)
  );

  const transcript = await openai.audio.transcriptions.create({
    file: fs.createReadStream(wavPath),
    model: 'whisper-1',
    response_format: 'text',
  });

  await fsPromises.unlink(inputPath).catch(() => {});
  await fsPromises.unlink(wavPath).catch(() => {});
  return transcript;
};