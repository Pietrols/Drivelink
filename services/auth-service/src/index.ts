import { config } from "./config";
import { createApp } from "./app";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";

async function main() {
  await prisma.$connect();
  console.log("Database connected");

  const app = createApp();

  const server = app.listen(config.PORT, () => {
    console.log(`Auth Service running on port ${config.PORT}`);
    console.log(`Health: http://localhost:${config.PORT}/health`);
  });

  async function shutdown() {
    console.log("Shutting down gracefully...");
    server.close(async () => {
      await prisma.$disconnect();
      await redis.quit();
      process.exit(0);
    });
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
