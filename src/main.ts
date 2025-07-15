import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('PORT');
  app.setGlobalPrefix('api/v1', {exclude: ['']}); // Set global prefix for all routes
  app.enableCors(); // Enable CORS for all routes

  await app.listen(port);
}
bootstrap();
