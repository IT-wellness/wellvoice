import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"

const VoiceAgentWidget = () => {
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const prepareRecorder = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 44100,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }});

                streamRef.current = stream;
            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, {type: 'audio/webm'});
                chunksRef.current = [];
                setLoading(true);
                await sendAudio(blob);
                setLoading(false);
            };

            mediaRecorderRef.current = recorder;
        } catch (err) {
            console.error("Microphone access denied", err);
            alert("Microphone access denied");
        }
    };

    prepareRecorder();
    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
    };
  }, [open]);

  const sendAudio = async (audioBlob) => {
    try {
        const fd = new FormData();
        fd.append('audio', audioBlob, 'recording.webm');
        const resp = await fetch(
            "http://localhost:5000/api/voice/process", {
                method: "POST",
                body: fd
            }
        );

        if (!resp.ok) {
            console.error("Backend returned", resp.status);
            return;
        }

        const arrayBuffer = await resp.arrayBuffer();
        const audioUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: "audio/mpeg" }));
        const audio = new Audio(audioUrl);
        audio.play();
    } catch (err) {
        console.error("Failed to send audio", err);
    }
  };

  const handleMicClick = () => {
    if (!mediaRecorderRef.current) return;

    if (recording) {
        // setRecording(false);
        setTimeout(() => {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }, 500);
    } else {
        chunksRef.current = [];
        mediaRecorderRef.current.start();
        setRecording(true);
    }
  };


    return (
    <>
        <button
            className='fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-xl hover:scale-105 active:scale-95 transition-transform'
            onClick={() => setOpen(!open)}
            title="WellVoice"
        >
            {open ? "x" : "🤖"}
        </button>

        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-24 right-6 w-72 bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center gap-4"
                >
                    <h2 className="font-semibold text-lg">Wellness Extract AI Voice Agent</h2>
            <button
              onClick={handleMicClick}
              disabled={loading}
              className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl shadow-lg ${
                recording ? "bg-red-500 animate-pulse" : "bg-green-500"
              }`}
            >
              {recording ? "■" : "🎤"}
            </button>
            <p className="text-sm text-center text-gray-500">
              {loading
                ? "Processing..."
                : recording
                ? "Listening… release to send"
                : "Click the mic, speak, and hear the reply"}
            </p>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  )
}

export default VoiceAgentWidget;