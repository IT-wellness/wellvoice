// import fs from 'fs';
// import fsPromises from 'fs/promises'
// import path from 'path'
// import openai from './openaiClient';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// const MAX_RETRIES = 5;

// const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const convertToWav = async (inputPath) => {
//   const wavPath = inputPath.replace(path.extname(inputPath), '.wav');
//   return new Promise((resolve, reject) => {
//     ffmpeg(inputPath)
//       .audioFrequency(16000)
//       .audioChannels(1)
//       .format('wav')
//       .on('end', () => resolve(wavPath))
//       .on('error', reject)
//       .save(wavPath);
//   });
// };

// const transcribeAudio = async (audioPath) => {
//   const wavPath = await convertToWav(audioPath);
//   console.log("WavPath", wavPath);
//  let attempt = 0;

//   while (attempt < MAX_RETRIES) {
//   const formData = new FormData();
//   formData.append('file', fs.createReadStream(wavPath));
//   formData.append('model', 'whisper-1');

 
//     try {
//       const response = await axios.post(
//         'https://api.openai.com/v1/audio/transcriptions',
//         formData,
//         {
//           headers: {
//             ...formData.getHeaders(),
//             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           },
//           timeout: 180000,
//           maxContentLength: Infinity,
//           maxBodyLength: Infinity,
//         }
//       );

//       // await fsPromises.unlink(audioPath).catch(() => {});
//       // await fsPromises.unlink(wavPath).catch(() => {});

//       return response.data.text;
//     } catch (err) {
//       const status = err.response?.status;
//       const retryAfter = err.response?.headers?.['retry-after'];
//       console.error(`Attempt ${attempt + 1} failed:`, status, err.message);

//       if (status === 429 && attempt < MAX_RETRIES - 1) {
//         const delay = retryAfter ? parseInt(retryAfter) * 1000 : (2 ** attempt) * 1000;
//         console.warn(`Rate limited. Retrying in ${delay / 1000}s...`);
//         await wait(delay);
//         attempt++;
//         continue;
//       }
//       console.error('Transcription error details:', err.response?.data || err.message);
      
//       // await fsPromises.unlink(audioPath).catch(() => {});
//       // await fsPromises.unlink(wavPath).catch(() => {});
//       throw err;
//     }
//   }

//   // await fsPromises.unlink(audioPath).catch(() => {});
//   // await fsPromises.unlink(wavPath).catch(() => {});

//   throw new Error('Max retry attempts reached for transcription.');
// };

// export default transcribeAudio;

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