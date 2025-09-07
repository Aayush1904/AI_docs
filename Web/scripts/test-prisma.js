#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing Prisma connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Prisma connection successful");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful. User count: ${userCount}`);
  } catch (error) {
    console.error("❌ Prisma connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
