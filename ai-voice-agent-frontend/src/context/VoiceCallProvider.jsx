import { createContext, useContext, useState, useCallback } from 'react';
import useVoiceCall from "../hooks/useVoiceCall";

const VoiceCallCtx = createContext(null);

export function VoiceCallProvider({ children }) {
    const [isCalling, setIsCalling] = useState(false);

    const { busy, start, stop } = useVoiceCall({
        enabled: isCalling,
        onHangUp: () => setIsCalling(false),
    });

    const toggleCall = useCallback(() => {
        setIsCalling((prev) => {
            if (prev) stop();
            else start();
            return !prev;
        });
    }, [start, stop]);

    return (
        <VoiceCallCtx.Provider value={{ isCalling, busy, toggleCall }}>
            {children}
        </VoiceCallCtx.Provider>
    );
}

export const useVoiceCallCtx = () => useContext(VoiceCallCtx);