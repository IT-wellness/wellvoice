import express from 'express';
import crypto from 'crypto';
// import { twimlResponseForAssistant } from '../utils/telnyxResponseBuilder.js';
import { xmlBuilder } from '../utils/telnyxXml.js';

const router = express.Router();

router.post('/webhook', async (req, res) => {
    const { event_type: event } = req.body.data || {};
     switch (event) {
    case 'call.answered': {
      // Tell Telnyx to start streaming audio to your real‑time WS endpoint
      const xml = xmlBuilder.startStream({
        url: `wss://wellvoice.wellnessextract.com/ws/ai-stream`,
      });
      return res.type('text/xml').send(xml);
    }

    // You can handle media.start/media.end or call.hangup as needed
    default:
      return res.sendStatus(200);
  }
});

export default router;