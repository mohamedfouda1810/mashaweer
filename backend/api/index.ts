import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import { AppModule } from '../src/app.module';

let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Global prefix
  nestApp.setGlobalPrefix('api');

  // Enable CORS
  const allowedOrigins = (
    process.env.FRONTEND_URL || 'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim());

  nestApp.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  });

  // Global validation pipe
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await nestApp.init();

  cachedServer = serverlessExpress({ app: expressApp });
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (error: any) {
    console.error('Vercel Bootstrap Error:', error);
    res.status(500).json({
      message: 'Bootstrap failed',
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}
