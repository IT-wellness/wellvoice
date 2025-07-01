import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import voiceRoutes from './routes/voiceRoute.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/voice', voiceRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));