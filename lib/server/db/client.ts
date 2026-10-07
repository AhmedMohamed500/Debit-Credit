import "server-only";
import { PrismaClient, Prisma } from "./generated/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { configuration } from "../security/env";
neonConfig.webSocketConstructor = ws;
const shared = globalThis as typeof globalThis & { appDatabase?: PrismaClient };
export function db() {
  if (shared.appDatabase) return shared.appDatabase;
  const { databaseURL } = configuration();
  const adapter =
    process.env.DATABASE_DRIVER === "postgres"
      ? new PrismaPg({ connectionString: databaseURL, max: 5 })
      : new PrismaNeon({ connectionString: databaseURL, max: 5 });
  shared.appDatabase = new PrismaClient({ adapter });
  return shared.appDatabase;
}
export type Transaction = Prisma.TransactionClient;
export const json = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export async function serial<T>(
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await db().$transaction(work, {
        isolationLevel: "Serializable",
        maxWait: 10000,
        timeout: 15000,
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        !["P2034", "P2002"].includes(error.code) ||
        attempt === 3
      )
        throw error;
    }
  }
  throw new Error("TRANSACTION_RETRY_EXHAUSTED");
}
