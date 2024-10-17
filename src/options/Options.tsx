import './Options.css';

import { useEffect, useState } from 'react';

export const Options = () => {
  const [openAIKey, setOpenAIKey] = useState('');
  const [googleGeminiKey, setGoogleGeminiKey] = useState('');

  const save = async () => {
    await chrome.storage.local.set({ apiKeys: { openAIKey, googleGeminiKey } });
    alert('Saved!');
  };

  useEffect(() => {
    (async () => {
      const { apiKeys } = await chrome.storage.local.get('apiKeys');
      if (apiKeys) {
        setOpenAIKey(apiKeys.openAIKey || '');
        setGoogleGeminiKey(apiKeys.googleGeminiKey || '');
      }
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
