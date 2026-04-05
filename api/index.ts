// api/index.ts
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

const SWAGGER_TAG_ORDER = ['auth', 'health', 'institutions'];

function sortOpenApiTags(document: {
  tags?: { name: string; description?: string }[];
}): void {
  const existing = document.tags ?? [];
  const byName = new Map(existing.map((t) => [t.name, t]));
  const ordered: { name: string; description?: string }[] = [];
  for (const name of SWAGGER_TAG_ORDER) {
    const t = byName.get(name);
    if (t) ordered.push(t);
  }
  for (const t of existing) {
    if (!SWAGGER_TAG_ORDER.includes(t.name)) ordered.push(t);
  }
  document.tags = ordered;
}

let cachedApp: INestApplication;

async function createApp(): Promise<INestApplication> {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Presenly API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-institution-id',
        in: 'header',
        description: 'ID institusi untuk rute /institutions/me (sementara)',
      },
      'institution-id',
    )
    .addTag('auth', 'Autentikasi publik (register, login, Google)')
    .addTag('health', 'Kesehatan layanan')
    .addTag('institutions', 'Institusi / tenant')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  });
  sortOpenApiTags(document);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.init();
  cachedApp = app;
  return app;
}

export default async (req: any, res: any) => {
  const app = await createApp();
  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter(req, res);
};
