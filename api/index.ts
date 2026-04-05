import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: any;

export default async (req: any, res: any) => {
  // Cegah inisialisasi ulang NestJS jika sudah berjalan (cold start Vercel)
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Wajib nyalakan CORS di sini untuk Vercel
    app.enableCors({
      origin: true, // Nanti bisa diganti dengan URL Nuxt kamu
      credentials: true,
    });

    await app.init();
  }

  // Ambil instance Express dari NestJS dan hubungkan ke Vercel
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};
