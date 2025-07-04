import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/outbound', async (req, res, next) => {
    try {
        const { toNumber } = req.body;
        if (!toNumber) return res.status(400).json({ error: 'toNumber required' });

        const response = await axios.post(
            'https://api.telnyx.com/v2/calls', {
            connection_id: process.env.TELNYX_CONNECTION_ID,
            to: toNumber,
            from: process.env.TELNYX_FROM_NUMBER,
            webhook_url: process.env.TELNYX_VOICE_WEBHOOK_URL
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
        }
    });

    res.json({
        success: true,
        call_id: response.data.data.id,
        message: 'Dialing ${toNumber}',
     });
    } catch (err) {
        console.error('❌ outbound‑call error', err.response?.data || err.message);
        next(err);
    }
});

export default router;