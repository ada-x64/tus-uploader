import path from "path";
import fastify from "fastify";
import AuthApiPlugin from "./auth-api";
import InitAdminPlugin from "./init-admin";
import ConfigPlugin from "./config";
import TusPlugin from "./tus";
import { config } from "./config";

const app = fastify({
    trustProxy: true,
    logger: { transport: { target: "@fastify/one-line-logger" } },
});

app.addHook("onRequest", (request, reply, done) => {
    console.log("Protocol:", request.protocol); // Should be 'https'
    console.log("Hostname:", request.hostname);
    console.log("Headers:", request.headers["x-forwarded-proto"]);
    done();
});

await app.register(AuthApiPlugin);
await app.register(InitAdminPlugin);
await app.register(ConfigPlugin);
await app.register(TusPlugin);
await app.register(await import("@fastify/static"), {
    root: path.join(__dirname, "../dist"),
    index: "index.html",
});

const base = path.join(config.basePath, "files");

app.listen({ port: config.port, host: config.host }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});
