// Import HTTP client to communicate with OpenAI API
import axios from 'axios';

// Load API credentials and Assistant ID from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

// Check for required env variables
if (!OPENAI_API_KEY || !ASSISTANT_ID) {
  throw new Error("Missing OPENAI_API_KEY or ASSISTANT_ID in environment variables.");
}

// Define common headers for all OpenAI API requests
const headers = {
  Authorization: `Bearer ${OPENAI_API_KEY}`,
  'OpenAI-Beta': 'assistants=v2',
  'Content-Type': 'application/json',
};

/**
 * askAssistant
 * -------------------------------
 * Sends user input to OpenAI's Assistant API using a thread-based conversation model.
 * Handles thread creation (if needed), message posting, run execution, polling, and final message retrieval.
 *
 * @param {string} userText - The user’s spoken/transcribed message.
 * @param {string|null} existingThreadId - Optional thread ID to continue an existing conversation.
 * @returns {Promise<{replyText: string, threadId: string}>} - Assistant's reply and updated thread ID.
 */
const askAssistant = async (userText, existingThreadId = null) => {
  try {
    let threadId = existingThreadId;

    // Step 1: Create a new thread if none provided
    if (!threadId) {
      const threadRes = await axios.post(
        'https://api.openai.com/v1/threads',
        {},
        { headers }
      );
      threadId = threadRes.data.id;
    }

    // Step 2: Post user message to the thread
    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { role: 'user', content: userText },
      { headers }
    );

    // Step 3: Start a run for the assistant
    const runRes = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      { assistant_id: ASSISTANT_ID },
      { headers }
    );

    const runId = runRes.data.id;

    // Step 4: Poll until run is complete
    let attempts = 0;
    const maxAttempts = 15;
    let status = 'queued';

    while (attempts < maxAttempts && status !== 'completed') {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + attempts * 500) // exponential backoff
      );

      const statusRes = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        { headers }
      );

      status = statusRes.data.status;

      if (status === 'failed') {
        throw new Error('Assistant run failed.');
      }

      attempts++;
    }

    if (status !== 'completed') {
      throw new Error('Assistant did not respond in time.');
    }

    // Step 5: Retrieve the latest assistant message
    const msgRes = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { headers }
    );

    const messages = msgRes.data.data;
    const assistantMsg = messages.find((m) => m.role === 'assistant');

    const replyText =
      assistantMsg?.content?.[0]?.text?.value?.trim() || 'No response.';

    return { replyText, threadId };
  } catch (err) {
    console.error('❌ askAssistant error:', err?.response?.data || err.message);
    throw new Error('Failed to process assistant response.');
  }
};

export default askAssistant;