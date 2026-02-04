import { PrismaClient } from "@prisma/client";

/** When true, Prisma is used; when false, all DB routes use dummy data or return 503. */
export const useDatabase =
  process.env.USE_DATABASE === "true" || process.env.USE_DATABASE === "1";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

export const prisma: PrismaClient | null = useDatabase
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    })
  : null;

if (useDatabase && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
