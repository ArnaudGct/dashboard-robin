import { PrismaClient } from "../src/app/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["query", "error", "warn"],
  });

// Test de connexion
prisma
  .$connect()
  .then(() => console.log("✅ Prisma connected successfully"))
  .catch((error) => console.error("❌ Prisma connection error:", error));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
