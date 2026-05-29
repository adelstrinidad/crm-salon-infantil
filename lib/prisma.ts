import path from "path";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Resolve the DB connection from DATABASE_URL so dev/test/prod swap via env.
// Relative file: URLs are made absolute so a different cwd doesn't break them.
function resolveDbUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return `file:${path.resolve("dev.db")}`;
  if (url.startsWith("file:")) {
    const filePath = url.slice("file:".length);
    if (!path.isAbsolute(filePath)) return `file:${path.resolve(filePath)}`;
  }
  return url;
}

function makePrisma() {
  const adapter = new PrismaLibSql({ url: resolveDbUrl() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
