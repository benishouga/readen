import React from "react";

export function PopupApp() {
  return (
    <div style={{ width: "200px" }}>
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
