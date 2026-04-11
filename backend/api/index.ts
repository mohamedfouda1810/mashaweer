import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  // Lazy require to execute the perfectly compiled Nestjs output
  const { AppModule } = require('../dist/src/app.module');

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

  cachedServer = expressApp;
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight immediately — don't wait for NestJS bootstrap
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const handleRequest = await bootstrap();
    return handleRequest(req, res);
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
