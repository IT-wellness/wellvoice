import { useRef, useEffect } from "react";
import { startWithVAD } from "../utils/audio";

const SILENCE_THRESHOLD = 4;
const SILENCE_MS = 1500;

export default function useOpenMic({ enabled, onBlob }) {
  const recRef      = useRef(null);
  const streamRef   = useRef(null);
  const chunksRef   = useRef([]);
  const stopVadRef  = useRef(null);

  /* ---------- START --------------------------------------------------- */
  const start = async () => {
    // If a recorder is already active, do nothing
    if (recRef.current?.state === "recording" || !enabled) return;

    /* (Re)create MediaRecorder each turn ------------------------------- */
    const stream =
      streamRef.current ||
      (streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true }));

    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const rec = new MediaRecorder(stream, { mimeType: mime });
    recRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = (e) => e.data?.size && chunksRef.current.push(e.data);

    rec.onstop = () => {
      /* stop VAD for this turn */
      stopVadRef.current?.();
      stopVadRef.current = null;

      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      if (blob.size > 100) onBlob(blob);

      recRef.current = null;
    };

    /* ---------- VAD: stop only when genuinely recording --------------- */
    stopVadRef.current = startWithVAD({
      stream,
      threshold : SILENCE_THRESHOLD,
      silenceMs : SILENCE_MS,
      onSilence : () => {
        if (rec.state === "recording") rec.stop();
      },
    });

    rec.start();
  };

  /* ---------- STOP ---------------------------------------------------- */
  const stop = () => {
    if (recRef.current?.state === "recording") recRef.current.stop();
    recRef.current = null;
    stopVadRef.current?.();
    stopVadRef.current = null;
  };

  /* ---------- React lifecycle ---------------------------------------- */
  useEffect(() => {
    enabled ? start() : stop();
    return () => stop();
  }, [enabled]);

  return { start, stop };
}
