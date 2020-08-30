import React from "react";
import { useStorage } from "../chrome-ext-hooks";
import { Converter } from "../lib/converter";

const colors = ["red", "blue", "green"];

const readFileText = async (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsText(file, "shift-jis");
  });

export function OptionsApp() {
  const { storage, updateStorage } = useStorage();
  const handler = async (files: FileList | null) => {
    if (files && files[0]) {
      console.time("readFileText");
      const text = await readFileText(files[0]);
      console.timeEnd("readFileText");
      console.time("convert");
      const conveter = new Converter();
      await conveter.convert(text);
      console.timeEnd("convert");
    }
  };

  return (
    <div>
      <p>
        eijiro: <input type="file" onChange={(e) => handler(e.target.files)} />
      </p>
      Select color:
      <br />
      {colors.map((color) => (
        <span key={color}>
          <label>
            <input
              type="radio"
              value={color}
              checked={storage?.selectedColor === color}
              onChange={() => updateStorage({ selectedColor: color })}
            />
            {color}
          </label>
          <br />
        </span>
      ))}
    </div>
  );
}
