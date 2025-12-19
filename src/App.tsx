import "./index.css";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/dashboard";
import { useState } from "react";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import Tus from "@uppy/tus";
import { useStore } from "@nanostores/react";
import { authClient } from "./auth-client";
import Login from "./login";

export function App() {
    const authData = useStore(authClient.useSession);
    const [uppy] = useState(() => new Uppy().use(Tus, { endpoint: "/files" }));
    return (
        <div className="flex-1 flex flex-col justify-center items-center h-dvh">
            {authData.data ? <Dashboard uppy={uppy} /> : <Login />}
        </div>
    );
}

export default App;
