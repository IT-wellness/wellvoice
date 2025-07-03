import { useState, useEffect, useRef } from 'react';
import useOpenMic from './useOpenMic';
import { playAudio } from '../utils/audio';
import { cleanText } from '../utils/cleanText';

export default function useVoiceCall({ enabled, onHangUp }) {
  const [busy, setBusy]   = useState(false);
  const threadIdRef       = useRef(null);
  const micControlRef     = useRef(null);

  const onAudioBlob = async (blob) => {
    if (!blob || blob.size === 0) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "user.webm");
      if (threadIdRef.current) fd.append("thread_id", threadIdRef.current);

      const resp = await fetch("http://localhost:5000/api/voice/process", {
        method: "POST",
        body: fd,
      });
      if (!resp.ok) {
        console.error("Backend error:", await resp.text());
        return;
      }
      const newTid = resp.headers.get("Thread-Id");
      if (newTid) threadIdRef.current = newTid;

      const buf = await resp.arrayBuffer();
      await playAudio(buf);
    } finally {
      setBusy(false);
      if (enabled) micControlRef.current?.start();
    }
  };

  const { start, stop } = useOpenMic({ enabled, onBlob: onAudioBlob });
  micControlRef.current = { start };

  useEffect(() => { if (!enabled) stop(); }, [enabled]);
  return { busy, start, stop };
}