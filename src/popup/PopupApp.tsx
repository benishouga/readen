import React from "react";
import { requestToContent } from "../chrome-ext-utils";
import { useStorage } from "../chrome-ext-hooks";

export function PopupApp() {
  const { storage } = useStorage();
  return (
    <div style={{ width: "200px" }}>
      <p>Popup App</p>
      <p>
        <button
          onClick={async () => {
            const res = await requestToContent<string>({ type: "fetch", body: "request body" });
            console.log(res);
          }}
        >
          fetch
        </button>
        <button
          onClick={async () => {
            const res = await requestToContent<string>({ type: "color", body: storage?.selectedColor });
            console.log(res);
          }}
        >
          color
        </button>
      </p>
      <p>
        <a
          style={{ textDecoration: "underline", color: "gray", cursor: "pointer" }}
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          設定
        </a>
      </p>
    </div>
  );
}
