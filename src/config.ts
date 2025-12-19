import type { FastifyPluginAsync } from "fastify";
import { readFile } from "node:fs/promises";
import z from "zod";
import fp from "fastify-plugin";
import { ConfigSchema, type Config } from "./types";

export let config: Config;

const plugin: FastifyPluginAsync = async (server) => {
    try {
        try {
            let raw = await readFile("config/config.json", {
                encoding: "utf8",
            });
            let str = JSON.parse(raw);
            config = ConfigSchema.parse(str);
            server.log.info("Successfully parsed config file.");
        } catch {
            config = ConfigSchema.parse({});
        }
    } catch (e: any) {
        if (e.issues) {
            server.log.error(z.prettifyError(e));
        } else {
        }
        server.log.error(
            "Please specify a valid configuration file at config/config.json. For more information, see the README.",
        );
        throw new Error();
    }

    server.decorate("config", config);
    server.get("/config", (req, resp) => {
        resp.send(config);
    });
};

declare module "fastify" {
    interface FastifyInstance {
        config: Config;
    }
}

export default fp(plugin, { name: "config" });
