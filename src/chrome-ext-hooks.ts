import { useState, useEffect } from "react";

export function useStorage() {
  const [storage, setStorage] = useState<{ [key: string]: any } | null>(null);
  useEffect(() => {
    chrome.storage.local.get((item) => setStorage(item));
  }, []);

  return {
    storage,
    updateStorage: (item: { [key: string]: any }) => {
      const next = { ...storage, ...item };
      chrome.storage.local.set(next);
      setStorage(next);
    },
  };
}
