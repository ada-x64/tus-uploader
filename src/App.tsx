import "./index.css";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/dashboard";
import { useState } from "react";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import Tus from "@uppy/tus";

export function App() {
  const [uppy] = useState(() => new Uppy().use(Tus, { endpoint: "/files" }));
  return (
    <div className="app">
      <Dashboard uppy={uppy} />
    </div>
  );
}

export default App;
