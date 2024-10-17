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
      <p>
        <button onClick={save}>Save</button>
      </p>
    </div>
  );
};

export default Options;
