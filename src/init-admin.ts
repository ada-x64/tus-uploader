import type { FastifyPluginCallback } from "fastify";
import { auth, database } from "./auth.js";
import fs from "fs";
import { readFile, rm } from "fs/promises";

const init: FastifyPluginCallback = async (server) => {
    // wait for db to be available
    let checkCount = 0;
    await new Promise<void>((resolve, reject) => {
        let inner = () => {
            checkCount++;
            fs.access("./sqlite.db", fs.constants.R_OK, (err) => {
                if (!err) {
                    resolve();
                } else {
                    if (checkCount > 10) {
                        server.log.error("Could not read database!");
                        reject();
                    }
                    setTimeout(inner, 100);
                }
            });
        };
        setTimeout(inner, 100);
    });
    let authfile: { email: string; password: string } | undefined = undefined;
    try {
        let password = await readFile("config/.pw", { encoding: "utf8" });
        let email = await readFile("config/.email", { encoding: "utf8" });
        authfile = { email, password };
    } catch {
        server.log.info("No admin to register.");
        return;
    }

    try {
        const admins = database.prepare("SELECT * FROM user").all();
        if (admins.length > 1) {
            server.log.warn("Multiple accounts found in the database!");
            server.log.warn(
                "If this is unintentional, please delete sqlite.db and reconfigure.",
            );
        }
        if (admins.length > 0 && authfile?.email && authfile?.password) {
            server.log.warn(
                "Found config/.pw and/or config/.email even though admin already registered.",
            );
            server.log.warn("Refusing to add new administrative account.");
            server.log.warn(
                "If you would like to reset your configuration, please delete sqlite.db and try again.",
            );
            return;
        }
    } catch {
        server.log.info("Creating administror account.");
        const init = fs.readFileSync("migrations/init.sql", "utf8");
        database.run(init);
    }
    if (authfile) {
        auth.api
            .signUpEmail({
                body: {
                    name: "admin",
                    email: authfile.email.trim(),
                    password: authfile.password.trim(),
                },
            })
            .then(async (_res) => {
                server.log.info("Successfully signed up admin!");
                await rm("config/.pw");
                await rm("config/.email");
            })
            .catch((e) => {
                server.log.error("Failed to sign up admin!");
                server.log.error(e);
            });
    }
};

export default init;
