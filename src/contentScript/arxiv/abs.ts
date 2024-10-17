import { generateObject, LanguageModel } from 'ai';
import { z } from 'zod';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

// get original title and abstract
const titleElement = document.querySelector('#content .title')!;
const abstractElement = document.querySelector('#content .abstract')!;
const title = titleElement.textContent?.trim().replace(/^Title:/, '');
const abstract = abstractElement.textContent?.trim().replace(/^Abstract:/, '');

async function simplifyPaper(): Promise<{ title: string; abstract: string }> {
  const { origin, pathname } = location;
  const storageKey = `simplified-${origin}${pathname}`;

  // check if we have cached result
  const cached = await chrome.storage.local.get(storageKey);
  if (cached[storageKey]) {
    return cached[storageKey];
  }

  let model: LanguageModel | undefined;
  const { apiKeys } = await chrome.storage.local.get('apiKeys');
  if (apiKeys.openAIKey) model = createOpenAI({ apiKey: apiKeys.openAIKey })('gpt-4o');
  else if (apiKeys.googleGeminiKey)
    model = createGoogleGenerativeAI({ apiKey: apiKeys.googleGeminiKey })('gemini-1.5-flash');
  if (!model) throw new Error(`No LLM API key found`);

  // generate simplified title & abstract
  console.log('simplifing title and abstract ...');
  const result = await generateObject({
    model,
    temperature: 0,
    schema: z.object({
      title: z.string(),
      abstract: z.string(),
    }),
    prompt: `Given the title and abstract of a research paper, rewrite them into concise and easy to understand title and abstract for readers with no relevant research or engineering background.
  
Title:
${title}

Abstract:
${abstract}`,
  });

  console.log('result:', result);

  // write result into storage
  await chrome.storage.local.set({ [storageKey]: result.object });

  return result.object;
}

async function main() {
  titleElement.textContent = `⏳ ${titleElement.textContent}`;
  abstractElement.textContent = `⏳ ${abstractElement.textContent}`;

  const simplified = await simplifyPaper();

  titleElement.outerHTML = `
    <h1 class="title" style="background-color: rgba(255,255,0,0.2)">${simplified.title}</h1>
    <h1 class="title" style="opacity: 50%;">${title}</h1>
  `;

  abstractElement.outerHTML = `
    <blockquote class="abstract" style="background-color: rgba(255,255,0,0.2)">${simplified.abstract}</blockquote>
    <blockquote class="abstract" style="opacity: 50%">${abstract}</blockquote>
  `;
}

main();
