import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID   = process.env.ASSISTANT_ID;

const headers = {
  Authorization: `Bearer ${OPENAI_API_KEY}`,
  "OpenAI-Beta": "assistants=v2",
  "Content-Type": "application/json",
};

/**
 * Send `userText` to an Assistant thread.
 * If no threadId is supplied, a new thread is created.
 * Returns { replyText, threadId }
 */
const askAssistant = async (userText, existingThreadId = null) => {
  try {
    /* 1️⃣  Ensure thread */
    let threadId = existingThreadId;
    if (!threadId) {
      const threadRes = await axios.post(
        "https://api.openai.com/v1/threads",
        {},
        { headers }
      );
      threadId = threadRes.data.id;
    }

    /* 2️⃣  Add user message */
    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { role: "user", content: userText },
      { headers }
    );

    /* 3️⃣  Run assistant */
    const runRes = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      { assistant_id: ASSISTANT_ID },
      { headers }
    );
    const runId = runRes.data.id;

    /* 4️⃣  Poll until done (exponential back‑off) */
    let backoff = 1000;
    while (true) {
      await new Promise((r) => setTimeout(r, backoff));
      const statusRes = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        { headers }
      );
      const status = statusRes.data.status;
      if (status === "completed") break;
      if (status === "failed")   throw new Error("Assistant run failed.");
      backoff = Math.min(backoff * 1.4, 4000); // cap at 4 s
    }

    /* 5️⃣  Fetch assistant reply */
    const msgRes = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { headers }
    );

    const assistantMsg = msgRes.data.data.find((m) => m.role === "assistant");
    const replyText =
      assistantMsg?.content?.[0]?.text?.value?.trim() || "No response.";

    return { replyText, threadId };
  } catch (err) {
    console.error("❌ Assistant error:", err?.response?.data || err.message);
    throw err;
  }
};

export default askAssistant;