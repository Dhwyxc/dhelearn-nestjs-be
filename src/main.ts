import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('PORT');

  app.useGlobalPipes(new ValidationPipe({
    // whitelist: true,
    forbidNonWhitelisted: true,
    transform:true
  }));

  app.setGlobalPrefix('api/v1', {exclude: ['']}); // Set global prefix for all routes
  app.enableCors(); // Enable CORS for all routes

  // Swagger setup
  const configSwagger = new DocumentBuilder()
    .setTitle('Dh Elearn API')
    .setDescription('API documentation for Dh Elearn')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(port);
}
bootstrap();
