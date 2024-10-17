import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

import { getCache } from './storage';

export interface LLMApiKeys {
  openAIKey?: string;
  googleGeminiKey?: string;
}

export const getModel = async () => {
  const { openAIKey, googleGeminiKey } = (await getCache<LLMApiKeys>('apiKeys')) || {};

  if (openAIKey) return createOpenAI({ apiKey: openAIKey })('gpt-4o');

  if (googleGeminiKey)
    return createGoogleGenerativeAI({ apiKey: googleGeminiKey })('gemini-1.5-flash');

  throw new Error('No LLM API key found');
};
