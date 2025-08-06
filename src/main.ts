import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors();

  // Get port from environment (Render sets this automatically)
  const port = process.env.PORT || 3000;

  // Listen on all interfaces (0.0.0.0) for Render deployment
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
