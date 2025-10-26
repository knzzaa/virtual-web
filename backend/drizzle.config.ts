import { defineConfig } from "drizzle-kit";
import { config } from "./src/utils/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config.database.url,
  },
  verbose: true,
  strict: true,
});
