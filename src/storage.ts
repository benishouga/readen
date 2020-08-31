import { useStorage } from "./chrome-ext-hooks";
import { MeaningRow } from "./lib/converter";
import { useMemo } from "react";

type ReadenStorage = {
  dictionary: Map<string, MeaningRow[]>;
  indexes: Map<string, string[]>;
};

export function useReadenStorage(): {
  storage?: ReadenStorage;
  updateStorage: (storage: Partial<ReadenStorage>) => Promise<void>;
  clearStorage: () => Promise<void>;
} {
  const { storage, updateStorage, clearStorage } = useStorage();

  const parsedStorage = useMemo<ReadenStorage | undefined>(() => {
    console.time("parsedStorage");
    const dictionary: Map<string, MeaningRow[]> = new Map();
    const indexes: Map<string, string[]> = new Map();
    try {
      if (storage) {
        JSON.parse(storage.dictionary).map(([key, value]: any) => dictionary.set(key, value));
        JSON.parse(storage.indexes).map(([key, value]: any) => indexes.set(key, value));
        console.timeEnd("parsedStorage");
        return { dictionary, indexes };
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }, [storage]);

  return {
    storage: parsedStorage as ReadenStorage,
    updateStorage: (storage: Partial<ReadenStorage>) => {
      return updateStorage({
        dictionary: storage.dictionary && JSON.stringify(Array.from(storage.dictionary.entries())),
        indexes: storage.indexes && JSON.stringify(Array.from(storage.indexes.entries())),
      });
    },
    clearStorage,
  };
}
