import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In production, create a single PrismaClient instance and reuse it.
// Also limit connections to prevent Supabase free tier exhaustion (max 60 connections).
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        // Add connection_limit=1 to prevent connection pool exhaustion
        // Supabase free tier allows max 60 connections
        url: process.env.DATABASE_URL + '?connection_limit=1&pool_timeout=10',
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

// Always cache the instance, even in production
globalForPrisma.prisma = db
