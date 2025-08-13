const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log("🔍 Testing database connection...");

        // Test the connection
        await prisma.$connect();
        console.log("✅ Database connection successful!");

        // Try a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log("✅ Database query test successful:", result);
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
