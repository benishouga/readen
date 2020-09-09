import React from "react";
import produce from "immer";

import { createTinyContext } from "tiny-context";

import { Converter } from "./lib/converter";
import { openDatabase, deleteDatabase } from "./lib/db";

const dbOpeningPromise = openDatabase();

type State = { count: number; loading: boolean; reseted: boolean };

const readFileText = async (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsText(file, "shift-jis");
  });

export class Actions {
  async init(state: State) {
    const db = await dbOpeningPromise;
    const count = await db.transaction("dictionary", "readonly").store.count();
    return produce(state, (draft) => {
      draft.count = count;
    });
  }

  async deleteDatabase(state: State) {
    deleteDatabase();
    return produce(state, (draft) => {
      draft.reseted = true;
    });
  }

  async clear(state: State) {
    const db = await dbOpeningPromise;
    db.clear("dictionary");
    const count = await db.count("dictionary");
    return produce(state, (draft) => {
      draft.count = count;
    });
  }

  async *register(state: State, file: File) {
    state = yield produce(state, (draft) => {
      draft.loading = true;
    });
    const db = await dbOpeningPromise;
    const text = await readFileText(file);
    const converter = new Converter();
    const tasks = text
      .split("\n")
      .filter((line) => line)
      .map((line) => async () => {
        const newRow = converter.parseRow(line);
        const transaction = db.transaction("dictionary", "readwrite");
        const store = transaction.store;
        const row = await store.get(newRow.word);
        if (row) {
          row.meanings.push(newRow.meaning);
          await store.put(row);
        } else {
          await store.add({ word: newRow.word, meanings: [newRow.meaning] });
        }
      });

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      await task();
      state = yield produce(state, (draft) => {
        draft.count = draft.count + 1;
      });
    }

    return produce(state, (draft) => {
      draft.loading = false;
    });
  }
}

const { Provider, useContext } = createTinyContext<State>().actions(new Actions());

export const useAppContext = useContext;
export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider value={{ count: 0, loading: false, reseted: false }}>{children}</Provider>
);
