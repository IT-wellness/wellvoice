import { useVoiceCallCtx } from "../context/VoiceCallProvider";

export default function MicButton() {
  const { busy } = useVoiceCallCtx();

  return (
    <div
      title={busy ? "Processing" : "Listening"}
      className={`w-14 h-14 rounded-full shadow-lg ring-2 ${
        busy ? "bg-red-500 animate-pulse ring-red-300" : "bg-green-500 ring-green-300"
      }`}
    />
  );
}
