import { LanguageModelV1 } from 'ai';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

import { getCache } from './storage';

let model: LanguageModelV1 | undefined;

export interface LLMApiKeys {
  openAIKey?: string;
  googleGeminiKey?: string;
}

export const getModel = async () => {
  if (!model) {
    const { openAIKey, googleGeminiKey } = (await getCache<LLMApiKeys>('apiKeys')) || {};

    if (openAIKey) {
      model = createOpenAI({ apiKey: openAIKey })('gpt-4o');
    } else if (googleGeminiKey) {
      model = createGoogleGenerativeAI({ apiKey: googleGeminiKey })('gemini-1.5-flash');
    } else {
      throw new Error('No LLM API key found');
    }
  }

  return model;
};
