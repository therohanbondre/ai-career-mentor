import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

import { assertServerEnv } from '@/config/env';

function getGoogleProvider() {
  const { googleGenerativeAiApiKey } = assertServerEnv();
  return createGoogleGenerativeAI({ apiKey: googleGenerativeAiApiKey });
}

export const geminiModel = () => getGoogleProvider()('gemini-2.0-flash');

export async function generateWithGemini(prompt: string) {
  const { text } = await generateText({
    model: geminiModel(),
    prompt,
  });

  return text;
}
