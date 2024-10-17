export const getCache = async <T>(key: string) => {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
};

export const setCache = async <T>(key: string, value: T) => {
  await chrome.storage.local.set({ [key]: value });
};
