import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: "db",
    port: 5432,
    user: "kittypaw_user",
    password: "kittypaw_password",
    database: "kittypaw_db",
    ssl: false,
  },
});
