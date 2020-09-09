import React from "react";
import ReactDOM from "react-dom";

import { OptionsApp } from "./options/OptionsApp";
import { AppProvider } from "./store";

ReactDOM.render(
  <AppProvider>
    <OptionsApp />
  </AppProvider>,
  document.getElementById("app")
);
