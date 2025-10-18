"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var drizzle_kit_1 = require("drizzle-kit");
var dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
exports.default = (0, drizzle_kit_1.defineConfig)({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
