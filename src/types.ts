import z from "zod";

export const ConfigSchema = z.object({
    basePath: z.string().default("/"),
    tempDir: z.string().default("./temp"),
    destination: z.string().default("./dest"),
    port: z.number().default(3000),
    host: z.ipv4().default("0.0.0.0"),
});

export type Config = z.infer<typeof ConfigSchema>;
