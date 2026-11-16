import "dotenv/config";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  for (const name of [
    "DATABASE_URL",
    "FRONTEND_ORIGIN",
    "YANDEX_CLIENT_ID",
    "YANDEX_CLIENT_SECRET",
    "YANDEX_REDIRECT_URI",
    "JWT_SECRET",
  ]) {
    if (!process.env[name]) throw new Error(`Missing configuration: ${name}`);
  }
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.enableCors({ origin: process.env.FRONTEND_ORIGIN, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(Number(process.env.PORT ?? 3002), "127.0.0.1");
}
void bootstrap();
