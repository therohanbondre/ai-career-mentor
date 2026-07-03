import { GoogleGenerativeAI } from '@google/generative-ai';

import { assertServerEnv } from '@/config/env';

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    const { googleGenerativeAiApiKey } = assertServerEnv();
    client = new GoogleGenerativeAI(googleGenerativeAiApiKey);
  }

  return client;
}

export function getGeminiModel(modelName = 'gemini-2.0-flash') {
  return getGeminiClient().getGenerativeModel({ model: modelName });
}
