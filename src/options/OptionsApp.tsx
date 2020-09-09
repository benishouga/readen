import React from "react";
import { Converter } from "../lib/converter";
import { AppProvider, useAppContext } from "../store";
import { useEffect } from "react";

export function OptionsApp() {
  const {
    state: { loading, count, reseted },
    actions: { register, init, clear, deleteDatabase },
  } = useAppContext();

  const handler = async (files: FileList | null) => {
    if (files && files[0]) {
      console.time("readFileText");
      register(files[0]);
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (reseted) {
    return <>please reload</>;
  }

  return (
    <div>
      <br />
      <button type="button" onClick={deleteDatabase}>
        reset
      </button>
      {loading ? `loading... ${count}` : ""}
      {!count ? (
        <p>
          eijiro: <input type="file" onChange={(e) => handler(e.target.files)} />
        </p>
      ) : (
        <button type="button" onClick={clear}>
          clear
        </button>
      )}
    </div>
  );
}
