export const getCache = async <T>(key: string) => {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
};

export const setCache = async <T>(key: string, value: T) => {
  await chrome.storage.local.set({ [key]: value });
};

export const getCaches = async <T>(keys: string[]) => {
  return chrome.storage.local.get(keys) as Promise<{ [key: string]: T }>;
};

export const setCaches = async <T>(items: { key: string; value: T }[]) => {
  if (items.length) {
    const value = items.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
    await chrome.storage.local.set(value);
  }
};
