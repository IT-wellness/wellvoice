export const twimlResponseForAssistant = () => {
  return `
  <?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Start>
      <Stream url="wss://your-server/ws/ai-stream"/>
    </Start>
  </Response>`;
};