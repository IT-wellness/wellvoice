/* src/components/VoiceAgentWidget.jsx — hands‑free call version */
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SILENCE_THRESHOLD = 4;      // lower → more sensitive
const SILENCE_MS        = 1500;   // pause length before auto‑stop
const MIN_SPEECH_MS     = 300;    // ignore <300 ms blips
const TIMESLICE_MS      = 1000;   // MediaRecorder chunk size

export default function VoiceAgentWidget() {
  /* UI & session state */
  const [open,      setOpen]      = useState(false);
  const [recording, setRecording] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [threadId,  setThreadId]  = useState(null);

  /* refs */
  const mediaRecRef   = useRef(null);
  const chunksRef     = useRef([]);
  const streamRef     = useRef(null);
  const vadTimerRef   = useRef(null);
  const minSpeechRef  = useRef(null);
  const controlRef    = useRef({ start: () => {}, stop: () => {} });

  /* Boot mic + analyser once panel opens */
  useEffect(() => {
    if (!open) return;

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      /* ------- MediaRecorder -------- */
      const mime =
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

      const rec = new MediaRecorder(stream, { mimeType: mime });
      mediaRecRef.current = rec;

      rec.ondataavailable = (e) => e.data?.size && chunksRef.current.push(e.data);

      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        setLoading(true);
        await sendAudio(blob);   // STT ➜ Assistant ➜ TTS
        setLoading(false);
        if (open) controlRef.current.start(); // reopen mic
      };

      /* ------- Web‑audio analyser (VAD) ------- */
      const ctx  = new AudioContext();
      const src  = ctx.createMediaStreamSource(stream);
      const an   = ctx.createAnalyser();
      an.fftSize = 2048;
      src.connect(an);

      const detectSilence = () => {
        if (!recording) return;
        const data = new Uint8Array(an.fftSize);
        an.getByteTimeDomainData(data);
        const rms = Math.sqrt(data.reduce((s, v) => s + (v - 128) ** 2, 0) / data.length);

        const now = Date.now();
        if (rms < SILENCE_THRESHOLD) {
          if (!vadTimerRef.current) vadTimerRef.current = setTimeout(stop, SILENCE_MS);
        } else {
          // reset silence timer
          clearTimeout(vadTimerRef.current);
          vadTimerRef.current = null;
          // ensure we have at least MIN_SPEECH_MS before allowing stop
          if (!minSpeechRef.current) {
            minSpeechRef.current = now;
          } else if (now - minSpeechRef.current < MIN_SPEECH_MS) {
            clearTimeout(vadTimerRef.current);
          }
        }
        requestAnimationFrame(detectSilence);
      };

      /* ------- start / stop helpers ------- */
      const start = () => {
        chunksRef.current = [];
        rec.start(TIMESLICE_MS);
        minSpeechRef.current = null;
        setRecording(true);
        detectSilence();
      };

      const stop = () => {
        rec.requestData();
        setTimeout(() => rec.stop(), 200); // flush final chunk
        setRecording(false);
        clearTimeout(vadTimerRef.current);
      };

      controlRef.current = { start, stop };
      start(); // initial start
    })();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      controlRef.current = { start: () => {}, stop: () => {} };
      clearTimeout(vadTimerRef.current);
    };
  }, [open]);

  /* ------------ send audio to backend ------------- */
  const sendAudio = async (blob) => {
    try {
      const fd = new FormData();
      fd.append('audio', blob, 'utterance.webm');
      if (threadId) fd.append('thread_id', threadId);

      const resp = await fetch('http://localhost:5000/api/voice/process', {
        method: 'POST',
        body: fd,
      });
      if (!resp.ok) {
        console.error('Backend error', resp.status);
        return;
      }

      const newThread = resp.headers.get('Thread-Id');
      if (newThread && !threadId) setThreadId(newThread);

      const buf = await resp.arrayBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' }));
      await new Promise((res) => {
        const a = new Audio(url);
        a.onended = res;
        a.play();
      });
    } catch (err) {
      console.error('sendAudio failed:', err);
    }
  };

  /* ------------ UI ------------- */
  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-xl hover:scale-105 active:scale-95 transition-transform"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '×' : '🤖'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-xl p-5 flex flex-col items-center gap-4"
          >
            <h2 className="font-semibold text-lg text-center">WellVoice Agent</h2>

            <button
              onClick={recording ? controlRef.current.stop : controlRef.current.start}
              disabled={loading}
              className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl shadow-lg transition-all ${
                recording ? 'bg-red-500 animate-pulse' : 'bg-green-500'
              }`}
            >
              {recording ? '■' : '🎤'}
            </button>

            <p className="text-sm text-center text-gray-500">
              {loading
                ? 'Processing…'
                : recording
                ? 'Listening (auto‑stop on pause)'
                : 'Paused — tap to resume'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
