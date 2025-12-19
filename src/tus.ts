import path, { dirname } from "path";
import { EVENTS, Server } from "@tus/server";
import { FileStore } from "@tus/file-store";
import { type FastifyPluginCallback } from "fastify";
import { copyFile, mkdir, rename, rm } from "fs/promises";
import { config } from "./config";

let tusServer: Server;

const init: FastifyPluginCallback = async (app) => {
    tusServer = new Server({
        path: path.join(config.basePath, "files"),
        datastore: new FileStore({ directory: config.tempDir }),
        respectForwardedHeaders: true,
    });

    tusServer.on(EVENTS.POST_FINISH, async (req, resp, up) => {
        let metadata = up.metadata;
        let source = up.storage?.path ?? "";
        let name = metadata?.["name"] || metadata?.["filename"] || "unknown";
        let type = metadata?.["type"] || metadata?.["filetype"] || "unknown";
        let prefix = type.split("/")[0] ?? "unknown";
        let relpath = metadata?.["relativePath"] || "";
        if (relpath != "") {
            relpath = dirname(relpath);
        }
        let destination = path.join(config.destination, prefix, relpath, name);
        await mkdir(dirname(destination), { recursive: true });
        try {
            await rename(source, destination);
        } catch {
            await copyFile(source, destination);
            await rm(source);
        }
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
};

export default init;
