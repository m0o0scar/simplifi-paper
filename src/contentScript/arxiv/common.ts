import { generateObject } from 'ai';
import { z } from 'zod';

import { getModel } from '../../shared/llm';
import { getCache, getCaches, setCache, setCaches } from '../../shared/storage';

export interface Paper {
  url: string;
  title: string;
  abstract: string;
}

const getStorageKey = (url: string) => {
  const { origin, pathname } = new URL(url);
  return `v2-simplified-${origin}${pathname}`;
};

const fetchPaperInfo = async (url: string): Promise<Paper> => {
  // fetch paper page html
  const response = await fetch(url);
  const html = await response.text();

  // title and abstract are in meta tags, use regex to extract them.
  // for example:
  // <meta property="og:title" content="JudgeBench: A Benchmark for Evaluating LLM-based Judges" />
  // <meta property="og:description" content="LLM-based judges have emerged as a scalable alternative ..."/>
  const title = html.match(/<meta property="og:title" content="(.*)"/)?.[1] || '';
  const abstract = html.match(/<meta property="og:description" content="(.*)"/)?.[1] || '';

  return { url, title, abstract };
};

const askLLMToSimplifyPaper = async (paper: Paper): Promise<Paper> => {
  const result = await generateObject({
    model: await getModel(),
    temperature: 0,
    schema: z.object({
      title: z.string(),
      abstract: z.string(),
    }),
    prompt: `Given the title and abstract of a research paper, rewrite them into concise and easy to understand title and abstract for readers with no relevant research or engineering background.
  
Title:
${paper.title}

Abstract:
${paper.abstract}`,
  });

  const { title, abstract } = result.object;
  return { url: paper.url, title, abstract };
};

const askLLMToSimplifyPapers = async (papers: Paper[]): Promise<Paper[]> => {
  const result = await generateObject({
    model: await getModel(),
    temperature: 0,
    schema: z.array(
      z.object({
        title: z.string(),
        abstract: z.string(),
      }),
    ),
    prompt: `Given the title and abstract of some research papers (each in <paper></paper> xml tag), rewrite each title and abstract into concise and easy to understand version for readers with no relevant research or engineering background.

${papers.map((p) => `<paper>Title: ${p.title}\nAbstract: ${p.abstract}</paper>`).join('\n\n')}`,
  });

  return result.object.map(({ title, abstract }, i) => ({ url: papers[i].url, title, abstract }));
};

export const simplifyPaper = async (url: string, paper?: Paper) => {
  // check if we have cached result first
  const storageKey = getStorageKey(url);
  const cached = await getCache<Paper>(storageKey);
  if (cached) return cached;

  let p = paper || (await fetchPaperInfo(url));
  if (!p) throw new Error('No title or abstract found');

  const result = await askLLMToSimplifyPaper(p);

  await setCache<Paper>(storageKey, result);
  return result;
};

export async function* simplifyPapers(urls: string[]) {
  const cached = await getCaches<Paper>(urls.map((url) => getStorageKey(url)));
  const cachedPapers = Object.values(cached);
  const cachedUrls = cachedPapers.map((p) => p.url);
  const uncachedUrls = urls.filter((url) => !cachedUrls.includes(url));

  yield* cachedPapers;

  if (uncachedUrls.length) {
    const papers: Paper[] = [];
    for (const url of uncachedUrls) {
      try {
        const info = await fetchPaperInfo(url);
        papers.push(info);
      } catch (error) {
        // ignore
      }
    }

    for (let i = 0; i < papers.length; i += 25) {
      const batch = papers.slice(i, i + 10);
      const results = await askLLMToSimplifyPapers(batch);

      await setCaches<Paper>(results.map((p) => ({ key: getStorageKey(p.url), value: p })));

      yield* results;
    }
  }
}
