import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cors
  app.enableCors({
    origin: '*', // Whitelists specific domains
    credentials: true,
  });

  // Helmet for secure headers
  app.use(helmet());

  // Compression for responses
  app.use(compression());

  /**
   * rate limiting
   * app.use(rateLimit({
   * windowsMs: 15 * 60 * 1000, 15mins
   * max: 100, limits each IP with maximum of 100 requests per window}))
   */

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips unknown props
      forbidNonWhitelisted: true, // Throws error if unknown props are sent
      transform: true, // Automatically transforms payloads to DTO classes
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Broach API')
    .setDescription('API documentation for Broach project')
    .setVersion('1.0')
    .addBearerAuth() // enables JWT auth in Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  //console.log('Current DATABASE_URL:', process.env.DATABASE_URL);
  //console.log('NODE_ENV:', process.env.NODE_ENV);
}
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
