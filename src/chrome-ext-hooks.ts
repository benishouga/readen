import { useState, useEffect } from "react";

export function useStorage() {
  const [storage, setStorage] = useState<{ [key: string]: any }>();
  useEffect(() => {
    console.time("load storage");
    chrome.storage.local.get((item) => {
      setStorage(item);
      console.timeEnd("load storage");
    });
  }, []);

  return {
    storage,
    updateStorage: (item: { [key: string]: any }) => {
      const next = { ...storage, ...item };
      setStorage(next);
      return new Promise<void>((resolve) => chrome.storage.local.set(next, resolve));
    },
    clearStorage: () => {
      setStorage(undefined);
      return new Promise<void>((resolve) => chrome.storage.local.clear(resolve));
    },
  };
}
