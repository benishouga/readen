import React from "react";
import { useStorage } from "../chrome-ext-hooks";

const colors = ["red", "blue", "green"];

export function OptionsApp() {
  const { storage, updateStorage } = useStorage();
  return (
    <div>
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
