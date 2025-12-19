import { betterAuth } from "better-auth";
import Database from "bun:sqlite";
import dotenv from "dotenv";
dotenv.config();

export const database = new Database("./sqlite.db");

// TODO: Passkey auth
export const auth = betterAuth({
    database,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
});
