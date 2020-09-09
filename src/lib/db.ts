import { openDB, DBSchema, deleteDB } from "idb";
import { MeaningRow } from "./converter";

const DB_NAME = "db";

interface ReadenDBSchema extends DBSchema {
  dictionary: { key: string; value: { word: string; meanings: MeaningRow[] }; indexes: { word: string } };
}

export const openDatabase = async () => {
  const db = await openDB<ReadenDBSchema>(DB_NAME, 1, {
    upgrade: (db) => {
      db.createObjectStore("dictionary", { keyPath: "word" });
    },
  });
  return db;
};

export const deleteDatabase = async () => await deleteDB(DB_NAME);
