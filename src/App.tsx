import "./index.css";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/dashboard";
import { Suspense, useEffect, useMemo, useState } from "react";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import Tus from "@uppy/tus";
import { useStore } from "@nanostores/react";
import { authClient } from "./auth-client";
import Login from "./login";
import { ConfigSchema, type Config } from "./types";
import { Spinner } from "flowbite-react";
import { ErrorBoundary } from "react-error-boundary";

let config: Config | null = null;
let uppy: Uppy | null = null;

function configUppy() {
    if (uppy !== null) {
        return new Promise<Uppy>((res) => res(uppy!));
    }
    return fetch("./config")
        .then((resp) => resp.json())
        .then((data) => {
            config = ConfigSchema.parse(data);
            console.log("Got config -> ", config);
            let endpoint;
            if (config.basePath.endsWith("/")) {
                endpoint = config.basePath + "files";
            } else {
                endpoint = config.basePath + "/files";
            }
            uppy = new Uppy().use(Tus, { endpoint });
            return uppy;
        });
}

export function App() {
    useMemo(() => configUppy(), []);
    const authData = useStore(authClient.useSession);
    return (
        <div className="flex-1 flex flex-col justify-center items-center h-dvh">
            <Suspense fallback={<Spinner />}>
                {authData.data ? <Dashboard uppy={uppy!} /> : <Login />}
            </Suspense>
        </div>
    );
}

export default App;
