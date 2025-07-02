import { motion } from "framer-motion";
import { useVoiceCallCtx } from "../context/VoiceCallProvider";
import MicButton from "./MicButton";

export default function CallPanel() {
  const { isCalling, busy, toggleCall } = useVoiceCallCtx();
  if (!isCalling) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-24 right-4 w-64 p-4 rounded-2xl shadow-lg bg-white border"
    >
      <div className="relative">
        <h2 className="font-semibold mb-2">WellVoice Agent</h2>
        <button
          onClick={toggleCall}
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-700"
          title="End Call"
        >
          ✕
        </button>
      </div>
      <MicButton />
      <p className="text-sm text-gray-500 mt-2">
        {busy ? "Processing..." : "Listening - auto-stop on pause"}
      </p>
    </motion.div>
  );
}
