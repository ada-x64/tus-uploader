import path, { dirname } from "path";
import { EVENTS, Server } from "@tus/server";
import { FileStore } from "@tus/file-store";
import fastify from "fastify";
import { env } from "process";
import { copyFile, mkdir, rename, rm } from "fs/promises";
import AuthApiPlugin from "./auth-api";
import InitAdminPlugin from "./init-admin";

const TEMP_DIR = env["TEMP_DIR"] ?? "./temp";
const DESTINATION = env["DESTINATION"] ?? "./dest";
const PORT = env["PORT"] ?? 3000;
const HOST = env["HOST"] ?? "0.0.0.0";

const tusServer = new Server({
    path: "/files",
    datastore: new FileStore({ directory: TEMP_DIR }),
});

tusServer.on(EVENTS.POST_TERMINATE, () => {
    console.log("uh oh!");
});

tusServer.on(EVENTS.POST_FINISH, async (req, resp, up) => {
    let metadata = up.metadata;
    let source = up.storage?.path ?? "";
    let name = metadata?.["name"] || metadata?.["filename"] || "unknown";
    let type = metadata?.["type"] || metadata?.["filetype"] || "unknown";
    let prefix = type.split("/")[0] ?? "unknown";
    let relpath = metadata?.["relativePath"] || "";
    if (relpath != "") {
        let rp = relpath.split("/");
        rp.pop();
        relpath = rp.join("/");
    }
    let destination = path.join(DESTINATION, prefix, relpath, name);
    await mkdir(dirname(destination), { recursive: true });
    try {
        await rename(source, destination);
    } catch {
        await copyFile(source, destination);
        await rm(source);
    }
});

const app = fastify({
    logger: { transport: { target: "@fastify/one-line-logger" } },
});

app.addContentTypeParser(
    "application/offset+octet-stream",
    (request, payload, done) => done(null),
);
app.all("/files", (req, res) => {
    tusServer.handle(req.raw, res.raw);
});
app.all("/files/*", (req, res) => {
    tusServer.handle(req.raw, res.raw);
});

await app.register(await import("@fastify/static"), {
    root: path.join(__dirname, "../dist"),
    index: "index.html",
});

await app.register(AuthApiPlugin);
await app.register(InitAdminPlugin);

app.listen({ port: +PORT, host: HOST }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});
