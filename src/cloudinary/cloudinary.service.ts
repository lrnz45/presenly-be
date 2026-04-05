import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Pastikan environment variables ini sudah diset di file .env Anda
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Fungsi untuk upload gambar Base64 ke Cloudinary
  async uploadImageBase64(
    fileBase64: string,
    folderName: string = 'face_enrollments',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        fileBase64,
        { folder: folderName },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Cloudinary upload returned no result'));
          resolve(result.secure_url);
        },
      );
    });
  }

  // Fungsi untuk upload Buffer file (Multer) ke Cloudinary
  async uploadFile(
    file: Express.Multer.File,
    folderName: string = 'payment_proofs',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Cloudinary upload returned no result'));
          resolve(result.secure_url);
        },
      );
      upload.end(file.buffer);
    });
  }
}
