import { config as loadEnvironment } from "dotenv";
loadEnvironment({path:".env.local",quiet:true});
loadEnvironment({path:".env",quiet:true});
import { defineConfig } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://unconfigured:unconfigured@localhost:5432/unconfigured" },
});
