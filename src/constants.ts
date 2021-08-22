import path from 'path';
export const SCHEMA_PATH = "./prisma/schema.prisma";
export const TEMPLATE_NAME = `fastify-typescript`;
// TODO: smells
export const TEMPLATES_FOLDER_PATH = path.resolve(__dirname, "templates", TEMPLATE_NAME);
export const PGB_SELECTIONS_FILENAME = "pgb.selections.ts";
export const ROUTES_FOLDER = "routes";
export const TOKENS_TO_IGNORE = ["id", "token", "secret", "password"];
