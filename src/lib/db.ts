import { openDB, DBSchema, deleteDB } from "idb";
import { MeaningRow } from "./converter";

const DB_NAME = "db";

interface ReadenDBSchema extends DBSchema {
  dictionary: { key: string; value: { word: string; meaning: MeaningRow }; indexes: { word: string } };
}

export const openDatabase = async () => {
  const db = await openDB<ReadenDBSchema>(DB_NAME, 2, {
    upgrade: (db) => {
      console.log("objectstore?");
      db.createObjectStore("dictionary", { keyPath: ["word"] });
    },
  });
  db.transaction("dictionary", "readonly");
  return db;
};

export const deleteDatabase = async () => {
  console.log("deleteDB before");
  await deleteDB(DB_NAME, {
    blocked: () => {
      console.log("blocked");
    },
  });
  console.log("deleteDB after");
};
