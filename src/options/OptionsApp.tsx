import React from "react";
import { Converter } from "../lib/converter";
import { useReadenStorage } from "../storage";

const readFileText = async (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsText(file, "shift-jis");
  });

export function OptionsApp() {
  const { storage, updateStorage, clearStorage } = useReadenStorage();
  const handler = async (files: FileList | null) => {
    if (files && files[0]) {
      console.time("readFileText");
      const text = await readFileText(files[0]);
      console.timeEnd("readFileText");
      console.time("convert");
      const conveter = new Converter();
      const dic = await conveter.convert(text);
      console.timeEnd("convert");
      console.time("updateStorage");
      await updateStorage(dic);
      console.timeEnd("updateStorage");
    }
  };
  console.log("OptionsApp's storage", storage);
  return (
    <div>
      {!storage ? (
        <p>
          eijiro: <input type="file" onChange={(e) => handler(e.target.files)} />
        </p>
      ) : (
        <button type="button" onClick={clearStorage}>
          clear
        </button>
      )}
    </div>
  );
}
