export function playAudio(buffer) {
  return new Promise((resolve) => {
    const url   = URL.createObjectURL(new Blob([buffer], { type: "audio/mpeg" }));
    const audio = new Audio(url);
    audio.onended  = resolve;
    audio.onerror  = resolve;
    audio.play();
  });
}

export function startWithVAD({
  stream,
  onSilence,
  threshold = 4,
  silenceMs = 1500,
  minSpeechMs = 300
}) {
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  let silenceTimer = null;
  let speechStart  = null;
  let stopped = false;

  const loop = () => {
    if (stopped) return;

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    const rms = Math.sqrt(data.reduce((s, v) => s + (v - 128) ** 2, 0) / data.length);

    const now = Date.now();

    if (rms < threshold) {
      
      if (speechStart && now - speechStart > minSpeechMs) {
        if (!silenceTimer) {
          silenceTimer = setTimeout(() => !stopped && onSilence?.(), silenceMs);
        }
      }
    } else {
      
      speechStart = speechStart || now;
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }

    requestAnimationFrame(loop);
  };

  loop();
  return () => {
    stopped = true;
    clearTimeout(silenceTimer);
    ctx.close();
  };
}