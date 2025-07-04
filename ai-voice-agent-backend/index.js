// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import required modules
import express from 'express';
import cors from 'cors';
import voiceRoutes from './routes/voiceRoute.js';
import voiceCallRoutes from './routes/voiceCallRoute.js';
import telnyxWebhook from './routes/telnyxWebhook.js';
import errorHandler from './middlewares/errorHandler.js'; // Custom error middleware

// Initialize Express app
const app = express();

// Apply global middleware
const corsOptions = {
  origin: ['https://wellvoice.wellnessextract.com', 'http://localhost:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 200
};

// Apply global middleware
app.use(cors(corsOptions)); // Apply CORS with the defined options
// app.use(cors()); // Enable CORS for frontend-backend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// Route registration
app.use('/api/voice', voiceRoutes);
app.use('/api/call', voiceCallRoutes);
app.use('/api/telnyx', telnyxWebhook);

// Health check route
app.get('/', (req, res) => {
  res.send({ status: 'OK', message: 'AI Voice Agent Backend is running.' });
});

// Use centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
  } else {
    console.log(`✅ Server listening on https://localhost:${PORT}`);
  }
});