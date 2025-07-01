import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateResponse = async (userText) => {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: userText },
        ],
    });

    return completion.choices[0].message.content;
}

export default generateResponse;