export const xmlBuilder = {
  startStream: ({ url }) => `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${url}" />
  </Start>
</Response>`,
};