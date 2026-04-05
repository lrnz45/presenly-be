import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/** Urutan tag di Swagger UI */
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

async function bootstrap() {
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
    // .setDescription(
    //   'REST API selaras skema PostgreSQL / Supabase. ' +
    //     'Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/google`. ' +
    //     'Setelah login gunakan **Bearer JWT**; untuk `/institutions/me` sementara bisa juga `x-institution-id`. ' +
    //     'Lingkungan: set `JWT_SECRET`, opsional `JWT_EXPIRES_IN` (mis. `7d`), `GOOGLE_CLIENT_ID` untuk Google Sign-In.',
    // )
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
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Application: http://localhost:${port}/api/v1/health`);
  // eslint-disable-next-line no-console
  console.log(`Swagger UI:  http://localhost:${port}/api/docs`);
}

bootstrap();
