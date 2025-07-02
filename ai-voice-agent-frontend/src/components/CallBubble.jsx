import { useVoiceCallCtx } from "../context/VoiceCallProvider";

export default function CallBubble() {
    const { isCalling, toggleCall } = useVoiceCallCtx();
    return (
        <button
            onClick={toggleCall}
            className={`fixed bottom-6 right-6 rounded-full p-4 shadow-xl transition-all ${
                isCalling ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                }`}
        >
            {isCalling ? "■" : "📞"}
        </button>
    );
}