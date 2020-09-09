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
    await deleteDatabase();
    console.log("reseted");
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
    await text
      .split("\n")
      .filter((line) => line)
      .map((line) => async () => {
        const row = converter.parseRow(line);
        await db.add("dictionary", row);
      })
      .reduce((promise, next) => promise.then(next), Promise.resolve());

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
