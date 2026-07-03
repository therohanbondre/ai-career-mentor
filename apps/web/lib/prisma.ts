import { PrismaClient } from "@prisma/client"

/* 
 * Architectural Decision: Prisma Client Singleton
 * - Single instance for development
 * - Prevents connection pool exhaustion
 * - Reuses connection across requests
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
