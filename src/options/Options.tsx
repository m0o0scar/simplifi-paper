import './Options.css';

import { useEffect, useState } from 'react';

import { LLMApiKeys } from '../shared/llm';
import { getCache, setCache } from '../shared/storage';

export const Options = () => {
  const [openAIKey, setOpenAIKey] = useState('');
  const [googleGeminiKey, setGoogleGeminiKey] = useState('');

  const save = async () => {
    const keys: LLMApiKeys = { openAIKey, googleGeminiKey };
    await setCache('apiKeys', keys);
    alert('Saved!');
  };

  const clearStorage = async () => {
    const allKeys: string[] = Object.keys(await chrome.storage.local.get());
    const keys = allKeys.filter((key) => !['apiKeys'].includes(key));
    await chrome.storage.local.remove(keys);
    alert('Storage cleared!');
  };

  useEffect(() => {
    (async () => {
      const { openAIKey = '', googleGeminiKey = '' } =
        (await getCache<LLMApiKeys>('apiKeys')) || {};

      setOpenAIKey(openAIKey);
      setGoogleGeminiKey(googleGeminiKey);
    })();
  }, []);

  return (
    <div>
      <h1>LLM API Key</h1>
      <p>
        OpenAI API Key:{' '}
        <input type="password" value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} />
      </p>
      <p>
        Google Gemini API Key:{' '}
        <input
          type="password"
          value={googleGeminiKey}
          onChange={(e) => setGoogleGeminiKey(e.target.value)}
        />
      </p>
      <p style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <button onClick={save}>Save</button>
        <button onClick={clearStorage}>Clear Storage</button>
      </p>
    </div>
  );
};

export default Options;
