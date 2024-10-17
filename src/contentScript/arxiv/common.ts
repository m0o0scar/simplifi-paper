import { generateObject } from 'ai';
import { z } from 'zod';

import { getModel } from '../../shared/llm';
import { getCache, setCache } from '../../shared/storage';

export interface Paper {
  title: string;
  abstract: string;
}

export const simplifyPaper = async (url: string, paper?: Paper) => {
  // check if we have cached result first
  const { origin, pathname } = new URL(url);
  const storageKey = `simplified-${origin}${pathname}`;
  const cached = await getCache<Paper>(storageKey);
  if (cached) return cached;

  let title = paper?.title;
  let abstract = paper?.abstract;
  if (!paper) {
    // fetch paper page html
    const response = await fetch(url);
    const html = await response.text();

    // title and abstract are in meta tags, use regex to extract them.
    // for example:
    // <meta property="og:title" content="JudgeBench: A Benchmark for Evaluating LLM-based Judges" />
    // <meta property="og:description" content="LLM-based judges have emerged as a scalable alternative ..."/>
    title = html.match(/<meta property="og:title" content="(.*)"/)?.[1];
    abstract = html.match(/<meta property="og:description" content="(.*)"/)?.[1];
  }

  if (!title || !abstract) throw new Error('No title or abstract found');

  const result = await generateObject({
    model: await getModel(),
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

  await setCache(storageKey, result);
  return result.object;
};
