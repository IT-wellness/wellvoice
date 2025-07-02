import { VoiceCallProvider } from "./context/VoiceCallProvider";
import CallBubble from "./components/CallBubble";
import CallPanel from "./components/CallPanel";

function App() {
  return (
    <VoiceCallProvider>
      <CallBubble />
      <CallPanel />
    </VoiceCallProvider>
  );
}

export default App;